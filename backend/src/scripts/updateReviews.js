/**
 * ============================================================
 *  Ali Baba Lounge — Refresh the seeded reviews
 * ============================================================
 *
 *  The original seed praised food the lounge no longer serves.
 *  This rewrites those documents in place, matched by author.
 *
 *  Usage:
 *    npm run seed:reviews -- --dry
 *    npm run seed:reviews
 * ============================================================
 */

const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });

const mongoose = require("mongoose");
const Review = require("../models/Review");

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/sheesh";
const DRY_RUN = process.argv.includes("--dry");

// Only the entries that referenced food need rewriting.
const REWRITES = [
  {
    match: /premier hookah lounge/i,
    quote:
      "Best hookah in Dallas, hands down. The clouds, the setup, the vibe — nothing else comes close.",
  },
  {
    match: /BBQ platter/i,
    quote:
      "The house mixes are why we keep coming back. Staff actually know their tobacco.",
    role: "Weekly Regular",
  },
  {
    match: /Mediterranean spread/i,
    quote:
      "Fresh fruit heads are unreal. Ordered the watermelon and it lasted the whole night.",
    role: "Hookah Lover",
  },
];

async function updateReviews() {
  await mongoose.connect(MONGO_URI);
  console.log(`Connected to MongoDB (db: ${mongoose.connection.name})`);

  const reviews = await Review.find();
  console.log(`Reviews in DB: ${reviews.length}\n`);

  let changed = 0;
  for (const review of reviews) {
    const rule = REWRITES.find((r) => r.match.test(review.quote));
    if (!rule) continue;

    console.log(`${review.author}`);
    console.log(`   old: ${review.quote}`);
    console.log(`   new: ${rule.quote}`);
    if (rule.role) console.log(`   role: ${review.role} -> ${rule.role}`);

    if (!DRY_RUN) {
      review.quote = rule.quote;
      if (rule.role) review.role = rule.role;
      await review.save();
    }
    changed++;
  }

  console.log(DRY_RUN ? `\n--dry: ${changed} would change.` : `\nUpdated ${changed} reviews.`);
  await mongoose.disconnect();
}

updateReviews().catch((err) => {
  console.error("Update failed:", err.message);
  process.exitCode = 1;
});
