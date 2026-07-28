const Reservation = require("../models/Reservation");
const { AppError } = require("../utils/AppError");
const { asyncHandler } = require("../utils/asyncHandler");
const { buildPagination, buildSort, paginationPayload } = require("../utils/query");
const { formatReservation } = require("../services/formatters");

function normalizeStatus(status) {
  return {
    Pending: "pending",
    Approved: "confirmed",
    Rejected: "cancelled",
  }[status] || status;
}

const createReservation = asyncHandler(async (req, res) => {
  const reservation = await Reservation.create({
    name: req.body.name,
    email: req.body.email,
    phone: req.body.phone,
    date: req.body.date,
    time: req.body.time,
    guests: req.body.guests,
    specialRequest: req.body.specialRequest || "",
  });

  res.status(201).json({ success: true, reservation: formatReservation(reservation) });
});

const getReservations = asyncHandler(async (req, res) => {
  const { page, limit, skip } = buildPagination(req.query);
  const filter = {};

  if (req.query.status) filter.status = normalizeStatus(req.query.status);
  if (req.query.date) filter.date = req.query.date;
  if (req.query.search) filter.$text = { $search: req.query.search };

  const [reservations, total] = await Promise.all([
    Reservation.find(filter).sort(buildSort(req.query)).skip(skip).limit(limit),
    Reservation.countDocuments(filter),
  ]);

  res.json({
    success: true,
    reservations: reservations.map(formatReservation),
    pagination: paginationPayload({ page, limit, total }),
  });
});

const getReservation = asyncHandler(async (req, res) => {
  const reservation = await Reservation.findById(req.params.id);
  if (!reservation) throw new AppError("Reservation not found.", 404);
  res.json({ success: true, reservation: formatReservation(reservation) });
});

const updateReservation = asyncHandler(async (req, res) => {
  const payload = { ...req.body };
  if (payload.status) payload.status = normalizeStatus(payload.status);

  const reservation = await Reservation.findByIdAndUpdate(req.params.id, payload, {
    new: true,
    runValidators: true,
  });

  if (!reservation) throw new AppError("Reservation not found.", 404);
  res.json({ success: true, reservation: formatReservation(reservation) });
});

const deleteReservation = asyncHandler(async (req, res) => {
  const reservation = await Reservation.findByIdAndDelete(req.params.id);
  if (!reservation) throw new AppError("Reservation not found.", 404);
  res.status(204).send();
});

module.exports = {
  createReservation,
  getReservations,
  getReservation,
  updateReservation,
  deleteReservation,
};
