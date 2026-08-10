/**
 * ============================================================
 *  Ali Baba Lounge — Replace the HOOKAH menu
 * ============================================================
 *
 *  Deletes every existing `hookah` document and inserts the full
 *  current offering: 49 tobacco flavors across six brands, 13 house
 *  special mixes, 5 hookah types, 3 fresh fruit heads and 8 add-ons.
 *
 *  Drinks are NOT touched.
 *
 *  Usage:
 *    npm run seed:hookah           # replace hookah
 *    npm run seed:hookah -- --dry  # show the plan, change nothing
 * ============================================================
 */

const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });

const mongoose = require("mongoose");
const Menu = require("../models/Menu");

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/sheesh";
const DRY_RUN = process.argv.includes("--dry");

const p = (id, w = 800) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${w}`;

const img = {
  hookah: p(341481),
  lounge: p(30562747),
  premium: p(30694805),
  green: p(4538912),
};

// ── Tobacco flavors, priced per brand ────────────────────────
const brands = [
  {
    label: "Starbuzz",
    sub: "starbuzz",
    price: 22.99,
    image: img.green,
    flavors: [
      "Safari Melon", "Code 69", "Blue Mist", "Sex on the Beach",
      "Exotic Guava", "Pirate's Cave", "Green Savior", "Citrus Mist",
      "Tangerine Dream", "White Peach", "Irish Peach", "Mighty Freeze",
    ],
  },
  {
    label: "Fumari",
    sub: "fumari",
    price: 24.99,
    image: img.premium,
    flavors: ["Spiced Chai", "Lemon Mint", "Ambrosia", "White Gummy Bear", "Mandarin", "Tangelo"],
  },
  {
    label: "Afzal",
    sub: "afzal",
    price: 22.99,
    image: img.hookah,
    flavors: [
      "Paan", "Kesar Paan", "Paan Masala", "Lychee",
      "Dubai Mint", "Mango Lassi", "Chief Commissioner",
    ],
  },
  {
    label: "Mazaya",
    sub: "mazaya",
    price: 22.99,
    image: img.hookah,
    flavors: ["Lemon Mint", "Double Apple"],
  },
  {
    label: "Adalya",
    sub: "adalya",
    price: 24.99,
    image: img.premium,
    flavors: ["Love 66", "Lady Killer", "Sky Fall", "Baku Nights"],
  },
  {
    label: "Al Fakher",
    sub: "al-fakher",
    price: 22.99,
    image: img.lounge,
    flavors: [
      "Kiwi", "Peach", "Double Apple", "Mango", "Mint", "Rose",
      "Strawberry", "Gum Mint", "Orange", "Watermelon", "Pineapple",
      "Guava", "Blueberry", "Coconut", "Grape", "Magic Love",
      "Orange Mint", "Grapefruit Mint",
    ],
  },
];

const flavorItems = brands.flatMap((b) =>
  b.flavors.map((flavor) => ({
    title: `${b.label} ${flavor}`,
    description: `${b.label} ${flavor} premium shisha tobacco.`,
    price: b.price,
    subcategory: b.sub,
    image: b.image,
  }))
);

// ── Ali Baba special mixes ───────────────────────────────────
const MIX_PRICE = 35;

const specialMixes = [
  ["Kasmiri Chai", "Fruity, sweet and smooth. Milk base with ice and Rooh Afza."],
  ["Dilruba", "Fruity with light paan, sweet."],
  ["Lychee Dream", "Lychee with light fruit."],
  ["Ishqiya", "Fruity and minty, strong."],
  ["Shaahi Paan", "Light paan, sweet and smooth."],
  ["Nawabi Nights", "Light kesar, fruity, sweet and smooth."],
  ["Baigan Ka Paan", "Paan based, strong and sweet."],
  ["Pineapple Fusion", "Fruity and smooth. Base with ice and pineapple juice."],
  ["Dilnashi", "Bold apple with mint, strong."],
  ["Pyaar Ka Nasha", "Light paan, fruity, sweet."],
  ["Desi Tadka", "Strong paan with fruity notes."],
  ["Habibi Mix", "Minty with fruity notes."],
  ["Trending Mix", "Paan based, fruity and strong."],
].map(([title, description], i) => ({
  title,
  description,
  price: MIX_PRICE,
  subcategory: "special-mixes",
  image: img.premium,
  featured: i < 3,
  tags: i < 3 ? ["Staff Pick"] : [],
}));

// ── Hookah types ─────────────────────────────────────────────
const hookahTypes = [
  ["Regular Hookah with Foil", "Classic hookah setup prepared with foil.", 19.99],
  ["Starbuzz Hookah with Foil", "Starbuzz tobacco setup prepared with foil.", 22.99],
  ["Starbuzz Hookah with HMD", "Starbuzz tobacco with heat management device for a longer, smoother session.", 24.99],
  ["Premium Hookah with HMD", "Premium tobacco with heat management device.", 27.99],
  ["VIP Hookah", "Our finest setup with premium tobacco, coals and full table service.", 34.99],
].map(([title, description, price], i) => ({
  title,
  description,
  price,
  subcategory: "hookah-types",
  image: i === 4 ? img.premium : img.hookah,
  featured: i === 4,
  tags: i === 4 ? ["Staff Pick"] : i === 0 ? ["Popular"] : [],
}));

// ── Fresh fruit hookahs ──────────────────────────────────────
const fruitHookahs = [
  ["Orange Head", "Fresh orange carved as the bowl for a naturally juicy, smooth session.", 35],
  ["Pineapple Head", "Fresh pineapple carved as the bowl. Sweet, tropical and long lasting.", 39.99],
  ["Watermelon Head", "Fresh watermelon carved as the bowl. Cool, crisp and refreshing.", 39.99],
].map(([title, description, price]) => ({
  title,
  description,
  price,
  subcategory: "fresh-fruit",
  image: img.green,
  featured: true,
  tags: ["Popular"],
}));

// ── Add-ons ──────────────────────────────────────────────────
const addOns = [
  ["Ice Base", "Chilled ice base for a cooler draw.", 4.99],
  ["Ice Hose", "Ice-chilled hose tip.", 3.99],
  ["Hookah Head Refill (Regular)", "Fresh tobacco refill for a regular head.", 12.99],
  ["Hookah Head Refill (HMD)", "Fresh tobacco refill with heat management device.", 15.99],
  ["Fruit Head Refill", "Fresh fruit head replacement.", 24.99],
  ["Rooh Afza Base", "Rooh Afza added to the base for a sweet floral note.", 3.99],
  ["Tobacco Base", "Tobacco-infused base.", 4.99],
  ["Speciality Base", "Choice of soda, milk or Red Bull in the base.", 4.99],
].map(([title, description, price]) => ({
  title,
  description,
  price,
  subcategory: "add-ons",
  image: img.hookah,
}));

const hookahItems = [
  ...hookahTypes,
  ...fruitHookahs,
  ...specialMixes,
  ...flavorItems,
  ...addOns,
];

async function seedHookah() {
  await mongoose.connect(MONGO_URI);
  console.log(`Connected to MongoDB (db: ${mongoose.connection.name})`);

  const existing = await Menu.countDocuments({ category: "hookah" });
  const others = await Menu.countDocuments({ category: { $ne: "hookah" } });

  const bySub = hookahItems.reduce((acc, i) => {
    acc[i.subcategory] = (acc[i.subcategory] || 0) + 1;
    return acc;
  }, {});

  console.log(`\nCurrent hookah in DB : ${existing}`);
  console.log(`Incoming hookah      : ${hookahItems.length}`);
  console.log(`Untouched (non-hookah): ${others}`);
  console.log("\nIncoming breakdown:");
  Object.entries(bySub).forEach(([k, v]) => console.log(`   ${k}: ${v}`));

  if (DRY_RUN) {
    console.log("\n--dry: no changes written.\n");
    await mongoose.disconnect();
    return;
  }

  const removed = await Menu.deleteMany({ category: "hookah" });
  console.log(`\nRemoved ${removed.deletedCount} hookah items.`);

  const docs = hookahItems.map((item) => ({
    ...item,
    category: "hookah",
    tags: item.tags || [],
    featured: item.featured || false,
    isAvailable: true,
  }));

  const inserted = await Menu.insertMany(docs);
  console.log(`Inserted ${inserted.length} hookah items.`);

  console.log(`\nHookah now: ${await Menu.countDocuments({ category: "hookah" })}`);
  console.log(`Menu total: ${await Menu.countDocuments()}`);

  await mongoose.disconnect();
}

seedHookah().catch((err) => {
  console.error("Seed failed:", err.message);
  process.exitCode = 1;
});
