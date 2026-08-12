const mongoose = require("mongoose");

/**
 * A physical table on the floor.
 *
 * Sections mirror the tabs the venue already uses on its Clover terminal, so
 * staff see the same layout in both systems.
 */
const tableSchema = new mongoose.Schema(
  {
    // Printed on the table and used by staff: "VIP1", "M14", "W3"
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
      maxlength: 12,
      index: true,
    },
    section: {
      type: String,
      required: true,
      enum: ["main-dining", "backyard", "patio", "bar"],
      default: "main-dining",
      index: true,
    },
    seats: { type: Number, required: true, min: 1, max: 40, default: 4 },

    // Live floor state. `reserved` is set by a booking, `occupied` by an
    // open order.
    status: {
      type: String,
      enum: ["available", "occupied", "reserved", "cleaning"],
      default: "available",
      index: true,
    },

    // Ordering within its section on the floor plan UI.
    sortOrder: { type: Number, default: 0 },

    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

tableSchema.index({ section: 1, sortOrder: 1 });

module.exports = mongoose.model("Table", tableSchema);
