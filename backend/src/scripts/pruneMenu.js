/**
 * ============================================================
 *  Ali Baba Lounge — Prune retired menu categories
 * ============================================================
 *
 *  The lounge serves hookah and drinks only. This removes any
 *  leftover `food` and `desserts` documents, which are no longer
 *  part of the menu. Hookah and drinks are NOT touched.
 *
 *  Usage:
 *    npm run menu:prune -- --dry   # report only, change nothing
 *    npm run menu:prune            # delete
 * ============================================================
 */

const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });

const mongoose = require("mongoose");
const Menu = require("../models/Menu");

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/sheesh";
const DRY_RUN = process.argv.includes("--dry");

const RETIRED = ["food", "desserts"];

async function prune() {
  await mongoose.connect(MONGO_URI);
  console.log(`Connected to MongoDB (db: ${mongoose.connection.name})`);

  const doomed = await Menu.find({ category: { $in: RETIRED } })
    .select("title category price")
    .lean();

  console.log(`\nRetired categories: ${RETIRED.join(", ")}`);
  console.log(`Documents matched : ${doomed.length}`);
  doomed.forEach((d) => console.log(`   - ${d.title} [${d.category}] $${d.price}`));

  if (DRY_RUN) {
    console.log("\n--dry: no changes written.");
  } else if (doomed.length > 0) {
    const res = await Menu.deleteMany({ category: { $in: RETIRED } });
    console.log(`\nRemoved ${res.deletedCount} documents.`);
  } else {
    console.log("\nNothing to remove.");
  }

  const remaining = await Menu.aggregate([
    { $group: { _id: "$category", n: { $sum: 1 } } },
    { $sort: { _id: 1 } },
  ]);
  console.log("\nMenu now:");
  remaining.forEach((c) => console.log(`   ${c._id}: ${c.n}`));
  console.log(`   TOTAL: ${await Menu.countDocuments()}`);

  await mongoose.disconnect();
}

prune().catch((err) => {
  console.error("Prune failed:", err.message);
  process.exitCode = 1;
});
