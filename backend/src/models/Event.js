const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 160 },
    description: { type: String, trim: true, maxlength: 1600, default: "" },
    date: { type: String, required: true, trim: true },
    time: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true, maxlength: 180 },
    category: { type: String, trim: true, default: "General" },
    image: { type: String, required: true, trim: true },
    cloudinaryId: { type: String, default: "" },
    bannerImage: { type: String, trim: true, default: "" },
    featured: { type: Boolean, default: false, index: true },
    status: {
      type: String,
      enum: ["Draft", "Published", "Archived"],
      default: "Draft",
      index: true,
    },
  },
  { timestamps: true }
);

eventSchema.index({ title: "text", description: "text", location: "text" });
eventSchema.index({ date: 1, status: 1 });

module.exports = mongoose.model("Event", eventSchema);
