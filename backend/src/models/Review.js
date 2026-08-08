const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    author: { type: String, required: true, trim: true, maxlength: 120 },
    role: { type: String, default: "Guest", trim: true, maxlength: 120 },
    quote: { type: String, required: true, trim: true, maxlength: 1000 },
    stars: { type: Number, default: 5, min: 1, max: 5 },
    initial: { type: String, trim: true, maxlength: 5 },
    isFeatured: { type: Boolean, default: true, index: true },
    isApproved: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Review", reviewSchema);
