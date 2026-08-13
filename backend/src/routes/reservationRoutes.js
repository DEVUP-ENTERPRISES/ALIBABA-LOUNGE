const express = require("express");
const { body, param, query } = require("express-validator");

const {
  createReservation,
  lookupReservation,
  deleteReservation,
  getReservation,
  getReservations,
  getAvailability,
  assignTable,
  updateReservationStatus,
  updateReservation,
} = require("../controllers/reservationController");
const { protect, requireRole } = require("../middleware/authMiddleware");
const { firebaseAuth } = require("../middleware/firebaseAuthMiddleware");
const { validateRequest } = require("../middleware/validateRequest");
const {
  idParam,
  reservationCreateValidator,
  reservationListValidator,
  reservationUpdateValidator,
} = require("../validators/reservationValidator");

const router = express.Router();

// Managers and up run the book; servers seat people but do not approve.
const floor = [protect, requireRole("super-admin", "admin", "manager")];

// ── Guest ────────────────────────────────────────────────────

router.post("/", reservationCreateValidator, validateRequest, createReservation);

// Look up a booking by the code on the confirmation. Public — nobody books
// while signed in — and answers only for an exact reference.
router.get(
  "/lookup/:reference",
  param("reference")
    .trim()
    .matches(/^AB-[A-Z0-9]{6}$/i)
    .withMessage("That does not look like a reservation code."),
  validateRequest,
  lookupReservation
);

// Signed-in guests get their own list without needing the code.
router.get("/mine", firebaseAuth, async (req, res) => {
  const Reservation = require("../models/Reservation");
  const reservations = await Reservation.find({ email: req.firebaseUser.email })
    .sort({ createdAt: -1 })
    .limit(50)
    .populate("table", "code section seats");
  const { formatReservation } = require("../services/formatters");
  res.json({ success: true, reservations: reservations.map(formatReservation) });
});

// ── Floor ────────────────────────────────────────────────────

router.get("/", ...floor, reservationListValidator, validateRequest, getReservations);

router.get(
  "/availability",
  ...floor,
  query("date").trim().notEmpty().withMessage("Pick a date."),
  query("time").trim().notEmpty().withMessage("Pick a time."),
  query("guests").optional().isInt({ min: 1, max: 100 }),
  query("reservation").optional().isMongoId(),
  validateRequest,
  getAvailability
);

router.get("/:id", ...floor, idParam, validateRequest, getReservation);

router.put(
  "/:id/table",
  ...floor,
  ...idParam,
  body("table").isMongoId().withMessage("Choose a table."),
  validateRequest,
  assignTable
);

router.put(
  "/:id/status",
  ...floor,
  ...idParam,
  body("status")
    .isIn(["pending", "confirmed", "seated", "completed", "cancelled", "no-show", "Approved", "Rejected", "Pending"])
    .withMessage("Unknown status."),
  body("table").optional().isMongoId(),
  body("statusNote").optional({ values: "falsy" }).trim().isLength({ max: 300 }),
  validateRequest,
  updateReservationStatus
);

router.put("/:id", ...floor, reservationUpdateValidator, validateRequest, updateReservation);
router.delete("/:id", ...floor, idParam, validateRequest, deleteReservation);

module.exports = router;
