const Table = require("../models/Table");
const Order = require("../models/Order");
const { AppError } = require("../utils/AppError");
const { asyncHandler } = require("../utils/asyncHandler");

function formatTable(table, openOrders = 0) {
  return {
    id: table._id,
    code: table.code,
    section: table.section,
    seats: table.seats,
    status: table.status,
    sortOrder: table.sortOrder,
    isActive: table.isActive,
    openOrders,
  };
}

/**
 * Public: the floor plan.
 *
 * Customers need this to pick where they are sitting, so it is unauthenticated
 * but only ever exposes active tables and their availability.
 */
const listTables = asyncHandler(async (req, res) => {
  const filter = { isActive: true };
  if (req.query.section) filter.section = req.query.section;
  if (req.query.all === "true") delete filter.isActive;

  const tables = await Table.find(filter).sort({ section: 1, sortOrder: 1, code: 1 });

  // How many live orders sit on each table, so staff see load at a glance.
  const counts = await Order.aggregate([
    { $match: { status: { $in: ["placed", "accepted", "preparing", "served"] } } },
    { $group: { _id: "$table", n: { $sum: 1 } } },
  ]);
  const byTable = new Map(counts.map((c) => [String(c._id), c.n]));

  res.json({
    success: true,
    tables: tables.map((t) => formatTable(t, byTable.get(String(t._id)) || 0)),
  });
});

const getTable = asyncHandler(async (req, res) => {
  const table = await Table.findById(req.params.id);
  if (!table) throw new AppError("Table not found.", 404);
  res.json({ success: true, table: formatTable(table) });
});

const createTable = asyncHandler(async (req, res) => {
  const existing = await Table.findOne({ code: String(req.body.code).toUpperCase() });
  if (existing) throw new AppError(`Table ${existing.code} already exists.`, 409);

  const table = await Table.create({
    code: req.body.code,
    section: req.body.section,
    seats: req.body.seats,
    sortOrder: req.body.sortOrder ?? 0,
  });
  res.status(201).json({ success: true, table: formatTable(table) });
});

const TABLE_FIELDS = ["code", "section", "seats", "status", "sortOrder", "isActive"];

const updateTable = asyncHandler(async (req, res) => {
  const updates = {};
  for (const f of TABLE_FIELDS) {
    if (req.body[f] !== undefined) updates[f] = req.body[f];
  }

  const table = await Table.findByIdAndUpdate(req.params.id, updates, {
    new: true,
    runValidators: true,
  });
  if (!table) throw new AppError("Table not found.", 404);
  res.json({ success: true, table: formatTable(table) });
});

/**
 * Deactivate rather than delete when a table has order history — removing it
 * would orphan those orders and corrupt past reporting.
 */
const deleteTable = asyncHandler(async (req, res) => {
  const table = await Table.findById(req.params.id);
  if (!table) throw new AppError("Table not found.", 404);

  const orderCount = await Order.countDocuments({ table: table._id });
  if (orderCount > 0) {
    table.isActive = false;
    await table.save();
    return res.json({
      success: true,
      message: `Table ${table.code} has ${orderCount} order(s) in history, so it was deactivated instead of deleted.`,
      table: formatTable(table),
    });
  }

  await table.deleteOne();
  res.json({ success: true, message: `Table ${table.code} deleted.` });
});

module.exports = {
  listTables,
  getTable,
  createTable,
  updateTable,
  deleteTable,
};
