const express = require("express");
const {
  createMenuItem,
  deleteMenuItem,
  getMenuItem,
  getMenuItems,
  updateMenuItem,
} = require("../controllers/menuController");
const { protect, requireRole } = require("../middleware/authMiddleware");
const { validateRequest } = require("../middleware/validateRequest");
const { menuUpload } = require("../middleware/uploadMiddleware");
const {
  menuIdParam,
  menuListValidator,
  menuPayloadValidator,
  menuUpdateValidator,
} = require("../validators/menuValidator");

const router = express.Router();

router.get("/", menuListValidator, validateRequest, getMenuItems);
router.get("/:id", menuIdParam, validateRequest, getMenuItem);
router.post("/", protect, requireRole("super-admin", "admin"), menuUpload.single("image"), menuPayloadValidator, validateRequest, createMenuItem);
router.put("/:id", protect, requireRole("super-admin", "admin"), menuUpload.single("image"), menuUpdateValidator, validateRequest, updateMenuItem);
router.delete("/:id", protect, requireRole("super-admin", "admin"), menuIdParam, validateRequest, deleteMenuItem);

module.exports = router;
