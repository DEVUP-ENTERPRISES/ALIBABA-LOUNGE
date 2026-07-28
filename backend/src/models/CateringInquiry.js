const mongoose = require("mongoose");

const cateringInquirySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 140 },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, trim: true, default: "" },
    guests: { type: Number, min: 1, default: null },
    eventDate: { type: String, required: true, trim: true },
    details: { type: String, required: true, trim: true, maxlength: 2000 },
    status: {
      type: String,
      enum: ["New", "In Review", "Contacted", "Closed"],
      default: "New",
      index: true,
    },
    adminNotes: { type: String, trim: true, default: "" },
  },
  { timestamps: true }
);

cateringInquirySchema.index({ name: "text", email: "text", phone: "text", details: "text" });

module.exports = mongoose.model("CateringInquiry", cateringInquirySchema);
