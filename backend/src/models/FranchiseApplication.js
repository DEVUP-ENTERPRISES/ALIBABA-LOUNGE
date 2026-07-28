const mongoose = require("mongoose");

const franchiseApplicationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 140 },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, trim: true, default: "" },
    market: { type: String, required: true, trim: true, maxlength: 160 },
    investment: { type: String, required: true, trim: true, maxlength: 120 },
    background: { type: String, required: true, trim: true, maxlength: 2400 },
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

franchiseApplicationSchema.index({ name: "text", email: "text", market: "text", background: "text" });

module.exports = mongoose.model("FranchiseApplication", franchiseApplicationSchema);
