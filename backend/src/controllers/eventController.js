const Event = require("../models/Event");
const cloudinary = require("../config/cloudinary");
const { AppError } = require("../utils/AppError");
const { asyncHandler } = require("../utils/asyncHandler");
const { buildPagination, buildSort, paginationPayload } = require("../utils/query");
const { formatEvent } = require("../services/formatters");

const createEvent = asyncHandler(async (req, res) => {
  const payload = { ...req.body };

  if (req.file) {
    payload.image       = req.file.path;
    payload.cloudinaryId = req.file.filename;
  } else if (!payload.image) {
    throw new AppError("Event image is required.", 400);
  }

  // Coerce FormData strings
  if (payload.featured !== undefined) payload.featured = payload.featured === "true";

  const event = await Event.create(payload);
  res.status(201).json({ success: true, event: formatEvent(event) });
});

const getEvents = asyncHandler(async (req, res) => {
  const { page, limit, skip } = buildPagination(req.query);
  const filter = {};
  if (req.query.status)   filter.status   = req.query.status;
  if (req.query.category) filter.category = req.query.category;
  if (req.query.featured) filter.featured = req.query.featured === "true";
  if (req.query.search)   filter.$text    = { $search: req.query.search };

  const [events, total] = await Promise.all([
    Event.find(filter).sort(buildSort(req.query, "date")).skip(skip).limit(limit),
    Event.countDocuments(filter),
  ]);

  res.json({
    success: true,
    events: events.map(formatEvent),
    pagination: paginationPayload({ page, limit, total }),
  });
});

const getEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) throw new AppError("Event not found.", 404);
  res.json({ success: true, event: formatEvent(event) });
});

const updateEvent = asyncHandler(async (req, res) => {
  const payload = { ...req.body };

  if (req.file) {
    const old = await Event.findById(req.params.id).select("cloudinaryId");
    if (old?.cloudinaryId) {
      await cloudinary.uploader.destroy(old.cloudinaryId).catch(() => {});
    }
    payload.image       = req.file.path;
    payload.cloudinaryId = req.file.filename;
  }

  if (payload.featured !== undefined) payload.featured = payload.featured === "true";

  const event = await Event.findByIdAndUpdate(req.params.id, payload, {
    new: true, runValidators: true,
  });
  if (!event) throw new AppError("Event not found.", 404);
  res.json({ success: true, event: formatEvent(event) });
});

const deleteEvent = asyncHandler(async (req, res) => {
  const event = await Event.findByIdAndDelete(req.params.id);
  if (!event) throw new AppError("Event not found.", 404);

  if (event.cloudinaryId) {
    await cloudinary.uploader.destroy(event.cloudinaryId).catch(() => {});
  }

  res.status(204).send();
});

module.exports = { createEvent, getEvents, getEvent, updateEvent, deleteEvent };
