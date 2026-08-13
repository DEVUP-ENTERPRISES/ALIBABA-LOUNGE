const mongoose = require("mongoose");

const RESERVATION_STATUSES = [
  "pending",
  "confirmed",
  "seated",
  "completed",
  "cancelled",
  "no-show",
];

/** Statuses that still hold a table for the evening. */
const HOLDING = ["confirmed", "seated"];

/**
 * A short code the guest can quote.
 *
 * Reservations are made by people who are not signed in, so there has to be
 * something they can hold that is not a database id: readable over the phone,
 * short enough to type, and not guessable in bulk. Ambiguous characters are
 * left out so nobody reads a 0 as an O down a bad line.
 */
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
function makeReference() {
  let out = "";
  for (let i = 0; i < 6; i++) {
    out += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  }
  return `AB-${out}`;
}

const reservationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, required: true, trim: true, maxlength: 40 },
    date: { type: String, required: true, trim: true },
    time: { type: String, required: true, trim: true },
    guests: { type: Number, required: true, min: 1, max: 100 },
    specialRequest: { type: String, trim: true, maxlength: 1000, default: "" },

    // What the guest quotes when they arrive or want to check the booking.
    // Sparse, because bookings taken before this existed have none: a plain
    // unique index allows only one document without the field, which would
    // reject every legacy row. Run scripts/backfillReservationRefs.js to fill
    // them in.
    reference: { type: String, unique: true, sparse: true, index: true },

    status: {
      type: String,
      enum: RESERVATION_STATUSES,
      default: "pending",
      index: true,
    },

    // Where they will sit. Empty until someone on the floor decides.
    table: { type: mongoose.Schema.Types.ObjectId, ref: "Table", default: null },
    tableCode: { type: String, default: "" },

    // Why a booking was turned down or moved, in the guest's words back to them.
    statusNote: { type: String, trim: true, maxlength: 300, default: "" },

    confirmedAt: { type: Date, default: null },
    seatedAt: { type: Date, default: null },
    completedAt: { type: Date, default: null },
    cancelledAt: { type: Date, default: null },
  },
  { timestamps: true }
);

reservationSchema.index({ name: "text", email: "text", phone: "text" });
reservationSchema.index({ date: 1, time: 1 });
// The floor view is "everything for tonight", so date leads the index.
reservationSchema.index({ date: 1, status: 1 });
// Finding what a table is promised to, for conflict checks.
reservationSchema.index({ table: 1, date: 1, status: 1 });

reservationSchema.pre("validate", async function assignReference() {
  if (this.reference) return;
  // Six characters from a 32-symbol alphabet is a billion combinations; a
  // couple of retries covers the birthday-problem case at any realistic volume.
  for (let attempt = 0; attempt < 5; attempt++) {
    const candidate = makeReference();
    const clash = await this.constructor.exists({ reference: candidate });
    if (!clash) {
      this.reference = candidate;
      return;
    }
  }
  throw new Error("Could not allocate a reservation reference.");
});

module.exports = mongoose.model("Reservation", reservationSchema);
module.exports.RESERVATION_STATUSES = RESERVATION_STATUSES;
module.exports.HOLDING = HOLDING;
