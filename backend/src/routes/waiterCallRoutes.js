const express = require("express");
const { body, param, query } = require("express-validator");

const {
  createCall,
  getCallStatus,
  cancelCall,
  listCalls,
  acknowledgeCall,
  resolveCall,
} = require("../controllers/waiterCallController");
const { protect, requireRole } = require("../middleware/authMiddleware");
const { validateRequest } = require("../middleware/validateRequest");

const router = express.Router();

const anyStaff = [protect, requireRole("super-admin", "admin", "manager", "server")];

// ── Guest ────────────────────────────────────────────────────
// No sign-in: the same trust model as ordering — whoever is at the table.

router.post(
  "/",
  body("table").isMongoId().withMessage("Choose a table."),
  body("reason").optional().isIn(["service", "bill", "coals", "water"]),
  validateRequest,
  createCall
);

router.get("/:id", param("id").isMongoId(), validateRequest, getCallStatus);
router.put("/:id/cancel", param("id").isMongoId(), validateRequest, cancelCall);

// ── Staff ────────────────────────────────────────────────────

router.get(
  "/",
  ...anyStaff,
  query("scope").optional().isIn(["open", "all"]),
  validateRequest,
  listCalls
);
router.put("/:id/acknowledge", ...anyStaff, param("id").isMongoId(), validateRequest, acknowledgeCall);
router.put("/:id/resolve", ...anyStaff, param("id").isMongoId(), validateRequest, resolveCall);

module.exports = router;
