const Menu = require("../models/Menu");
const cloudinary = require("../config/cloudinary");
const { AppError } = require("../utils/AppError");
const { asyncHandler } = require("../utils/asyncHandler");
const { buildPagination, buildSort, paginationPayload } = require("../utils/query");
const { formatMenuItem } = require("../services/formatters");

const createMenuItem = asyncHandler(async (req, res) => {
  const payload = { ...req.body };

  if (req.file) {
    payload.image       = req.file.path;
    payload.cloudinaryId = req.file.filename;
  } else if (!payload.image) {
    throw new AppError("Image is required.", 400);
  }

  // Coerce types from FormData strings
  if (payload.price)     payload.price     = Number(payload.price);
  if (payload.featured)  payload.featured  = payload.featured === "true";
  if (payload.isAvailable) payload.isAvailable = payload.isAvailable !== "false";
  if (typeof payload.tags === "string") payload.tags = JSON.parse(payload.tags || "[]");

  const item = await Menu.create(payload);
  res.status(201).json({ success: true, item: formatMenuItem(item) });
});

const getMenuItems = asyncHandler(async (req, res) => {
  const { page, limit, skip } = buildPagination(req.query);
  const filter = {};
  if (req.query.category)    filter.category    = req.query.category;
  if (req.query.subcategory) filter.subcategory  = req.query.subcategory;
  if (req.query.featured)    filter.featured     = req.query.featured === "true";
  if (req.query.isAvailable) filter.isAvailable  = req.query.isAvailable === "true";
  if (req.query.search)      filter.$text        = { $search: req.query.search };

  const [items, total] = await Promise.all([
    Menu.find(filter).sort(buildSort(req.query, "category title")).skip(skip).limit(limit),
    Menu.countDocuments(filter),
  ]);

  res.json({
    success: true,
    items: items.map(formatMenuItem),
    pagination: paginationPayload({ page, limit, total }),
  });
});

const getMenuItem = asyncHandler(async (req, res) => {
  const item = await Menu.findById(req.params.id);
  if (!item) throw new AppError("Menu item not found.", 404);
  res.json({ success: true, item: formatMenuItem(item) });
});

const updateMenuItem = asyncHandler(async (req, res) => {
  const payload = { ...req.body };

  if (req.file) {
    // Delete old Cloudinary asset
    const old = await Menu.findById(req.params.id).select("cloudinaryId");
    if (old?.cloudinaryId) {
      await cloudinary.uploader.destroy(old.cloudinaryId).catch(() => {});
    }
    payload.image       = req.file.path;
    payload.cloudinaryId = req.file.filename;
  }

  // Coerce FormData strings
  if (payload.price)    payload.price    = Number(payload.price);
  if (payload.featured !== undefined) payload.featured = payload.featured === "true";
  if (payload.isAvailable !== undefined) payload.isAvailable = payload.isAvailable !== "false";
  if (typeof payload.tags === "string") payload.tags = JSON.parse(payload.tags || "[]");

  const item = await Menu.findByIdAndUpdate(req.params.id, payload, {
    new: true, runValidators: true,
  });
  if (!item) throw new AppError("Menu item not found.", 404);
  res.json({ success: true, item: formatMenuItem(item) });
});

const deleteMenuItem = asyncHandler(async (req, res) => {
  const item = await Menu.findByIdAndDelete(req.params.id);
  if (!item) throw new AppError("Menu item not found.", 404);

  if (item.cloudinaryId) {
    await cloudinary.uploader.destroy(item.cloudinaryId).catch(() => {});
  }

  res.status(204).send();
});

module.exports = { createMenuItem, getMenuItems, getMenuItem, updateMenuItem, deleteMenuItem };
