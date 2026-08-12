const express = require("express");
const {
  getReviews,
  createReview,
  updateReview,
  deleteReview,
} = require("../controllers/reviewController");
const { attachAdmin, protect, requireRole } = require("../middleware/authMiddleware");
const { validateRequest } = require("../middleware/validateRequest");
const {
  reviewIdParam,
  reviewListValidator,
  reviewPayloadValidator,
  reviewUpdateValidator,
} = require("../validators/reviewValidator");

const router = express.Router();

router.get("/", attachAdmin, reviewListValidator, validateRequest, getReviews);
router.post("/", protect, requireRole("super-admin", "admin"), reviewPayloadValidator, validateRequest, createReview);
router.put("/:id", protect, requireRole("super-admin", "admin"), reviewUpdateValidator, validateRequest, updateReview);
router.delete("/:id", protect, requireRole("super-admin", "admin"), reviewIdParam, validateRequest, deleteReview);

module.exports = router;
