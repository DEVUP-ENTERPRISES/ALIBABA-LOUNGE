/**
 * ============================================================
 *  Ali Baba Lounge — Seed the floor plan
 * ============================================================
 *
 *  Table codes, sections and seat counts transcribed from the venue's
 *  existing Clover terminal, so staff read the same floor in both systems.
 *
 *  Only the Main Dining Room is transcribed — the Backyard, Patio and
 *  Bar tabs were not visible. Add those in the admin panel, or extend
 *  the list below and re-run.
 *
 *  Usage:
 *    npm run seed:tables -- --dry
 *    npm run seed:tables
 *
 *  Re-running upserts by code; it never deletes a table that has history.
 * ============================================================
 */

const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });

const mongoose = require("mongoose");
const Table = require("../models/Table");

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/sheesh";
const DRY_RUN = process.argv.includes("--dry");

// [code, seats]
const MAIN_DINING = [
  ["VIP1", 10], ["VIP2", 4], ["VIP3", 4], ["VIP4", 4], ["VIP5", 4],
  ["VIP6", 6], ["VIP7", 6], ["VIP8", 6], ["VIP9", 6],
  ["M1", 6], ["M2", 4], ["M3", 4], ["M4", 2], ["M5", 6], ["M6", 4],
  ["M7", 4], ["M8", 4], ["M9", 2], ["M10", 8], ["M11", 2], ["M12", 8],
  ["M13", 2], ["M14", 8],
  ["W1", 6], ["W2", 6], ["W3", 9], ["W4", 7],
  ["F1", 3],
];

const tables = MAIN_DINING.map(([code, seats], i) => ({
  code,
  seats,
  section: "main-dining",
  sortOrder: i,
  isActive: true,
}));

async function seedTables() {
  await mongoose.connect(MONGO_URI);
  console.log(`Connected to MongoDB (db: ${mongoose.connection.name})`);

  const existing = await Table.countDocuments();
  console.log(`\nTables in DB : ${existing}`);
  console.log(`Incoming     : ${tables.length}`);
  console.log(`Total seats  : ${tables.reduce((n, t) => n + t.seats, 0)}`);

  if (DRY_RUN) {
    console.log("\n--dry: no changes written.\n");
    tables.forEach((t) => console.log(`  ${t.code.padEnd(6)} ${t.seats} seats  [${t.section}]`));
    await mongoose.disconnect();
    return;
  }

  const ops = tables.map((t) => ({
    updateOne: {
      filter: { code: t.code },
      // status is deliberately not overwritten — a live table may be occupied.
      update: { $set: { seats: t.seats, section: t.section, sortOrder: t.sortOrder, isActive: true } },
      upsert: true,
    },
  }));

  const res = await Table.bulkWrite(ops);
  console.log(`\nUpserted ${res.upsertedCount}, updated ${res.modifiedCount}.`);
  console.log(`Tables now: ${await Table.countDocuments()}`);

  await mongoose.disconnect();
}

seedTables().catch((err) => {
  console.error("Seed failed:", err.message);
  process.exitCode = 1;
});
