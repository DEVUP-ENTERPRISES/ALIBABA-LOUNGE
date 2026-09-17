const mongoose = require("mongoose");

/**
 * A record of things that happened to money, kept because the order itself is
 * a poor witness.
 *
 * A cancelled order shows it is cancelled and nothing else: not what it was
 * worth, not who decided, not when, not why. That is exactly the set of
 * questions asked the morning after — a tab worth $80 vanished overnight and
 * nobody can say whether a guest walked out, a server fat-fingered it, or the
 * system timed it out on its own.
 *
 * Written once and never edited. Anything that can rewrite history is not an
 * audit trail.
 */
const auditLogSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: true,
      index: true,
      enum: [
        "order.cancelled",
        "order.auto-cancelled",
        "order.completed",
        "reservation.cancelled",
        "reservation.no-show",
      ],
    },

    /** Denormalised on purpose: the record must stay readable if the order is
     *  ever deleted, and must show the figures as they were at the time. */
    orderNumber: { type: Number, default: null, index: true },
    order: { type: mongoose.Schema.Types.ObjectId, ref: "Order", default: null },
    tableCode: { type: String, default: "" },

    /** What the tab was worth when this happened. */
    amount: { type: Number, default: 0 },
    itemCount: { type: Number, default: 0 },

    /** Plain words, shown to staff as-is. */
    reason: { type: String, default: "", maxlength: 300 },

    actor: {
      kind: { type: String, enum: ["staff", "system", "guest"], default: "system" },
      id: { type: mongoose.Schema.Types.ObjectId, default: null },
      name: { type: String, default: "" },
    },

    /** Anything worth keeping that does not deserve its own column. */
    meta: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

// The audit page reads newest first, usually filtered by action.
auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ action: 1, createdAt: -1 });

/** Never throws. A failed audit write must not roll back the thing it records. */
auditLogSchema.statics.record = async function record(entry) {
  try {
    return await this.create(entry);
  } catch (err) {
    console.error("[audit] could not write entry:", err.message);
    return null;
  }
};

module.exports = mongoose.model("AuditLog", auditLogSchema);
