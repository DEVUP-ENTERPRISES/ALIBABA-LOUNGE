const mongoose = require("mongoose");

const gallerySchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 140 },
    url: { type: String, required: true, trim: true },
    publicId: { type: String, trim: true, default: "" },
    category: {
      type: String,
      enum: ["Food", "Drinks", "Hookah", "Ambiance", "Events", "Desserts"],
      default: "Ambiance",
      index: true,
    },
    tags: [{ type: String, trim: true }],
    isPublished: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

gallerySchema.index({ title: "text", tags: "text" });

module.exports = mongoose.model("Gallery", gallerySchema);
