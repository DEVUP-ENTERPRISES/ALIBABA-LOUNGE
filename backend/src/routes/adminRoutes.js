const express = require("express");
const {
  changePassword,
  createAdmin,
  listAdmins,
  resetPassword,
  updateAdmin,
} = require("../controllers/adminController");
const { protect, requireRole } = require("../middleware/authMiddleware");
const { validateRequest } = require("../middleware/validateRequest");
const { body, param } = require("express-validator");

const router = express.Router();
const superAdminOnly = [protect, requireRole("super-admin")];

router.get("/", ...superAdminOnly, listAdmins);
router.post(
  "/",
  ...superAdminOnly,
  body("name").trim().notEmpty(),
  body("email").isEmail().normalizeEmail(),
  body("password").isLength({ min: 8 }),
  body("role").optional().isIn(["admin", "super-admin"]),
  validateRequest,
  createAdmin
);
router.put(
  "/me/password",
  protect,
  body("currentPassword").notEmpty(),
  body("newPassword").isLength({ min: 8 }),
  validateRequest,
  changePassword
);
router.put(
  "/:id",
  ...superAdminOnly,
  param("id").isMongoId(),
  body("name").optional().trim().notEmpty(),
  body("email").optional().isEmail().normalizeEmail(),
  body("role").optional().isIn(["admin", "super-admin"]),
  body("isActive").optional().isBoolean(),
  validateRequest,
  updateAdmin
);
router.put(
  "/:id/password",
  ...superAdminOnly,
  param("id").isMongoId(),
  body("password").isLength({ min: 8 }),
  validateRequest,
  resetPassword
);

module.exports = router;
