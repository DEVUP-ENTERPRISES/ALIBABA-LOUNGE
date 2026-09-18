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

// apisandbox, not sandbox: sandbox.dev.clover.com is the merchant
// dashboard you log into, and answers 401 to every API call, which reads
// exactly like a bad token. The REST host is a different name.
const BASE = process.env.CLOVER_BASE_URL || "https://apisandbox.dev.clover.com";
const MERCHANT_ID = process.env.CLOVER_MERCHANT_ID || "";
const TOKEN = process.env.CLOVER_API_TOKEN || "";
/**
 * Generous on purpose. Reads from outside the US measure 1-3s, and a write is
 * slower still — 8s was tight enough that a create succeeded on Clover while
 * we gave up waiting, which orphaned a tab on the live till. Overridable for
 * a very slow link.
 */
const TIMEOUT_MS = Number(process.env.CLOVER_TIMEOUT_MS || 25000);

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
 * The merchant's default order type, cached for the process.
 *
 * This is not cosmetic. The Register app on the physical devices lists open
 * orders by order type, so an order created over REST with no type matches no
 * tab and is invisible on every terminal — while looking perfectly fine in
 * the API and the web dashboard. That is exactly how a web order can be
 * "synced" here and still never reach the staff standing at the till.
 *
 * Resolved at runtime rather than hardcoded: the id differs per merchant, and
 * between sandbox and production.
 */
let orderTypeCache = { id: null, at: 0 };
const ORDER_TYPE_TTL_MS = 60 * 60 * 1000;

async function defaultOrderTypeId() {
  if (!isConfigured()) return null;
  if (orderTypeCache.id && Date.now() - orderTypeCache.at < ORDER_TYPE_TTL_MS) {
    return orderTypeCache.id;
  }
  try {
    const data = await call(`/v3/merchants/${MERCHANT_ID}/order_types`);
    const types = (data?.elements || []).filter((t) => !t.isDeleted && !t.isHidden);
    const chosen = types.find((t) => t.isDefault) || types[0];
    if (chosen?.id) orderTypeCache = { id: chosen.id, at: Date.now() };
    return chosen?.id || null;
  } catch (err) {
    // Not fatal — the order still reaches Clover, it just may not surface on
    // the devices. Better a hard-to-see order than no order.
    console.error(`[clover] could not read order types: ${err.message}`);
    return null;
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

  // Without an order type the devices will not list it — see the note on
  // defaultOrderTypeId.
  const orderTypeId = await defaultOrderTypeId();
  const created = await call(`/v3/merchants/${MERCHANT_ID}/orders`, {
    method: "POST",
    body: orderTypeId
      ? { ...payload.order, orderType: { id: orderTypeId } }
      : payload.order,
  });
  if (!created?.id) throw new Error("Clover did not return an order id.");

  // Bulk, so a ten-item round is one round trip rather than ten.
  //
  // Creating the tab and filling it are two calls and cannot be made atomic.
  // If the second fails we must still hand the caller the id of the tab we
  // just opened, or it is orphaned on the till: empty, uncloseable from here,
  // and invisible to a retry, which would cheerfully open another one.
  if (payload.lineItems.length > 0) {
    try {
      await call(
        `/v3/merchants/${MERCHANT_ID}/orders/${created.id}/bulk_line_items`,
        { method: "POST", body: { items: payload.lineItems } }
      );
    } catch (err) {
      err.cloverOrderId = created.id;
      err.partial = true;
      throw err;
    }
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

/**
 * Void a tab that was cancelled on our side after it had already reached
 * Clover.
 *
 * Without this a cancelled order leaves a ghost tab sitting open on the
 * terminal — nothing tells staff it is dead, and it stays chargeable. A 404
 * here (someone already deleted it by hand on the terminal) is treated as
 * success rather than an error, since the end state either way is "gone".
 */
async function deleteOrder(cloverOrderId) {
  if (!isConfigured() || !cloverOrderId) return { skipped: true };
  try {
    await call(`/v3/merchants/${MERCHANT_ID}/orders/${cloverOrderId}`, {
      method: "DELETE",
    });
    return { skipped: false, deleted: true };
  } catch (err) {
    if (err.status === 404) return { skipped: false, deleted: true, alreadyGone: true };
    throw err;
  }
}

/**
 * Clover's title for a terminal tab is "VIP5 - Main Dining Room". The part
 * before the dash is the table, which is how a mirrored tab finds its way onto
 * our floor plan. Anything we cannot parse is left blank rather than guessed —
 * a tab on the wrong table is worse than a tab with no table.
 */
function tableCodeFromTitle(title) {
  if (!title) return "";
  const [first] = String(title).split(" - ");
  const code = (first || "").trim();
  // Codes are short and alphanumeric (M6, VIP5, W4). Anything else is a label
  // someone typed by hand, not a table.
  return /^[A-Za-z]{1,4}\d{1,3}$/.test(code) ? code.toUpperCase() : "";
}

/**
 * Collapse Clover's repeated line items back into quantities.
 *
 * Clover models four waters as four identical rows. Mirroring that verbatim
 * would give the floor a wall of duplicate lines, so identical name+price
 * pairs are counted instead.
 */
function groupLineItems(elements = []) {
  const byKey = new Map();
  for (const l of elements) {
    const price = (l.price || 0) / 100;
    const key = `${l.name}::${price}::${l.item?.id || ""}`;
    const existing = byKey.get(key);
    if (existing) {
      existing.quantity += 1;
    } else {
      byKey.set(key, {
        name: l.name || "Item",
        price,
        quantity: 1,
        cloverItemId: l.item?.id || null,
      });
    }
  }
  return [...byKey.values()];
}

/**
 * Recent orders from the terminal, so the admin floor can show tabs that were
 * never placed through the website.
 *
 * Pulls a window of recent orders rather than only open ones: a tab that gets
 * paid between two polls has to be seen closing, or our mirror would show it
 * live forever.
 */
async function fetchRecentOrders(limit = 50) {
  if (!isConfigured()) return { skipped: true, orders: [] };

  const data = await call(
    `/v3/merchants/${MERCHANT_ID}/orders?limit=${limit}` +
      `&expand=lineItems&orderBy=modifiedTime%20DESC`
  );

  const orders = (data?.elements || []).map((o) => ({
    cloverOrderId: o.id,
    title: o.title || "",
    tableCode: tableCodeFromTitle(o.title),
    state: o.state || "open",
    paymentState: o.paymentState || "",
    total: (o.total || 0) / 100,
    items: groupLineItems(o.lineItems?.elements),
    openedAt: o.createdTime ? new Date(o.createdTime) : null,
    cloverModifiedAt: o.modifiedTime ? new Date(o.modifiedTime) : null,
  }));

  return { skipped: false, orders };
}

module.exports = {
  isConfigured,
  defaultOrderTypeId,
  tableCodeFromTitle,
  groupLineItems,
  fetchRecentOrders,
  toCents,
  orderTitle,
  buildCloverOrder,
  pushOrder,
  appendLineItems,
  deleteOrder,
  // exposed for diagnostics
  config: () => ({ base: BASE, merchantId: MERCHANT_ID, hasToken: Boolean(TOKEN) }),
};
