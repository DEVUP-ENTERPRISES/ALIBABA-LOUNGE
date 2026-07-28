const express = require("express");
const {
  createMenuItem,
  deleteMenuItem,
  getMenuItem,
  getMenuItems,
  updateMenuItem,
} = require("../controllers/menuController");
const { protect } = require("../middleware/authMiddleware");
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
router.post("/", protect, menuUpload.single("image"), menuPayloadValidator, validateRequest, createMenuItem);
router.put("/:id", protect, menuUpload.single("image"), menuUpdateValidator, validateRequest, updateMenuItem);
router.delete("/:id", protect, menuIdParam, validateRequest, deleteMenuItem);

module.exports = router;
