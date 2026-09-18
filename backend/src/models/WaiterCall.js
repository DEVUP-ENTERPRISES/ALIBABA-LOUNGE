const mongoose = require("mongoose");

/**
 * A guest asking for someone to come over.
 *
 * The lounge is dark and loud and a table can wave at nobody for several
 * minutes. This is the button that fixes that, and the record of whether
 * anyone actually answered it — which is the part worth keeping, because
 * "we always get to them quickly" and the timestamps rarely agree.
 */
const waiterCallSchema = new mongoose.Schema(
  {
    table: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Table",
      required: true,
      index: true,
    },
    tableCode: { type: String, required: true },

    /** Optional: the tab they are sitting on, when there is one. */
    order: { type: mongoose.Schema.Types.ObjectId, ref: "Order", default: null },

    /** What they want, when the button offers a choice. */
    reason: {
      type: String,
      enum: ["service", "bill", "coals", "water"],
      default: "service",
    },

    status: {
      type: String,
      enum: ["open", "acknowledged", "resolved", "expired"],
      default: "open",
      index: true,
    },

    acknowledgedAt: { type: Date, default: null },
    acknowledgedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin", default: null },
    acknowledgedName: { type: String, default: "" },
    resolvedAt: { type: Date, default: null },

    /** How long the guest waited, filled in when someone answers. */
    responseSeconds: { type: Number, default: null },
  },
  { timestamps: true }
);

// The floor asks "who is waiting", oldest first — the order they should be
// answered in.
waiterCallSchema.index({ status: 1, createdAt: 1 });

/**
 * One live call per table.
 *
 * A guest pressing the button four times is still one guest wanting one
 * thing. Without this the floor gets four alerts for one table and learns to
 * ignore them.
 */
waiterCallSchema.index(
  { table: 1 },
  {
    name: "one_open_call_per_table",
    unique: true,
    partialFilterExpression: { status: { $in: ["open", "acknowledged"] } },
  }
);

module.exports = mongoose.model("WaiterCall", waiterCallSchema);
