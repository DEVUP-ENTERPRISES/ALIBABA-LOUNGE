const express = require("express");
const {
  createGalleryImage,
  deleteGalleryImage,
  getGalleryImages,
  updateGalleryImage,
} = require("../controllers/galleryController");
const { protect, requireRole } = require("../middleware/authMiddleware");
const { upload } = require("../middleware/uploadMiddleware");
const { validateRequest } = require("../middleware/validateRequest");
const {
  galleryIdParam,
  galleryPayloadValidator,
  galleryUpdateValidator,
} = require("../validators/galleryValidator");

const router = express.Router();

router.get("/", getGalleryImages);
router.post("/", protect, requireRole("super-admin", "admin"), upload.single("image"), galleryPayloadValidator, validateRequest, createGalleryImage);
router.put("/:id", protect, requireRole("super-admin", "admin"), upload.single("image"), galleryUpdateValidator, validateRequest, updateGalleryImage);
router.delete("/:id", protect, requireRole("super-admin", "admin"), galleryIdParam, validateRequest, deleteGalleryImage);

module.exports = router;
