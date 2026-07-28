const express = require("express");

const {
  getCurrentAdmin,
  getProtectedStatus,
  login,
  logout,
} = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");
const { validateRequest } = require("../middleware/validateRequest");
const { loginValidator } = require("../validators/authValidators");

const router = express.Router();

router.post("/login", loginValidator, validateRequest, login);
router.post("/logout", logout);
router.get("/me", protect, getCurrentAdmin);
router.get("/protected", protect, getProtectedStatus);

module.exports = router;
