/**
 * ============================================================
 *  Ali Baba Lounge — Optimize generated menu images
 * ============================================================
 *
 *  Converts the raw DALL-E PNGs into web-sized WebP.
 *
 *    in :  frontend/public/images/menu-raw/<slug>.png   (gitignored, ~725 KB)
 *    out:  frontend/public/images/menu/<slug>.webp      (committed,   ~82 KB)
 *
 *  Usage:
 *    npm run menu:optimize
 *
 *  Re-running is safe: an output file newer than its source is left alone.
 * ============================================================
 */

const path = require("path");
const fs = require("fs");
const sharp = require("sharp");

const RAW_DIR = path.resolve(__dirname, "../../../frontend/public/images/menu-raw");
const OUT_DIR = path.resolve(__dirname, "../../../frontend/public/images/menu");

const WIDTH = 800; // plenty for a menu card; source is 1024
const QUALITY = 82;

async function optimizeAll() {
  if (!fs.existsSync(RAW_DIR)) {
    console.error(`No raw image directory at ${RAW_DIR}`);
    console.error("Run `npm run menu:generate` first.");
    process.exitCode = 1;
    return;
  }

  fs.mkdirSync(OUT_DIR, { recursive: true });

  const sources = fs.readdirSync(RAW_DIR).filter((name) => name.endsWith(".png"));

  if (sources.length === 0) {
    console.log("No PNGs found to optimize.");
    return;
  }

  let converted = 0;
  let skipped = 0;
  let failed = 0;
  let bytesIn = 0;
  let bytesOut = 0;

  for (const name of sources) {
    const from = path.join(RAW_DIR, name);
    const to = path.join(OUT_DIR, name.replace(/\.png$/, ".webp"));

    // Skip when the existing output is already newer than its source.
    if (fs.existsSync(to) && fs.statSync(to).mtimeMs >= fs.statSync(from).mtimeMs) {
      skipped++;
      bytesIn += fs.statSync(from).size;
      bytesOut += fs.statSync(to).size;
      continue;
    }

    try {
      await sharp(from).resize(WIDTH).webp({ quality: QUALITY }).toFile(to);

      const inSize = fs.statSync(from).size;
      const outSize = fs.statSync(to).size;
      bytesIn += inSize;
      bytesOut += outSize;
      converted++;

      console.log(
        `${name} -> ${path.basename(to)}  ` +
          `${(inSize / 1024).toFixed(0)} KB -> ${(outSize / 1024).toFixed(0)} KB`
      );
    } catch (err) {
      failed++;
      console.error(`Failed on ${name}: ${err.message}`);
    }
  }

  const mb = (bytes) => (bytes / 1024 / 1024).toFixed(1);
  console.log(
    `\nConverted ${converted}, skipped ${skipped}, failed ${failed}` +
      `\nTotal ${mb(bytesIn)} MB raw -> ${mb(bytesOut)} MB optimized`
  );

  if (failed > 0) process.exitCode = 1;
}

optimizeAll().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
