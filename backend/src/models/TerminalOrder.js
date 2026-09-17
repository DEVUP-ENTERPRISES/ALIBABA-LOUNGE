const mongoose = require("mongoose");

/**
 * A tab that was rung up on the Clover terminal, mirrored here so the admin
 * floor view shows the whole venue rather than just the online half.
 *
 * Deliberately a separate collection from Order rather than a `source` flag on
 * it. These are read-only copies with a different life: staff open, serve and
 * close them on the terminal, and the terminal stays the source of truth. Bent
 * into Order they would fight three things that exist for good reasons — the
 * required menuItem reference (a terminal line is a Clover product we may not
 * carry), the one-open-tab-per-table unique index, and our own status machine,
 * which does not apply to a tab nobody drives from here.
 *
 * Keeping them apart means the ordering flow that already works is untouched,
 * and the admin page simply reads both.
 */
const terminalLineSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    /** Dollars, converted from Clover's integer cents on the way in. */
    price: { type: Number, required: true, min: 0 },
    /**
     * Clover has no quantity on a line item — four waters is four lines. We
     * collapse identical lines on the way in so the floor reads "4× Water"
     * instead of the same row four times.
     */
    quantity: { type: Number, required: true, min: 1, default: 1 },
    cloverItemId: { type: String, default: null },
  },
  { _id: false }
);

const terminalOrderSchema = new mongoose.Schema(
  {
    cloverOrderId: { type: String, required: true, unique: true, index: true },

    /** Clover's own label, e.g. "VIP5 - Main Dining Room". Kept verbatim. */
    title: { type: String, default: "" },
    /** Parsed out of the title where we can match it to our floor. */
    tableCode: { type: String, default: "", index: true },
    table: { type: mongoose.Schema.Types.ObjectId, ref: "Table", default: null },

    /** Clover's own states. "open" is a live tab; "locked" is paid and closed. */
    state: { type: String, default: "open", index: true },
    paymentState: { type: String, default: "" },

    total: { type: Number, default: 0, min: 0 },
    items: { type: [terminalLineSchema], default: [] },

    openedAt: { type: Date, default: null },
    cloverModifiedAt: { type: Date, default: null },
    /** Last time the poller saw this order, for spotting a stalled sync. */
    lastSeenAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// The floor view asks for live tabs, newest first.
terminalOrderSchema.index({ state: 1, openedAt: -1 });

module.exports = mongoose.model("TerminalOrder", terminalOrderSchema);
