const express = require("express");
const { body, param, query } = require("express-validator");

const {
  createOrder,
  listOrders,
  listMyOrders,
  getOrder,
  acceptOrder,
  updateOrderStatus,
  addOrderItems,
  assignOrder,
} = require("../controllers/orderController");
const { protect, requireRole } = require("../middleware/authMiddleware");
const { firebaseAuth, firebaseAuthOptional } = require("../middleware/firebaseAuthMiddleware");
const { validateRequest } = require("../middleware/validateRequest");
const { ORDER_STATUSES } = require("../models/Order");

const router = express.Router();

const anyStaff = [protect, requireRole("super-admin", "admin", "manager", "server")];
const managerUp = [protect, requireRole("super-admin", "admin", "manager")];

const itemsValidator = [
  body("items").isArray({ min: 1 }).withMessage("Add at least one item."),
  body("items.*.menuItem").isMongoId().withMessage("Invalid menu item."),
  body("items.*.quantity").optional().isInt({ min: 1, max: 50 }),
  body("items.*.notes").optional().trim().isLength({ max: 300 }),
];

// ── Customer ─────────────────────────────────────────────────
// Sign-in is optional so a guest at the table can still order; when a token
// is present the order is linked to their account.
router.post(
  "/",
  firebaseAuthOptional,
  body("table").isMongoId().withMessage("Choose a table."),
  ...itemsValidator,
  body("customerName").optional().trim().isLength({ max: 120 }),
  body("customerPhone").optional().trim().isLength({ max: 40 }),
  body("notes").optional().trim().isLength({ max: 500 }),
  validateRequest,
  createOrder
);

router.get("/mine", firebaseAuth, listMyOrders);

// ── Staff ────────────────────────────────────────────────────
router.get(
  "/",
  ...anyStaff,
  query("status").optional().isIn(ORDER_STATUSES),
  query("scope").optional().isIn(["open", "all"]),
  query("table").optional().isMongoId(),
  query("assignedTo").optional().isMongoId(),
  query("page").optional().isInt({ min: 1 }),
  query("limit").optional().isInt({ min: 1, max: 500 }),
  validateRequest,
  listOrders
);

router.get("/:id", ...anyStaff, param("id").isMongoId(), validateRequest, getOrder);

router.put("/:id/accept", ...anyStaff, param("id").isMongoId(), validateRequest, acceptOrder);

router.put(
  "/:id/status",
  ...anyStaff,
  param("id").isMongoId(),
  body("status").isIn(["preparing", "served", "completed", "cancelled"]),
  validateRequest,
  updateOrderStatus
);

router.put(
  "/:id/items",
  ...anyStaff,
  param("id").isMongoId(),
  ...itemsValidator,
  validateRequest,
  addOrderItems
);

router.put(
  "/:id/assign",
  ...managerUp,
  param("id").isMongoId(),
  body("assignedTo").isMongoId(),
  validateRequest,
  assignOrder
);

module.exports = router;
