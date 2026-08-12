const express = require("express");

const adminRoutes = require("./adminRoutes");
const authRoutes = require("./authRoutes");
const dashboardRoutes = require("./dashboardRoutes");
const eventRoutes = require("./eventRoutes");
const galleryRoutes = require("./galleryRoutes");
const menuRoutes = require("./menuRoutes");
const orderRoutes = require("./orderRoutes");
const reservationRoutes = require("./reservationRoutes");
const settingRoutes = require("./settingRoutes");
const tableRoutes = require("./tableRoutes");
const reviewRoutes = require("./reviewRoutes");
const userRoutes = require("./userRoutes");

const router = express.Router();

router.get("/", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "Alibaba API foundation is ready.",
  });
});

router.use("/auth", authRoutes);
router.use("/reservations", reservationRoutes);
router.use("/menu", menuRoutes);
router.use("/orders", orderRoutes);
router.use("/events", eventRoutes);
router.use("/gallery", galleryRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/admins", adminRoutes);
router.use("/users", userRoutes);
router.use("/settings", settingRoutes);
router.use("/tables", tableRoutes);
router.use("/reviews", reviewRoutes);

module.exports = router;
