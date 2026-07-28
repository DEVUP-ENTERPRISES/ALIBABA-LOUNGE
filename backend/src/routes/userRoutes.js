const express = require("express");
const { firebaseAuth } = require("../middleware/firebaseAuthMiddleware");
const { protect, requireRole } = require("../middleware/authMiddleware");
const { syncUser, getMe, updateMe, deleteMe, listAllUsers } = require("../controllers/userController");

const router = express.Router();

// Admin-only: list all users (uses admin JWT, not Firebase token)
router.get("/", protect, requireRole("admin", "super-admin"), listAllUsers);

// Customer routes — require Firebase ID token
router.post("/sync", firebaseAuth, syncUser);
router.get("/me", firebaseAuth, getMe);
router.put("/me", firebaseAuth, updateMe);
router.delete("/me", firebaseAuth, deleteMe);

module.exports = router;
