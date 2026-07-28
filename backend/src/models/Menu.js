const mongoose = require("mongoose");

const menuSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 140 },
    description: { type: String, required: true, trim: true, maxlength: 1200 },
    category: {
      type: String,
      required: true,
      enum: ["food", "hookah", "drinks", "desserts"],
      index: true,
    },
    subcategory: { type: String, trim: true, default: "" },
    price: { type: Number, required: true, min: 0 },
    image: { type: String, required: true, trim: true },
    cloudinaryId: { type: String, default: "" },
    tags: [{ type: String, enum: ["Popular", "Staff Pick", "Customer Fav", "New"] }],
    featured: { type: Boolean, default: false, index: true },
    layout: { type: String, enum: ["default", "wide"], default: "default" },
    isAvailable: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

menuSchema.index({ title: "text", description: "text" });

module.exports = mongoose.model("Menu", menuSchema);
