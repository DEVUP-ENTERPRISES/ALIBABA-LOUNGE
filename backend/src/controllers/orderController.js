const mongoose = require("mongoose");

const Order = require("../models/Order");
const Table = require("../models/Table");
const Menu = require("../models/Menu");
const User = require("../models/User");
const { AppError } = require("../utils/AppError");
const { asyncHandler } = require("../utils/asyncHandler");
const { buildPagination, paginationPayload } = require("../utils/query");

const OPEN_STATUSES = ["placed", "accepted", "preparing", "served"];

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

  // req.firebaseUser is set when the customer is signed in.
  let customer = null;
  let customerName = (req.body.customerName || "").trim();
  if (req.firebaseUser?.email) {
    customer = await User.findOne({ email: req.firebaseUser.email }).select("_id displayName");
    if (customer && !customerName) customerName = customer.displayName || "";
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
  await order.save();

  // A table with a live order is occupied.
  if (table.status === "available") {
    table.status = "occupied";
    await table.save();
  }

  res.status(201).json({ success: true, order: formatOrder(order) });
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
  if (status === "completed") order.completedAt = new Date();
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

module.exports = {
  createOrder,
  listOrders,
  listMyOrders,
  getOrder,
  acceptOrder,
  updateOrderStatus,
  addOrderItems,
  assignOrder,
};
