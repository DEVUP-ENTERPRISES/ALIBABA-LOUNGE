const Review = require("../models/Review");
const { AppError } = require("../utils/AppError");
const { asyncHandler } = require("../utils/asyncHandler");

function formatReview(doc) {
  return {
    id: doc._id.toString(),
    author: doc.author,
    role: doc.role,
    quote: doc.quote,
    stars: doc.stars,
    initial: doc.initial || doc.author.slice(0, 2).toUpperCase(),
    isFeatured: doc.isFeatured,
    isApproved: doc.isApproved,
    createdAt: doc.createdAt,
  };
}

const getReviews = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.featured === "true") filter.isFeatured = true;
  if (req.query.approved === "true") filter.isApproved = true;

  const reviews = await Review.find(filter).sort({ createdAt: -1 });
  res.json({ success: true, reviews: reviews.map(formatReview) });
});

const createReview = asyncHandler(async (req, res) => {
  const { author, role, quote, stars, initial, isFeatured, isApproved } = req.body;
  const review = await Review.create({
    author,
    role: role || "Guest",
    quote,
    stars: stars || 5,
    initial: initial || (author ? author.split(" ").map(n => n[0]).join("").toUpperCase() : "G"),
    isFeatured: isFeatured !== undefined ? isFeatured : true,
    isApproved: isApproved !== undefined ? isApproved : true,
  });
  res.status(201).json({ success: true, review: formatReview(review) });
});

const updateReview = asyncHandler(async (req, res) => {
  const review = await Review.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!review) throw new AppError("Review not found.", 404);
  res.json({ success: true, review: formatReview(review) });
});

const deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findByIdAndDelete(req.params.id);
  if (!review) throw new AppError("Review not found.", 404);
  res.json({ success: true, message: "Review deleted." });
});

module.exports = {
  getReviews,
  createReview,
  updateReview,
  deleteReview,
};
