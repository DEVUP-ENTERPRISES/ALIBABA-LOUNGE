const env = require("../config/env");

/**
 * Clover — pay at the table.
 *
 * The guest orders in this app; the order appears on the Clover terminal as an
 * open tab against their table; staff take payment on the terminal exactly as
 * they do today. We never touch a card, which keeps this out of PCI scope.
 *
 * Two things about Clover shape the design:
 *
 * There is no tables API. Table layout lives inside the Clover Dining app and
 * is not exposed over REST, so seating cannot be two-way synced — anyone who
 * says otherwise is selling something. What does carry across is the order
 * title, which is what the terminal shows in its order list, so a tab arrives
 * reading "Table M1 · #1042" and staff can find it instantly.
 *
 * Money is integer cents. Sending 19.99 where Clover wants 1999 silently
 * charges a guest nineteen cents, so the conversion lives in one place and is
 * tested.
 */

const BASE = process.env.CLOVER_BASE_URL || "https://sandbox.dev.clover.com";
const MERCHANT_ID = process.env.CLOVER_MERCHANT_ID || "";
const TOKEN = process.env.CLOVER_API_TOKEN || "";
const TIMEOUT_MS = 8000;

/** Nothing is configured until all three are present. */
function isConfigured() {
  return Boolean(BASE && MERCHANT_ID && TOKEN);
}

/** Dollars to Clover's integer cents. Rounds, never truncates. */
function toCents(amount) {
  return Math.round(Number(amount || 0) * 100);
}

/**
 * What the terminal shows in its list of open orders.
 *
 * Table first because that is what staff are looking for when they walk the
 * floor; the order number is for matching against this app.
 */
function orderTitle(order) {
  const table = order.tableCode ? `Table ${order.tableCode}` : "Web order";
  return `${table} · #${order.orderNumber}`;
}

/**
 * Build exactly what Clover will be sent.
 *
 * Pure, so the payload can be asserted without a network or a merchant. Every
 * mistake worth catching here — wrong units, a lost table, a dropped quantity
 * — is visible in the returned object.
 */
function buildCloverOrder(order, itemMap = new Map()) {
  const lineItems = [];

  for (const line of order.items || []) {
    const cloverItemId = itemMap.get(String(line.menuItem));
    const qty = Math.max(1, Number(line.quantity) || 1);

    // Clover models quantity as repeated line items rather than a count, so a
    // round of four waters is four lines. Collapsing them would understate the
    // tab.
    for (let i = 0; i < qty; i++) {
      const entry = {
        name: line.title,
        price: toCents(line.price),
      };
      // Referencing a real inventory item is what makes Clover's product
      // reporting work. Without a mapping the line still charges correctly, it
      // just reports as an ad-hoc item.
      if (cloverItemId) entry.item = { id: cloverItemId };
      if (line.notes) entry.note = String(line.notes).slice(0, 255);
      lineItems.push(entry);
    }
  }

  const noteParts = [];
  if (order.customerName) noteParts.push(order.customerName);
  if (order.customerPhone) noteParts.push(order.customerPhone);
  if (order.notes) noteParts.push(order.notes);

  return {
    order: {
      state: "open",
      title: orderTitle(order),
      note: noteParts.join(" · ").slice(0, 255),
    },
    lineItems,
    // For assertions and logging: what the tab should come to, in cents.
    expectedTotalCents: lineItems.reduce((sum, l) => sum + l.price, 0),
  };
}

async function call(path, { method = "GET", body } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(`${BASE}${path}`, {
      method,
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    const text = await res.text();
    let data = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = { raw: text };
    }

    if (!res.ok) {
      const err = new Error(
        `Clover ${method} ${path} failed (${res.status}): ${
          data?.message || text?.slice(0, 200) || "no body"
        }`
      );
      err.status = res.status;
      // 4xx will fail again with the same payload; 5xx and timeouts are worth
      // another go.
      err.retryable = res.status >= 500 || res.status === 429;
      throw err;
    }
    return data;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Push one order to the terminal.
 *
 * Deliberately never called in a way that can block a guest. Clover being
 * down, slow or misconfigured must not stop someone ordering a hookah — the
 * order is ours first and Clover's second, and anything that fails here is
 * recorded on the order for a later retry.
 */
async function pushOrder(order, itemMap) {
  if (!isConfigured()) {
    return { skipped: true, reason: "Clover is not configured." };
  }

  const payload = buildCloverOrder(order, itemMap);

  const created = await call(`/v3/merchants/${MERCHANT_ID}/orders`, {
    method: "POST",
    body: payload.order,
  });
  if (!created?.id) throw new Error("Clover did not return an order id.");

  // Bulk, so a ten-item round is one round trip rather than ten.
  if (payload.lineItems.length > 0) {
    await call(
      `/v3/merchants/${MERCHANT_ID}/orders/${created.id}/bulk_line_items`,
      { method: "POST", body: { items: payload.lineItems } }
    );
  }

  return {
    skipped: false,
    cloverOrderId: created.id,
    lineItemCount: payload.lineItems.length,
    expectedTotalCents: payload.expectedTotalCents,
  };
}

/** Append a later round to a tab already on the terminal. */
async function appendLineItems(cloverOrderId, items, itemMap) {
  if (!isConfigured()) return { skipped: true };
  const { lineItems } = buildCloverOrder({ items }, itemMap);
  if (lineItems.length === 0) return { skipped: true };

  await call(`/v3/merchants/${MERCHANT_ID}/orders/${cloverOrderId}/bulk_line_items`, {
    method: "POST",
    body: { items: lineItems },
  });
  return { skipped: false, lineItemCount: lineItems.length };
}

module.exports = {
  isConfigured,
  toCents,
  orderTitle,
  buildCloverOrder,
  pushOrder,
  appendLineItems,
  // exposed for diagnostics
  config: () => ({ base: BASE, merchantId: MERCHANT_ID, hasToken: Boolean(TOKEN) }),
};
