const mongoose = require("mongoose");

/**
 * Line item on an order.
 *
 * Title and price are copied at order time rather than joined from Menu.
 * A menu price change must never rewrite the history of an order that was
 * already placed.
 */
const orderItemSchema = new mongoose.Schema(
  {
    menuItem: { type: mongoose.Schema.Types.ObjectId, ref: "Menu", required: true },
    title: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1, max: 50, default: 1 },
    category: { type: String, trim: true, default: "" },
    notes: { type: String, trim: true, maxlength: 300, default: "" },
  },
  { _id: false }
);

const ORDER_STATUSES = [
  "placed", // customer submitted, nobody has picked it up
  "accepted", // a worker claimed it
  "preparing", // being made
  "served", // delivered to the table
  "completed", // paid and closed
  "cancelled",
];

const orderSchema = new mongoose.Schema(
  {
    // Human-facing sequential number, assigned on save.
    orderNumber: { type: Number, unique: true, index: true },

    table: { type: mongoose.Schema.Types.ObjectId, ref: "Table", required: true, index: true },
    tableCode: { type: String, trim: true, uppercase: true },

    // Signed-in customer. Absent for walk-ins entered by staff.
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null, index: true },
    customerName: { type: String, trim: true, maxlength: 120, default: "" },
    customerPhone: { type: String, trim: true, maxlength: 40, default: "" },

    items: {
      type: [orderItemSchema],
      validate: [(v) => v.length > 0, "An order needs at least one item."],
    },

    status: { type: String, enum: ORDER_STATUSES, default: "placed", index: true },

    // The worker who claimed it. First to accept owns it.
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "Admin", default: null, index: true },
    assignedName: { type: String, trim: true, default: "" },

    subtotal: { type: Number, required: true, min: 0, default: 0 },
    taxRate: { type: Number, min: 0, max: 1, default: 0.0825 }, // Dallas, TX
    tax: { type: Number, min: 0, default: 0 },
    total: { type: Number, required: true, min: 0, default: 0 },

    notes: { type: String, trim: true, maxlength: 500, default: "" },

    // Lifecycle stamps, for service-time reporting.
    placedAt: { type: Date, default: Date.now, index: true },
    acceptedAt: { type: Date, default: null },
    servedAt: { type: Date, default: null },
    completedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// The worker queue is "oldest unclaimed first".
orderSchema.index({ status: 1, placedAt: 1 });

/** Recompute money from the line items. Never trust totals from the client. */
orderSchema.methods.recalculate = function recalculate() {
  const subtotal = this.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  this.subtotal = Math.round(subtotal * 100) / 100;
  this.tax = Math.round(this.subtotal * this.taxRate * 100) / 100;
  this.total = Math.round((this.subtotal + this.tax) * 100) / 100;
  return this;
};

orderSchema.pre("save", async function assignOrderNumber(next) {
  if (this.orderNumber) return next();
  // Sequential per venue. Low volume, so a max+1 read is fine here.
  const last = await this.constructor.findOne().sort({ orderNumber: -1 }).select("orderNumber").lean();
  this.orderNumber = (last?.orderNumber || 1000) + 1;
  next();
});

module.exports = mongoose.model("Order", orderSchema);
module.exports.ORDER_STATUSES = ORDER_STATUSES;
