/**
 * ============================================================
 *  Ali Baba Lounge — Backfill reservation reference codes
 * ============================================================
 *
 *  Reservations taken before the lookup flow existed have no reference,
 *  so a guest holding one of those bookings has nothing to quote and the
 *  public lookup cannot find them.
 *
 *  The reference index is sparse, so the missing field is not itself an
 *  error — this just fills the gap. Safe to re-run: rows that already have
 *  a reference are left alone.
 *
 *  Usage:
 *    npm run backfill:reservations -- --dry
 *    npm run backfill:reservations
 * ============================================================
 */

const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });

const mongoose = require("mongoose");
const Reservation = require("../models/Reservation");

const DRY = process.argv.includes("--dry");

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const makeReference = () => {
  let out = "";
  for (let i = 0; i < 6; i++) out += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  return `AB-${out}`;
};

(async () => {
  await mongoose.connect(process.env.MONGO_URI);

  const missing = await Reservation.find({
    $or: [{ reference: { $exists: false } }, { reference: null }, { reference: "" }],
  }).select("name date time");

  console.log(`reservations without a reference: ${missing.length}`);
  if (missing.length === 0) {
    await mongoose.disconnect();
    return;
  }

  // Load what is already taken once, rather than a round trip per row.
  const taken = new Set(
    (await Reservation.find({ reference: { $type: "string" } }).select("reference").lean()).map(
      (r) => r.reference
    )
  );

  let filled = 0;
  for (const doc of missing) {
    let ref = makeReference();
    let guard = 0;
    while (taken.has(ref) && guard++ < 10) ref = makeReference();
    taken.add(ref);

    console.log(`  ${doc.date} ${doc.time} ${doc.name} -> ${ref}`);
    if (!DRY) {
      await Reservation.updateOne({ _id: doc._id }, { $set: { reference: ref } });
    }
    filled++;
  }

  console.log(DRY ? `\n(dry run — ${filled} would be filled)` : `\nfilled ${filled}`);
  await mongoose.disconnect();
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
