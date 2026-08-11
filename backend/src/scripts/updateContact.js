/**
 * ============================================================
 *  Ali Baba Lounge — Update contact details on the live Setting doc
 * ============================================================
 *
 *  Schema defaults only apply when a document is created, so editing
 *  Setting.js does nothing to the row that already exists. This writes
 *  the current contact details to it directly.
 *
 *  Usage:
 *    npm run settings:contact -- --dry
 *    npm run settings:contact
 * ============================================================
 */

const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });

const mongoose = require("mongoose");
const Setting = require("../models/Setting");

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/sheesh";
const DRY_RUN = process.argv.includes("--dry");

const CONTACT = {
  email: "alibabahookah2238@gmail.com",
  phone: "+1 (469) 586-5437",
  hoursSunThu: "1 PM – 2 AM",
  hoursFriSat: "1 PM – 4 AM",
  instagram: "@alibabalounge01",
  instagramUrl: "https://instagram.com/alibabalounge01",
};

async function updateContact() {
  await mongoose.connect(MONGO_URI);
  console.log(`Connected to MongoDB (db: ${mongoose.connection.name})`);

  let settings = await Setting.findOne();
  if (!settings) {
    console.log("No Setting document found — creating one.");
    if (!DRY_RUN) settings = await Setting.create(CONTACT);
    await mongoose.disconnect();
    return;
  }

  console.log("\nChanges:");
  for (const [key, next] of Object.entries(CONTACT)) {
    const current = settings[key];
    console.log(`   ${key}: ${current} -> ${next}${current === next ? "  (already set)" : ""}`);
  }

  if (DRY_RUN) {
    console.log("\n--dry: no changes written.");
  } else {
    Object.assign(settings, CONTACT);
    await settings.save();
    console.log("\nSaved.");
  }

  await mongoose.disconnect();
}

updateContact().catch((err) => {
  console.error("Update failed:", err.message);
  process.exitCode = 1;
});
