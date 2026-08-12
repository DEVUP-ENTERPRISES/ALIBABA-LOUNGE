const express = require("express");
const {
  createReservation,
  deleteReservation,
  getReservation,
  getReservations,
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

// User: view own reservations (by email matched from Firebase token)
router.get("/mine", firebaseAuth, async (req, res) => {
  const Reservation = require("../models/Reservation");
  const reservations = await Reservation.find({ email: req.firebaseUser.email }).sort({ createdAt: -1 }).limit(50);
  res.json({ success: true, reservations });
});

router.post("/", reservationCreateValidator, validateRequest, createReservation);
router.get("/", protect, requireRole("super-admin", "admin", "manager"), reservationListValidator, validateRequest, getReservations);
router.get("/:id", protect, requireRole("super-admin", "admin", "manager"), idParam, validateRequest, getReservation);
router.put("/:id", protect, requireRole("super-admin", "admin", "manager"), reservationUpdateValidator, validateRequest, updateReservation);
router.delete("/:id", protect, requireRole("super-admin", "admin", "manager"), idParam, validateRequest, deleteReservation);

module.exports = router;
