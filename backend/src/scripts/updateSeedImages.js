/**
 * ============================================================
 *  🔄 Ali Baba Lounge — Update seedMenu.js with Generated Images
 * ============================================================
 *
 *  Run this AFTER generateMenuImages.js AND optimizeMenuImages.js, so that
 *  each menu item points to its own optimized image.
 *
 *  Usage:
 *    npm run menu:link
 *
 *  Scans frontend/public/images/menu/ for optimized .webp files and rewrites
 *  the matching image field in seedMenu.js. Items with no image on disk keep
 *  whatever they already have.
 * ============================================================
 */

const path = require("path");
const fs = require("fs");

const MENU_DIR = path.resolve(__dirname, "../../../frontend/public/images/menu");
const SEED_FILE = path.resolve(__dirname, "seedMenu.js");

function slugify(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "");
}

// Read the current seedMenu.js
let seedContent = fs.readFileSync(SEED_FILE, "utf-8");

// Find all menu items with titles
const titleRegex = /title:\s*"([^"]+)".*?image:\s*[^,}]+/g;
let match;
let updatedCount = 0;
let missingCount = 0;

while ((match = titleRegex.exec(seedContent)) !== null) {
  const title = match[1];
  const slug = slugify(title);
  const localPath = `/images/menu/${slug}.webp`;
  const diskPath = path.join(MENU_DIR, `${slug}.webp`);

  if (fs.existsSync(diskPath)) {
    // Replace the image value for this specific item
    const fullMatch = match[0];
    const imagePartRegex = /image:\s*[^,}]+/;
    const updated = fullMatch.replace(imagePartRegex, `image: "${localPath}"`);
    seedContent = seedContent.replace(fullMatch, updated);
    updatedCount++;
    console.log(`✅ ${title} → ${localPath}`);
  } else {
    missingCount++;
    console.log(`⏭️  ${title} — no image found, keeping existing`);
  }
}

// Write the updated file
fs.writeFileSync(SEED_FILE, seedContent, "utf-8");

console.log(`\n📊 Summary:`);
console.log(`   ✅ Updated: ${updatedCount}`);
console.log(`   ⏭️  Skipped: ${missingCount}`);
console.log(`\n✨ seedMenu.js has been updated! Now run: node src/scripts/seedMenu.js`);
