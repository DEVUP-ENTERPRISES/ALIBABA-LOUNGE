const express = require("express");

const { getPlatformBilling } = require("../controllers/billingController");
const { protect, requireRole } = require("../middleware/authMiddleware");

const router = express.Router();

// Owner only — this is what the venue owes us, not floor information.
router.get("/", protect, requireRole("super-admin"), getPlatformBilling);

module.exports = router;
