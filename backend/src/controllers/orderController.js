const mongoose = require("mongoose");

const Order = require("../models/Order");
const Table = require("../models/Table");
const Menu = require("../models/Menu");
const User = require("../models/User");
const { AppError } = require("../utils/AppError");
const { asyncHandler } = require("../utils/asyncHandler");
const { buildPagination, paginationPayload } = require("../utils/query");
const clover = require("../services/clover");
const TerminalOrder = require("../models/TerminalOrder");
const terminalSync = require("../services/terminalSync");
const floorState = require("../services/floorState");
const AuditLog = require("../models/AuditLog");

/**
 * How far back a terminal tab can have been opened and still count as part
 * of the current service. Generous, because the lounge runs past midnight
 * and a tab opened at 11pm is still live at 2am.
 */
const STALE_TAB_HOURS = 24;

const OPEN_STATUSES = ["placed", "accepted", "preparing", "served"];

/** Flat platform fee per completed order, in USD. Never charged to the guest. */
const PLATFORM_FEE_USD = 1;

/**
 * `forStaff` gates the Clover block. Without it a guest placing an order, or
 * moving their own table, would get Clover's internal order id and — worse —
 * its raw error text back in the response body. Neither is a secret exactly,
 * but an unauthenticated caller has no reason to see POS integration
 * internals, and a stack-shaped error string is exactly the kind of detail
 * that should never reach someone we have not verified is staff. Staff-only
 * routes opt in explicitly; every guest-facing call site is safe by default.
 */
function formatOrder(order, forStaff = false) {
  return {
    id: order._id,
    orderNumber: order.orderNumber,
    table: order.table?._id || order.table,
    tableCode: order.tableCode,
    tableSection: order.table?.section,
    customer: order.customer?._id || order.customer,
    customerName: order.customerName,
    customerPhone: order.customerPhone,
    items: order.items,
    status: order.status,
    assignedTo: order.assignedTo?._id || order.assignedTo,
    assignedName: order.assignedName,
    subtotal: order.subtotal,
    tax: order.tax,
    total: order.total,
    platformFee: order.platformFee,
    // Staff only — see the note above the function.
    clover:
      forStaff && order.clover
        ? {
            state: order.clover.state,
            orderId: order.clover.orderId,
            lastError: order.clover.lastError,
            paymentState: order.clover.paymentState || "",
            paidAt: order.clover.paidAt || null,
          }
        : undefined,
    notes: order.notes,
    placedAt: order.placedAt,
    acceptedAt: order.acceptedAt,
    servedAt: order.servedAt,
    completedAt: order.completedAt,
  };
}

/**
 * Build trusted line items from the menu.
 *
 * The client sends ids and quantities only. Titles, prices and categories are
 * read from the database, so a tampered payload cannot set its own price.
 */
async function buildItems(rawItems) {
  const ids = rawItems.map((i) => i.menuItem);
  const menuDocs = await Menu.find({ _id: { $in: ids }, isAvailable: true });
  const byId = new Map(menuDocs.map((d) => [String(d._id), d]));

  return rawItems.map((raw) => {
    const doc = byId.get(String(raw.menuItem));
    if (!doc) throw new AppError("One or more items are no longer available.", 400);
    return {
      menuItem: doc._id,
      title: doc.title,
      price: doc.price,
      category: doc.category,
      quantity: raw.quantity || 1,
      notes: (raw.notes || "").slice(0, 300),
    };
  });
}

/** Customer places an order against a table. */

/** Menu ids on an order, mapped to their Clover inventory id where one exists. */
async function itemMapFor(order) {
  const ids = order.items.map((i) => i.menuItem);
  const menu = await Menu.find({ _id: { $in: ids }, cloverItemId: { $ne: null } })
    .select("cloverItemId")
    .lean();
  return new Map(menu.map((m) => [String(m._id), m.cloverItemId]));
}

/**
 * Send a tab to the Clover terminal — or catch it up if it is already there.
 *
 * One function handles both, because both have to reach the same terminal
 * order and both have to fail the same safe way. Never awaited by a request:
 * Clover being down, slow or unconfigured must not stop a guest ordering or
 * a server logging a round, so this always runs after the response the
 * human is waiting on. Whatever happens is written to the order so the
 * floor can see it, rather than a tab quietly never appearing on the till.
 *
 * Items are append-only on an order — nothing removes or edits one once
 * placed — so `syncedItemCount` is a safe high-water mark. A second round
 * sends only items[syncedItemCount:], never the whole array again, or the
 * terminal would show round one's items twice.
 */
async function syncToClover(orderId) {
  const order = await Order.findById(orderId);
  if (!order) return;

  if (!clover.isConfigured()) {
    order.clover = { ...(order.clover?.toObject?.() || order.clover || {}), state: "skipped" };
    await order.save();
    return;
  }

  const already = order.clover?.syncedItemCount || 0;
  if (order.clover?.orderId && already >= order.items.length) return; // nothing new

  try {
    if (!order.clover?.orderId) {
      // A server may already have a tab running at the till for this table.
      // Opening a second one would put the same table on two bills — the
      // problem we solve for web orders, reappearing across the terminal
      // boundary. Join theirs instead, so the table keeps one bill and the
      // guest still gets an order of their own to follow.
      const liveTab = await TerminalOrder.findOne({
        table: order.table,
        state: "open",
        openedAt: { $gte: floorState.staleCutoff() },
      })
        .select("cloverOrderId")
        .lean();

      if (liveTab?.cloverOrderId) {
        const itemMap = await itemMapFor(order);
        const result = await clover.appendLineItems(
          liveTab.cloverOrderId,
          order.items,
          itemMap
        );
        order.clover = {
          orderId: liveTab.cloverOrderId,
          state: result.skipped ? "skipped" : "synced",
          syncedAt: new Date(),
          attempts: (order.clover?.attempts || 0) + 1,
          lastError: "",
          syncedItemCount: result.skipped ? already : order.items.length,
        };
      } else {
        // Nothing open at the till — this table's tab starts here.
        const itemMap = await itemMapFor(order);
        const result = await clover.pushOrder(order, itemMap);
        order.clover = {
          orderId: result.cloverOrderId || null,
          state: result.skipped ? "skipped" : "synced",
          syncedAt: new Date(),
          attempts: (order.clover?.attempts || 0) + 1,
          lastError: "",
          syncedItemCount: result.skipped ? already : order.items.length,
        };
      }
    } else {
      // Later round: only the items that have not reached Clover yet.
      const newItems = order.items.slice(already);
      const itemMap = await itemMapFor({ items: newItems });
      const result = await clover.appendLineItems(order.clover.orderId, newItems, itemMap);
      order.clover.state = result.skipped ? order.clover.state : "synced";
      order.clover.syncedAt = new Date();
      order.clover.attempts = (order.clover.attempts || 0) + 1;
      order.clover.lastError = "";
      if (!result.skipped) order.clover.syncedItemCount = order.items.length;
    }
  } catch (err) {
    order.clover = {
      ...(order.clover?.toObject?.() || order.clover || {}),
      state: "failed",
      attempts: (order.clover?.attempts || 0) + 1,
      lastError: String(err.message || err).slice(0, 500),
      // The tab was opened on the till but not filled — keep its id so a
      // retry appends to it. Without this the id is lost, the tab is
      // orphaned on the terminal, and the retry opens a second one.
      ...(err.cloverOrderId
        ? { orderId: err.cloverOrderId, syncedItemCount: 0 }
        : {}),
    };
    console.error(
      `[clover] order #${order.orderNumber}: ${err.message}` +
        (err.cloverOrderId ? ` (tab ${err.cloverOrderId} opened, not filled)` : "")
    );
  }
  await order.save();

  // The push is not awaited by the request, so an order can be cancelled
  // while it is still in flight. Re-read the status now: if it was cancelled
  // underneath us we have just opened a live, chargeable tab on the till for
  // an order that no longer exists, and nothing else will ever clean it up —
  // the cancel handler already ran and saw nothing to void.
  const current = await Order.findById(orderId).select("status clover").lean();
  if (
    current &&
    ["cancelled", "completed"].includes(current.status) &&
    current.clover?.orderId &&
    current.clover.state === "synced"
  ) {
    console.log(
      `[clover] #${order.orderNumber} was ${current.status} mid-push — voiding tab ${current.clover.orderId}`
    );
    await voidOnClover(orderId);
  }
}

/**
 * Take a cancelled order's tab off the terminal.
 *
 * A cancelled order that already reached Clover would otherwise sit there as
 * a live, chargeable tab with nothing to say it is dead — the exact opposite
 * of what "cancelled" means. Never blocks the status change itself; staff
 * see the cancellation immediately regardless of whether Clover answers.
 */
async function voidOnClover(orderId) {
  const order = await Order.findById(orderId);
  if (!order?.clover?.orderId || order.clover.state !== "synced") return;

  try {
    await clover.deleteOrder(order.clover.orderId);
    order.clover.state = "voided";
    order.clover.lastError = "";
  } catch (err) {
    order.clover.lastError = `void failed: ${String(err.message || err).slice(0, 480)}`;
    console.error(`[clover] void order #${order.orderNumber}: ${err.message}`);
  }
  await order.save();
}

/**
 * Staff-triggered retry for a tab that did not reach the terminal.
 *
 * There is no background retry job by design — an automatic one that keeps
 * firing at a broken Clover just buries the real error and makes duplicates
 * more likely. A human seeing "failed" on the floor and pressing retry is
 * both simpler and safer, and syncToClover is idempotent on the item count so
 * pressing it twice cannot double-send.
 */
const retryCloverSync = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) throw new AppError("Order not found.", 404);

  if (!clover.isConfigured()) {
    throw new AppError("Clover is not configured on this server.", 400);
  }

  await syncToClover(order._id);

  const updated = await Order.findById(order._id).populate("table", "code section");
  res.json({ success: true, order: formatOrder(updated, true) });
});

/**
 * Tabs rung up on the Clover terminal, for the floor view.
 *
 * Read-only by design: these are driven on the terminal, and writing back from
 * here would put two systems in charge of one bill.
 */
const listTerminalOrders = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.scope !== "all") {
    filter.state = "open";
    // Only this service's tabs belong on the floor view. A tab left open on
    // the terminal weeks ago is not a table with people at it — it is one
    // nobody closed, and showing it as live buries tonight's real tabs. The
    // record is kept either way; scope=all still returns it.
    filter.openedAt = { $gte: new Date(Date.now() - STALE_TAB_HOURS * 3600 * 1000) };
  }

  const orders = await TerminalOrder.find(filter)
    .sort({ openedAt: -1 })
    .limit(Math.min(Number(req.query.limit) || 100, 200))
    .lean();

  // Counted, not hidden: staff should know the terminal has forgotten tabs
  // on it, even though they do not belong on tonight's floor.
  const staleOpen = await TerminalOrder.countDocuments({
    state: "open",
    openedAt: { $lt: new Date(Date.now() - STALE_TAB_HOURS * 3600 * 1000) },
  });

  res.json({
    success: true,
    sync: terminalSync.status(),
    staleOpen,
    orders: orders.map((o) => ({
      id: o._id,
      cloverOrderId: o.cloverOrderId,
      title: o.title,
      tableCode: o.tableCode,
      table: o.table,
      state: o.state,
      paymentState: o.paymentState,
      total: o.total,
      items: o.items,
      openedAt: o.openedAt,
      lastSeenAt: o.lastSeenAt,
    })),
  });
});

/** Pull from the terminal right now instead of waiting for the next poll. */
const refreshTerminalOrders = asyncHandler(async (req, res) => {
  const result = await terminalSync.syncOnce();
  res.json({ success: true, result, sync: terminalSync.status() });
});

/**
 * Trade per day, counting the whole venue rather than half of it.
 *
 * Most of the night is rung up at the till, so a chart built only from website
 * orders would show a busy Saturday as almost empty. Both sources are counted
 * and kept separate, so the split between the two is visible — which is the
 * number that actually says whether online ordering is being used.
 *
 * Grouped in the venue's own timezone: a tab opened at 1am belongs to the
 * night before, and grouping by UTC would scatter one evening across two days.
 */
const getOrderAnalytics = asyncHandler(async (req, res) => {
  const days = Math.min(Math.max(Number(req.query.days) || 30, 1), 120);
  const since = new Date(Date.now() - days * 864e5);
  const TZ = "America/Chicago";

  // Anything before 6am belongs to the previous evening's service.
  const serviceDay = (d) => {
    if (!d) return null;
    const shifted = new Date(new Date(d).getTime() - 6 * 3600 * 1000);
    return new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(shifted);
  };

  const [webOrders, terminalOrders] = await Promise.all([
    Order.find({ placedAt: { $gte: since }, status: { $ne: "cancelled" } })
      .select("placedAt total")
      .lean(),
    TerminalOrder.find({ openedAt: { $gte: since } })
      .select("openedAt total")
      .lean(),
  ]);

  const byDay = new Map();
  const bucket = (day) => {
    if (!byDay.has(day)) {
      byDay.set(day, { day, webCount: 0, webRevenue: 0, terminalCount: 0, terminalRevenue: 0 });
    }
    return byDay.get(day);
  };

  for (const o of webOrders) {
    const d = serviceDay(o.placedAt);
    if (!d) continue;
    const b = bucket(d);
    b.webCount += 1;
    b.webRevenue += o.total || 0;
  }
  for (const o of terminalOrders) {
    const d = serviceDay(o.openedAt);
    if (!d) continue;
    const b = bucket(d);
    b.terminalCount += 1;
    b.terminalRevenue += o.total || 0;
  }

  const rows = [...byDay.values()]
    .map((b) => ({
      ...b,
      webRevenue: Math.round(b.webRevenue * 100) / 100,
      terminalRevenue: Math.round(b.terminalRevenue * 100) / 100,
      totalCount: b.webCount + b.terminalCount,
      totalRevenue: Math.round((b.webRevenue + b.terminalRevenue) * 100) / 100,
    }))
    .sort((a, b) => a.day.localeCompare(b.day));

  const todayKey = serviceDay(new Date());
  const today = rows.find((r) => r.day === todayKey) || {
    day: todayKey, webCount: 0, webRevenue: 0, terminalCount: 0,
    terminalRevenue: 0, totalCount: 0, totalRevenue: 0,
  };

  const totals = rows.reduce(
    (a, r) => ({
      webCount: a.webCount + r.webCount,
      terminalCount: a.terminalCount + r.terminalCount,
      totalCount: a.totalCount + r.totalCount,
      totalRevenue: Math.round((a.totalRevenue + r.totalRevenue) * 100) / 100,
    }),
    { webCount: 0, terminalCount: 0, totalCount: 0, totalRevenue: 0 }
  );

  const busiest = [...rows].sort((a, b) => b.totalCount - a.totalCount)[0] || null;

  res.json({
    success: true,
    days,
    timezone: TZ,
    today,
    totals,
    busiest,
    rows,
  });
});

/**
 * The audit trail, for the morning after.
 *
 * Answers the question an owner actually asks: what disappeared last night,
 * what was it worth, and who decided.
 */
const listAudit = asyncHandler(async (req, res) => {
  const { page, limit, skip } = buildPagination(req.query);
  const filter = {};
  if (req.query.action) filter.action = req.query.action;
  if (req.query.since) filter.createdAt = { $gte: new Date(req.query.since) };

  const [entries, total, totals] = await Promise.all([
    AuditLog.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    AuditLog.countDocuments(filter),
    // What the cancellations actually cost, which is the number that matters.
    AuditLog.aggregate([
      { $match: { action: { $in: ["order.cancelled", "order.auto-cancelled"] } } },
      { $group: { _id: "$action", count: { $sum: 1 }, amount: { $sum: "$amount" } } },
    ]),
  ]);

  res.json({
    success: true,
    entries: entries.map((e) => ({
      id: e._id,
      action: e.action,
      orderNumber: e.orderNumber,
      tableCode: e.tableCode,
      amount: e.amount,
      itemCount: e.itemCount,
      reason: e.reason,
      actor: e.actor,
      meta: e.meta,
      at: e.createdAt,
    })),
    summary: totals.reduce(
      (a, t) => ({
        ...a,
        [t._id]: { count: t.count, amount: Math.round(t.amount * 100) / 100 },
      }),
      {}
    ),
    pagination: paginationPayload({ page, limit, total }),
  });
});

const createOrder = asyncHandler(async (req, res) => {
  const table = await Table.findById(req.body.table);
  if (!table || !table.isActive) throw new AppError("Table not found.", 404);

  const items = await buildItems(req.body.items);

  // Flavours are free because the hookah carries the price. An order made
  // only of flavours would total $0, so require something chargeable. The
  // UI blocks this too, but the client can always be bypassed.
  if (!items.some((i) => i.price > 0)) {
    throw new AppError(
      "Add a hookah or a drink — flavours are included with a hookah.",
      400
    );
  }

  // req.firebaseUser is set when the customer is signed in.
  let customer = null;
  let customerName = (req.body.customerName || "").trim();
  if (req.firebaseUser?.email) {
    customer = await User.findOne({ email: req.firebaseUser.email }).select("_id displayName");
    if (customer && !customerName) customerName = customer.displayName || "";
  }

  // One table, one running tab.
  //
  // A guest ordering a second round must not create a second bill. Real
  // service runs a single tab per table until it is closed and paid, so a
  // new order on an occupied table is appended to the open one instead.
  // Without this, one guest at one table produced two bills that had to be
  // settled separately.
  const openTab = await Order.findOne({
    table: table._id,
    status: { $in: OPEN_STATUSES },
  }).sort({ placedAt: 1 });

  if (openTab) {
    openTab.items.push(...items);
    if (!openTab.customerName && customerName) openTab.customerName = customerName;
    if (!openTab.customer && customer) openTab.customer = customer._id;
    if (req.body.notes) {
      openTab.notes = [openTab.notes, req.body.notes.trim()].filter(Boolean).join(" · ");
    }
    // A new round means the kitchen has work again.
    if (openTab.status === "served") openTab.status = "preparing";
    openTab.recalculate();
    await openTab.save();
    void syncToClover(openTab._id);

    await openTab.populate("table", "code section");
    return res.status(200).json({
      success: true,
      merged: true,
      order: formatOrder(openTab),
    });
  }

  const order = new Order({
    table: table._id,
    tableCode: table.code,
    customer: customer?._id || null,
    customerName,
    customerPhone: (req.body.customerPhone || "").trim(),
    items,
    notes: (req.body.notes || "").trim(),
  });
  order.recalculate();

  try {
    await order.save();
  } catch (err) {
    // Someone opened a tab on this table between our check and this insert.
    // The unique index rejected us, so fold the items into theirs instead of
    // failing the guest or leaving the table with two bills.
    if (err?.code === 11000) {
      // The winning insert may not be visible to us yet, so look a few times
      // over a short window rather than failing a guest on a timing detail.
      let winner = null;
      for (let attempt = 0; attempt < 5 && !winner; attempt++) {
        if (attempt > 0) await new Promise((r) => setTimeout(r, 60 * attempt));
        winner = await Order.findOne({
          table: table._id,
          status: { $in: OPEN_STATUSES },
        }).sort({ placedAt: 1 });
      }

      if (winner) {
        winner.items.push(...items);
        if (!winner.customerName && customerName) winner.customerName = customerName;
        winner.recalculate();
        await winner.save();
        void syncToClover(winner._id);
        await winner.populate("table", "code section");
        return res.status(200).json({
          success: true,
          merged: true,
          order: formatOrder(winner),
        });
      }
    }
    throw err;
  }

  // A table with a live order is occupied.
  if (table.status === "available") {
    table.status = "occupied";
    await table.save();
  }

  // Deliberately not awaited: the guest gets their confirmation now, and
  // the terminal catches up a moment later.
  void syncToClover(order._id);

  res.status(201).json({ success: true, merged: false, order: formatOrder(order) });
});

/** Staff queue. Defaults to open orders, oldest first — the service order. */
const listOrders = asyncHandler(async (req, res) => {
  const { page, limit, skip } = buildPagination(req.query);

  const filter = {};
  if (req.query.status) filter.status = req.query.status;
  else if (req.query.scope !== "all") filter.status = { $in: OPEN_STATUSES };
  if (req.query.table) filter.table = req.query.table;
  if (req.query.assignedTo) filter.assignedTo = req.query.assignedTo;

  const [orders, total] = await Promise.all([
    Order.find(filter).sort({ placedAt: 1 }).skip(skip).limit(limit).populate("table", "code section"),
    Order.countDocuments(filter),
  ]);

  res.json({
    success: true,
    orders: orders.map((o) => formatOrder(o, true)),
    pagination: paginationPayload({ page, limit, total }),
  });
});

/** A signed-in customer's own orders. */
const listMyOrders = asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.firebaseUser.email }).select("_id");
  if (!user) return res.json({ success: true, orders: [] });

  const orders = await Order.find({ customer: user._id })
    .sort({ placedAt: -1 })
    .limit(25)
    .populate("table", "code section");

  res.json({ success: true, orders: orders.map((o) => formatOrder(o)) });
});

const getOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate("table", "code section");
  if (!order) throw new AppError("Order not found.", 404);
  res.json({ success: true, order: formatOrder(order, true) });
});

/**
 * What the guest is allowed to see about their own order.
 *
 * The confirmation screen had no way to learn that a server had accepted the
 * order, so it sat on "a server will confirm shortly" forever — the guest had
 * no idea whether anyone had picked it up. This is the endpoint it polls.
 *
 * Deliberately unauthenticated: most guests order without signing in, so
 * there is no token to check. It therefore returns no personal data — no
 * name, no phone, no notes — only the progress of the order and what was
 * ordered, all of which the guest is sitting in front of anyway.
 */
const getOrderStatus = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .select(
      "orderNumber tableCode status items subtotal total assignedName placedAt acceptedAt servedAt completedAt"
    )
    .lean();

  if (!order) throw new AppError("Order not found.", 404);

  res.json({
    success: true,
    order: {
      id: order._id,
      orderNumber: order.orderNumber,
      tableCode: order.tableCode,
      status: order.status,
      items: (order.items || []).map((i) => ({
        title: i.title,
        quantity: i.quantity,
        price: i.price,
      })),
      subtotal: order.subtotal,
      total: order.total,
      // First name only. "Accepted by Sarah" is warm; a full staff name on a
      // public endpoint is more than the guest needs.
      serverName: order.assignedName ? String(order.assignedName).split(" ")[0] : null,
      placedAt: order.placedAt,
      acceptedAt: order.acceptedAt,
      servedAt: order.servedAt,
      completedAt: order.completedAt,
    },
  });
});

/**
 * Move an open tab to a different table.
 *
 * Groups move — a bigger table frees up, or they were given the wrong number
 * to begin with. Without this the tab is welded to the first table tapped and
 * the only way out is to abandon it, which leaves the floor plan lying about
 * where people are sitting.
 *
 * The unique partial index means the destination cannot already have an open
 * tab, so that is checked first and reported in words rather than as a
 * duplicate-key error.
 */
const moveOrderTable = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) throw new AppError("Order not found.", 404);
  if (!OPEN_STATUSES.includes(order.status)) {
    throw new AppError("This order is closed and can no longer be moved.", 400);
  }

  const target = await Table.findById(req.body.table);
  if (!target) throw new AppError("Choose a table.", 404);
  if (!target.isActive) throw new AppError("That table is not in service.", 400);

  const from = String(order.table);
  if (from === String(target._id)) {
    return res.json({ success: true, order: formatOrder(order), moved: false });
  }

  const clash = await Order.findOne({
    table: target._id,
    status: { $in: OPEN_STATUSES },
  }).select("orderNumber");
  if (clash) {
    throw new AppError(
      `Table ${target.code} already has an open tab (#${clash.orderNumber}).`,
      409
    );
  }

  order.table = target._id;
  order.tableCode = target.code;
  await order.save();

  // Hand the old table back and take the new one, but never stamp over a
  // table someone has deliberately marked reserved or cleaning.
  await Table.updateOne(
    { _id: from, status: "occupied" },
    { $set: { status: "available" } }
  );
  await Table.updateOne(
    { _id: target._id, status: "available" },
    { $set: { status: "occupied" } }
  );

  const populated = await order.populate("table", "code section");
  res.json({ success: true, order: formatOrder(populated), moved: true });
});

/**
 * Claim an order.
 *
 * The status guard in the filter makes this atomic: if two workers tap accept
 * at the same moment, only the first matches `status: "placed"` and the second
 * gets a clear 409 rather than silently stealing the table.
 */
const acceptOrder = asyncHandler(async (req, res) => {
  const staff = req.admin;

  const order = await Order.findOneAndUpdate(
    { _id: req.params.id, status: "placed" },
    {
      $set: {
        status: "accepted",
        assignedTo: staff._id,
        assignedName: staff.displayName || staff.name,
        acceptedAt: new Date(),
      },
    },
    { new: true }
  ).populate("table", "code section");

  if (!order) {
    const existing = await Order.findById(req.params.id).select("status assignedName");
    if (!existing) throw new AppError("Order not found.", 404);
    throw new AppError(
      existing.assignedName
        ? `Already accepted by ${existing.assignedName}.`
        : `Order is already ${existing.status}.`,
      409
    );
  }

  res.json({ success: true, order: formatOrder(order, true) });
});

const ALLOWED_TRANSITIONS = {
  accepted: ["preparing", "cancelled"],
  preparing: ["served", "cancelled"],
  served: ["completed"],
  placed: ["cancelled"],
};

/** Advance an order along its lifecycle. */
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const order = await Order.findById(req.params.id).populate("table", "code section");
  if (!order) throw new AppError("Order not found.", 404);

  const allowed = ALLOWED_TRANSITIONS[order.status] || [];
  if (!allowed.includes(status)) {
    throw new AppError(`Cannot go from ${order.status} to ${status}.`, 400);
  }

  // Servers may only touch their own orders; managers may touch any.
  const isManager = ["super-admin", "admin", "manager"].includes(req.admin.role);
  if (!isManager && String(order.assignedTo) !== String(req.admin._id)) {
    throw new AppError("This order is assigned to another server.", 403);
  }

  order.status = status;
  if (status === "served") order.servedAt = new Date();
  if (status === "completed") {
    order.completedAt = new Date();
    // One flat fee per completed order, frozen at completion.
    order.platformFee = PLATFORM_FEE_USD;
  }
  if (status === "cancelled") order.cancelledAt = new Date();
  await order.save();

  // Money leaving the system gets a record. A cancelled order shows only that
  // it is cancelled — not what it was worth or who decided — and that is
  // precisely what gets asked the next morning.
  if (status === "cancelled" || status === "completed") {
    const minutesOpen = Math.round((Date.now() - order.placedAt.getTime()) / 60000);
    await AuditLog.record({
      action: status === "cancelled" ? "order.cancelled" : "order.completed",
      orderNumber: order.orderNumber,
      order: order._id,
      tableCode: order.tableCode,
      amount: order.total,
      itemCount: order.items.length,
      reason:
        (req.body.reason || "").trim().slice(0, 300) ||
        (status === "cancelled" ? "Cancelled by staff." : "Closed and paid."),
      actor: {
        kind: "staff",
        id: req.admin?._id || null,
        name: req.admin?.displayName || req.admin?.name || "Staff",
      },
      meta: { minutesOpen, from: allowed.length ? undefined : undefined },
    });
  }

  // Free the table once nothing is open on it.
  if (["completed", "cancelled"].includes(status)) {
    const stillOpen = await Order.countDocuments({
      table: order.table?._id || order.table,
      status: { $in: OPEN_STATUSES },
    });
    if (stillOpen === 0) {
      await Table.findByIdAndUpdate(order.table?._id || order.table, { status: "available" });
    }
  }

  // A cancelled tab must not keep sitting open and chargeable on the
  // terminal. Completed is not voided — that is the normal end of the
  // flow, staff have already charged it there.
  if (status === "cancelled") void voidOnClover(order._id);

  res.json({ success: true, order: formatOrder(order, true) });
});

/** Add items to an order already in service — a second round at the table. */
const addOrderItems = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate("table", "code section");
  if (!order) throw new AppError("Order not found.", 404);
  if (!OPEN_STATUSES.includes(order.status)) {
    throw new AppError("This order is closed.", 400);
  }

  const items = await buildItems(req.body.items);
  order.items.push(...items);
  order.recalculate();

  // A served order going back to the kitchen is preparing again.
  if (order.status === "served") order.status = "preparing";
  await order.save();
  void syncToClover(order._id);

  res.json({ success: true, order: formatOrder(order, true) });
});

/** Reassign to another server. Managers only. */
const assignOrder = asyncHandler(async (req, res) => {
  const Admin = mongoose.model("Admin");
  const staff = await Admin.findById(req.body.assignedTo).select("name displayName role isActive");
  if (!staff || !staff.isActive) throw new AppError("Staff member not found.", 404);

  const order = await Order.findByIdAndUpdate(
    req.params.id,
    { $set: { assignedTo: staff._id, assignedName: staff.displayName || staff.name } },
    { new: true }
  ).populate("table", "code section");
  if (!order) throw new AppError("Order not found.", 404);

  res.json({ success: true, order: formatOrder(order, true) });
});

/** How much each server has closed today and this month. */
const getServerStats = asyncHandler(async (req, res) => {
  const now = new Date();
  const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const mine = { assignedTo: req.admin._id, status: "completed" };
  const [today, month, openNow] = await Promise.all([
    Order.countDocuments({ ...mine, completedAt: { $gte: dayStart } }),
    Order.countDocuments({ ...mine, completedAt: { $gte: monthStart } }),
    Order.countDocuments({ assignedTo: req.admin._id, status: { $in: OPEN_STATUSES } }),
  ]);

  // Managers also see the whole floor, so they can spot who is carrying it.
  let leaderboard = [];
  if (["super-admin", "admin", "manager"].includes(req.admin.role)) {
    leaderboard = await Order.aggregate([
      { $match: { status: "completed", completedAt: { $gte: dayStart }, assignedTo: { $ne: null } } },
      { $group: { _id: "$assignedName", orders: { $sum: 1 }, revenue: { $sum: "$total" } } },
      { $sort: { orders: -1 } },
      { $limit: 8 },
    ]);
  }

  res.json({
    success: true,
    me: { today, month, openNow, name: req.admin.displayName || req.admin.name },
    leaderboard: leaderboard.map((l) => ({
      name: l._id || "Unassigned",
      orders: l.orders,
      revenue: Math.round(l.revenue * 100) / 100,
    })),
  });
});

module.exports = {
  createOrder,
  getServerStats,
  listOrders,
  listMyOrders,
  getOrder,
  getOrderStatus,
  moveOrderTable,
  retryCloverSync,
  listTerminalOrders,
  refreshTerminalOrders,
  getOrderAnalytics,
  listAudit,
  acceptOrder,
  updateOrderStatus,
  addOrderItems,
  assignOrder,
};
