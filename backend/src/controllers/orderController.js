const mongoose = require("mongoose");

const Order = require("../models/Order");
const Table = require("../models/Table");
const Menu = require("../models/Menu");
const User = require("../models/User");
const { AppError } = require("../utils/AppError");
const { asyncHandler } = require("../utils/asyncHandler");
const { buildPagination, paginationPayload } = require("../utils/query");

const OPEN_STATUSES = ["placed", "accepted", "preparing", "served"];

/** Flat platform fee per completed order, in USD. Never charged to the guest. */
const PLATFORM_FEE_USD = 1;

function formatOrder(order) {
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
    orders: orders.map(formatOrder),
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

  res.json({ success: true, orders: orders.map(formatOrder) });
});

const getOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate("table", "code section");
  if (!order) throw new AppError("Order not found.", 404);
  res.json({ success: true, order: formatOrder(order) });
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

  res.json({ success: true, order: formatOrder(order) });
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
  await order.save();

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

  res.json({ success: true, order: formatOrder(order) });
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

  res.json({ success: true, order: formatOrder(order) });
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

  res.json({ success: true, order: formatOrder(order) });
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
  acceptOrder,
  updateOrderStatus,
  addOrderItems,
  assignOrder,
};
