const express = require("express");
const { getSettings, updateSettings } = require("../controllers/settingController");
const { protect, requireRole } = require("../middleware/authMiddleware");
const { validateRequest } = require("../middleware/validateRequest");
const { settingUpdateValidator } = require("../validators/settingValidator");

const router = express.Router();

router.get("/", getSettings);
router.put("/", protect, requireRole("super-admin", "admin"), settingUpdateValidator, validateRequest, updateSettings);

module.exports = router;
