const express = require("express");
const rateLimit = require("express-rate-limit");

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

// Tight limiter on credential submission — the global limiter is far too
// permissive for brute-force protection. Successful logins are not counted.
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  message: {
    success: false,
    message: "Too many login attempts. Please try again in 15 minutes.",
  },
});

router.post("/login", loginLimiter, loginValidator, validateRequest, login);
router.post("/logout", logout);
router.get("/me", protect, getCurrentAdmin);
router.get("/protected", protect, getProtectedStatus);

module.exports = router;
