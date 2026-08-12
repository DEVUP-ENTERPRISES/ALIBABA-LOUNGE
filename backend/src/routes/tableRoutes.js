const express = require("express");
const { body, param, query } = require("express-validator");

const {
  listTables,
  getTable,
  createTable,
  updateTable,
  deleteTable,
} = require("../controllers/tableController");
const { protect, requireRole } = require("../middleware/authMiddleware");
const { validateRequest } = require("../middleware/validateRequest");

const router = express.Router();

const SECTIONS = ["main-dining", "backyard", "patio", "bar"];
const STATUSES = ["available", "occupied", "reserved", "cleaning"];

// Managers and above change the floor plan itself.
const managerUp = [protect, requireRole("super-admin", "admin", "manager")];
// Any signed-in staff member can flip a table's live status.
const anyStaff = [protect, requireRole("super-admin", "admin", "manager", "server")];

// Public — customers choose their table from this.
router.get(
  "/",
  query("section").optional().isIn(SECTIONS),
  query("all").optional().isBoolean(),
  validateRequest,
  listTables
);

router.get("/:id", param("id").isMongoId(), validateRequest, getTable);

router.post(
  "/",
  ...managerUp,
  body("code").trim().notEmpty().isLength({ max: 12 }),
  body("section").isIn(SECTIONS),
  body("seats").isInt({ min: 1, max: 40 }),
  body("sortOrder").optional().isInt({ min: 0 }),
  validateRequest,
  createTable
);

router.put(
  "/:id",
  ...anyStaff,
  param("id").isMongoId(),
  body("code").optional().trim().notEmpty().isLength({ max: 12 }),
  body("section").optional().isIn(SECTIONS),
  body("seats").optional().isInt({ min: 1, max: 40 }),
  body("status").optional().isIn(STATUSES),
  body("sortOrder").optional().isInt({ min: 0 }),
  body("isActive").optional().isBoolean(),
  validateRequest,
  updateTable
);

router.delete("/:id", ...managerUp, param("id").isMongoId(), validateRequest, deleteTable);

module.exports = router;
