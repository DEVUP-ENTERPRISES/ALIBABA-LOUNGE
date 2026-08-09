const express = require("express");
const {
  getReviews,
  createReview,
  updateReview,
  deleteReview,
} = require("../controllers/reviewController");
const { attachAdmin, protect } = require("../middleware/authMiddleware");
const { validateRequest } = require("../middleware/validateRequest");
const {
  reviewIdParam,
  reviewListValidator,
  reviewPayloadValidator,
  reviewUpdateValidator,
} = require("../validators/reviewValidator");

const router = express.Router();

router.get("/", attachAdmin, reviewListValidator, validateRequest, getReviews);
router.post("/", protect, reviewPayloadValidator, validateRequest, createReview);
router.put("/:id", protect, reviewUpdateValidator, validateRequest, updateReview);
router.delete("/:id", protect, reviewIdParam, validateRequest, deleteReview);

module.exports = router;
