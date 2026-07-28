const mongoose = require("mongoose");

const reservationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, required: true, trim: true, maxlength: 40 },
    date: { type: String, required: true, trim: true },
    time: { type: String, required: true, trim: true },
    guests: { type: Number, required: true, min: 1, max: 100 },
    specialRequest: { type: String, trim: true, maxlength: 1000, default: "" },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled"],
      default: "pending",
      index: true,
    },
  },
  { timestamps: true }
);

reservationSchema.index({ name: "text", email: "text", phone: "text" });
reservationSchema.index({ date: 1, time: 1 });

module.exports = mongoose.model("Reservation", reservationSchema);
