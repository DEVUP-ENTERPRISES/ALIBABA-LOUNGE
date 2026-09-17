/**
 * ============================================================
 *  Ali Baba Lounge — Clover connectivity check
 * ============================================================
 *
 *  Walks the connection one step at a time and says which step failed,
 *  because Clover answers 401 for almost everything — a bad token, a wrong
 *  merchant id, a missing permission and the dashboard host instead of the
 *  API host all look identical otherwise.
 *
 *  Usage:
 *    npm run clover:check            # read-only: identity, inventory
 *    npm run clover:check -- --push  # also creates one real test tab
 * ============================================================
 */

const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });

const clover = require("../services/clover");

const BASE = process.env.CLOVER_BASE_URL || "";
const MID = process.env.CLOVER_MERCHANT_ID || "";
const TOKEN = process.env.CLOVER_API_TOKEN || "";
const PUSH = process.argv.includes("--push");

const call = async (p, init = {}) => {
  const res = await fetch(`${BASE}${p}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  });
  const text = await res.text();
  let body = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = { raw: text.slice(0, 300) };
  }
  return { status: res.status, body };
};

(async () => {
  console.log("configuration");
  console.log(`  host        ${BASE || "(unset)"}`);
  console.log(`  merchant    ${MID || "(unset)"}`);
  console.log(`  token       ${TOKEN ? TOKEN.slice(0, 8) + "…" : "(unset)"}`);

  if (/^https:\/\/sandbox\.dev\.clover\.com/.test(BASE)) {
    console.log("\n  ! That is the dashboard host, not the API host.");
    console.log("    Use https://apisandbox.dev.clover.com");
    return;
  }
  if (!BASE || !MID || !TOKEN) {
    console.log("\n  ! Missing configuration — nothing to test.");
    return;
  }

  console.log("\n1. who does this token belong to");
  const me = await call(`/v3/merchants/${MID}`);
  if (me.status !== 200) {
    console.log(`  FAIL  HTTP ${me.status}`);
    console.log("        Clover answers 401 for a wrong merchant id as well as");
    console.log("        a bad token. Check the 13-character code in the");
    console.log("        dashboard URL: clover.com/setupapp/m/<HERE>/…");
    console.log(`        ${JSON.stringify(me.body).slice(0, 200)}`);
    return;
  }
  console.log(`  PASS  ${me.body.name}  (${me.body.id})`);
  console.log(`        currency ${me.body.currency ?? "?"}, timezone ${me.body.timezone ?? "?"}`);

  console.log("\n2. can we read inventory (menu mapping depends on it)");
  const inv = await call(`/v3/merchants/${MID}/items?limit=5`);
  if (inv.status !== 200) {
    console.log(`  FAIL  HTTP ${inv.status} — grant Inventory read on the token`);
  } else {
    const items = inv.body?.elements || [];
    console.log(`  PASS  ${items.length} item(s) visible`);
    for (const i of items.slice(0, 5)) {
      console.log(`        ${i.id}  ${i.name}  ${i.price} cents`);
    }
    if (items.length === 0) {
      console.log("        (sandbox merchant has no inventory yet — fine, our");
      console.log("         lines fall back to ad-hoc and still charge right)");
    }
  }

  console.log("\n3. can we read orders");
  const ord = await call(`/v3/merchants/${MID}/orders?limit=3`);
  console.log(
    ord.status === 200
      ? `  PASS  ${(ord.body?.elements || []).length} recent order(s)`
      : `  FAIL  HTTP ${ord.status} — grant Orders read/write on the token`
  );

  if (!PUSH) {
    console.log("\nRead-only checks done. Re-run with --push to create a test tab.");
    return;
  }

  console.log("\n4. push a real tab (this creates an order on the sandbox till)");
  const fakeOrder = {
    orderNumber: 9001,
    tableCode: "M1",
    customerName: "Connectivity Check",
    customerPhone: "555-0000",
    notes: "safe to void",
    items: [
      { menuItem: "x1", title: "Regular Hookah with Foil", price: 19.99, quantity: 2 },
      { menuItem: "x2", title: "Bottle Water", price: 2, quantity: 4 },
    ],
  };

  try {
    const result = await clover.pushOrder(fakeOrder, new Map());
    console.log(`  PASS  clover order ${result.cloverOrderId}`);
    console.log(`        ${result.lineItemCount} line items, ${result.expectedTotalCents} cents expected`);

    const check = await call(`/v3/merchants/${MID}/orders/${result.cloverOrderId}?expand=lineItems`);
    const o = check.body || {};
    const lines = o.lineItems?.elements || [];
    console.log("\n5. read it back from Clover");
    console.log(`  title       ${o.title}`);
    console.log(`  state       ${o.state}`);
    console.log(`  total       ${o.total} cents`);
    console.log(`  line items  ${lines.length}`);
    for (const l of lines.slice(0, 8)) console.log(`        ${l.name}  ${l.price}`);

    const totalOk = o.total === result.expectedTotalCents;
    const titleOk = (o.title || "").includes("M1");
    console.log(
      `\n  ${totalOk ? "PASS" : "FAIL"}  total matches the app (${result.expectedTotalCents})`
    );
    console.log(`  ${titleOk ? "PASS" : "FAIL"}  the table is on the tab`);
    console.log(`  ${lines.length === 6 ? "PASS" : "FAIL"}  quantity expanded (expected 6 lines)`);
    console.log(`\n  Void order ${result.cloverOrderId} on the sandbox till when done.`);
  } catch (err) {
    console.log(`  FAIL  ${err.message}`);
  }
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
