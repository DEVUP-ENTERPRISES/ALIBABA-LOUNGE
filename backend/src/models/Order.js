const mongoose = require("mongoose");
const Counter = require("./Counter");

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

    table: { type: mongoose.Schema.Types.ObjectId, ref: "Table", required: true },
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
    // Tax is settled at the till, not here. Clover is the system of record for
    // payment and computes the real rate on the receipt; showing a second
    // figure in this app only invited a mismatch. Kept on the schema so old
    // orders keep their history.
    taxRate: { type: Number, min: 0, max: 1, default: 0 },
    tax: { type: Number, min: 0, default: 0 },
    total: { type: Number, required: true, min: 0, default: 0 },

    // What the venue owes for running this order through the platform.
    // Frozen onto the order when it completes so a later price change can
    // never rewrite what was already invoiced.
    platformFee: { type: Number, min: 0, default: 0 },

    notes: { type: String, trim: true, maxlength: 500, default: "" },

    // Mirrors `status` so a partial unique index can enforce one open tab per
    // table. partialFilterExpression cannot express $in, hence the flag.
    isOpen: { type: Boolean, default: true, index: true },

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

/**
 * One open tab per table, enforced by the database.
 *
 * The application checks for an existing tab before creating one, but that
 * check and the insert are two steps — two guests ordering at the same instant
 * both saw "no tab" and both created one. This index makes the second insert
 * fail, which the controller catches and turns into a merge.
 */
orderSchema.index(
  { table: 1 },
  {
    name: "one_open_tab_per_table",
    unique: true,
    partialFilterExpression: { isOpen: true },
  }
);

// Plain lookup index for the non-unique queries (order history per table).
orderSchema.index({ table: 1, placedAt: -1 }, { name: "table_history" });

/** Recompute money from the line items. Never trust totals from the client. */
orderSchema.methods.recalculate = function recalculate() {
  const subtotal = this.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  this.subtotal = Math.round(subtotal * 100) / 100;
  this.tax = Math.round(this.subtotal * (this.taxRate || 0) * 100) / 100;
  this.total = Math.round((this.subtotal + this.tax) * 100) / 100;
  return this;
};

// Async pre-hooks are not handed a `next` callback by Mongoose; returning
// from the promise is what signals completion.
const OPEN = ["placed", "accepted", "preparing", "served"];

orderSchema.pre("save", async function beforeSave() {
  // Keep the open flag in step with status on every write.
  this.isOpen = OPEN.includes(this.status);

  if (this.orderNumber) return;
  // Atomic — see Counter. A max+1 read raced and produced duplicate keys.
  this.orderNumber = await Counter.next("orderNumber", 1000);
});

module.exports = mongoose.model("Order", orderSchema);
module.exports.ORDER_STATUSES = ORDER_STATUSES;
