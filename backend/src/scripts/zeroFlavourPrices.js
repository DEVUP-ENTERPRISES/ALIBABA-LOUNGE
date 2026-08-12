/**
 * ============================================================
 *  Ali Baba Lounge — Flavours are not priced separately
 * ============================================================
 *
 *  A guest pays for the hookah (Regular, Starbuzz, Premium, VIP, a fruit
 *  head, or a house special mix). The tobacco flavour they pick is part of
 *  that price, not an extra charge — so every flavour brand is set to 0 and
 *  the UI hides the price badge when a menu item costs nothing.
 *
 *  Priced:     hookah-types, fresh-fruit, special-mixes, add-ons, all drinks
 *  Not priced: starbuzz, fumari, afzal, mazaya, adalya, al-fakher
 *
 *  Usage:
 *    npm run menu:flavours -- --dry
 *    npm run menu:flavours
 * ============================================================
 */

const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });

const mongoose = require("mongoose");
const Menu = require("../models/Menu");

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/sheesh";
const DRY_RUN = process.argv.includes("--dry");

const FLAVOUR_BRANDS = ["starbuzz", "fumari", "afzal", "mazaya", "adalya", "al-fakher"];

async function run() {
  await mongoose.connect(MONGO_URI);
  console.log(`Connected to MongoDB (db: ${mongoose.connection.name})`);

  const filter = { category: "hookah", subcategory: { $in: FLAVOUR_BRANDS } };
  const priced = await Menu.find({ ...filter, price: { $gt: 0 } })
    .select("title subcategory price")
    .sort("subcategory title")
    .lean();

  console.log(`\nFlavour items with a price: ${priced.length}`);
  priced.slice(0, 10).forEach((m) => console.log(`   ${m.title} — $${m.price}`));
  if (priced.length > 10) console.log(`   …and ${priced.length - 10} more`);

  if (DRY_RUN) {
    console.log("\n--dry: no changes written.");
  } else {
    const res = await Menu.updateMany(filter, { $set: { price: 0 } });
    console.log(`\nSet ${res.modifiedCount} flavour(s) to no separate charge.`);
  }

  const summary = await Menu.aggregate([
    { $match: { category: "hookah" } },
    { $group: { _id: "$subcategory", n: { $sum: 1 }, max: { $max: "$price" } } },
    { $sort: { _id: 1 } },
  ]);
  console.log("\nHookah menu:");
  summary.forEach((s) =>
    console.log(
      `   ${String(s._id).padEnd(15)} ${String(s.n).padStart(2)} items  ${
        s.max === 0 ? "no separate charge" : `up to $${s.max}`
      }`
    )
  );

  await mongoose.disconnect();
}

run().catch((err) => {
  console.error("Failed:", err.message);
  process.exitCode = 1;
});
