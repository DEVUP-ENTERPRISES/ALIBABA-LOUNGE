const express = require("express");

const adminRoutes = require("./adminRoutes");
const authRoutes = require("./authRoutes");
const dashboardRoutes = require("./dashboardRoutes");
const eventRoutes = require("./eventRoutes");
const galleryRoutes = require("./galleryRoutes");
const inquiryRoutes = require("./inquiryRoutes");
const menuRoutes = require("./menuRoutes");
const reservationRoutes = require("./reservationRoutes");
const userRoutes = require("./userRoutes");

const router = express.Router();

router.get("/", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "Sheesh API foundation is ready.",
  });
});

router.use("/auth", authRoutes);
router.use("/reservations", reservationRoutes);
router.use("/menu", menuRoutes);
router.use("/events", eventRoutes);
router.use("/gallery", galleryRoutes);
router.use("/inquiries", inquiryRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/admins", adminRoutes);
router.use("/users", userRoutes);

module.exports = router;
