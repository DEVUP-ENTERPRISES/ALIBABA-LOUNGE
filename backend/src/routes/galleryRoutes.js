const express = require("express");
const {
  createGalleryImage,
  deleteGalleryImage,
  getGalleryImages,
  updateGalleryImage,
} = require("../controllers/galleryController");
const { protect } = require("../middleware/authMiddleware");
const { upload } = require("../middleware/uploadMiddleware");
const { validateRequest } = require("../middleware/validateRequest");
const {
  galleryIdParam,
  galleryPayloadValidator,
  galleryUpdateValidator,
} = require("../validators/galleryValidator");

const router = express.Router();

router.get("/", getGalleryImages);
router.post("/", protect, upload.single("image"), galleryPayloadValidator, validateRequest, createGalleryImage);
router.put("/:id", protect, upload.single("image"), galleryUpdateValidator, validateRequest, updateGalleryImage);
router.delete("/:id", protect, galleryIdParam, validateRequest, deleteGalleryImage);

module.exports = router;
