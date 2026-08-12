const express = require("express");
const { getDashboardStats } = require("../controllers/dashboardController");
const { protect, requireRole } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", protect, requireRole("super-admin", "admin", "manager"), getDashboardStats);

module.exports = router;
