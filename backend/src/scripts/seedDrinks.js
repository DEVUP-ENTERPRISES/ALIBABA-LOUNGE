/**
 * ============================================================
 *  Ali Baba Lounge — Replace the DRINKS menu
 * ============================================================
 *
 *  Deletes every existing `drinks` document and inserts exactly the
 *  list below. Hookah and dessert items are NOT touched.
 *
 *  Usage:
 *    npm run seed:drinks           # replace drinks
 *    npm run seed:drinks -- --dry  # show the plan, change nothing
 *
 *  Items offered in several flavours share one price, so the choices
 *  live in the description. Drinks priced by size are separate
 *  documents, because price is a single number on the schema.
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

const images = {
  soda: p(2775860),
  juices: p(143133),
  chai: p(1414132),
  mocktails: p(1125720),
};

const drinks = [
  // ── Sodas & bottled ────────────────────────────────────────
  {
    title: "Soda",
    description:
      "Chilled fountain soda. Choice of Coke, Diet Coke, Coke Zero, Fanta, Sprite, Dew, Pepsi, or Ginger Ale.",
    price: 2.99,
    subcategory: "soda",
    image: images.soda,
  },
  {
    title: "Sparkling Water",
    description: "Crisp chilled sparkling mineral water.",
    price: 4.99,
    subcategory: "soda",
    image: images.soda,
  },
  {
    title: "Topo Chico",
    description: "Mexican sparkling mineral water. Choice of Lime or Regular.",
    price: 4.99,
    subcategory: "soda",
    image: images.soda,
  },
  {
    title: "Coconut Water",
    description: "Pure refreshing coconut water served chilled.",
    price: 4.99,
    subcategory: "soda",
    image: images.soda,
  },
  {
    title: "Red Bull",
    description: "Classic Red Bull energy drink served ice cold.",
    price: 5.99,
    subcategory: "soda",
    image: images.soda,
  },
  {
    title: "Bottle Water",
    description: "Chilled bottled still water.",
    price: 1.99,
    subcategory: "soda",
    image: images.soda,
  },

  // ── Juices ─────────────────────────────────────────────────
  {
    title: "Juice",
    description:
      "Chilled juice served over ice. Choice of Mango, Watermelon, Fruit Punch, Orange, or Pineapple.",
    price: 4.99,
    subcategory: "juices",
    image: images.juices,
  },
  {
    title: "Orange Fresh Juice (Small)",
    description: "Freshly squeezed orange juice, served chilled.",
    price: 5.99,
    subcategory: "juices",
    image: images.juices,
  },
  {
    title: "Orange Fresh Juice (Big)",
    description: "Freshly squeezed orange juice, served chilled. Large size.",
    price: 9.99,
    subcategory: "juices",
    image: images.juices,
  },
  {
    title: "Pineapple Fresh Juice (Small)",
    description: "Freshly pressed pineapple juice, served chilled.",
    price: 5.99,
    subcategory: "juices",
    image: images.juices,
  },
  {
    title: "Pineapple Fresh Juice (Big)",
    description: "Freshly pressed pineapple juice, served chilled. Large size.",
    price: 9.99,
    subcategory: "juices",
    image: images.juices,
  },
  {
    title: "Watermelon Fresh Juice (Small)",
    description: "Freshly pressed watermelon juice, served chilled.",
    price: 5.99,
    subcategory: "juices",
    image: images.juices,
  },
  {
    title: "Watermelon Fresh Juice (Big)",
    description: "Freshly pressed watermelon juice, served chilled. Large size.",
    price: 9.99,
    subcategory: "juices",
    image: images.juices,
  },
  {
    title: "Apple Fresh Juice (Small)",
    description: "Freshly pressed apple juice, served chilled.",
    price: 5.99,
    subcategory: "juices",
    image: images.juices,
  },
  {
    title: "Apple Fresh Juice (Big)",
    description: "Freshly pressed apple juice, served chilled. Large size.",
    price: 9.99,
    subcategory: "juices",
    image: images.juices,
  },

  // ── Tea & coffee ───────────────────────────────────────────
  {
    title: "Tea",
    description: "Freshly brewed tea. Choice of Black, Mint, or Green.",
    price: 3.99,
    subcategory: "chai-coffee",
    image: images.chai,
  },
  {
    title: "Masala Tea",
    description: "Spiced masala chai brewed with cardamom, ginger, and warm spices.",
    price: 4.99,
    subcategory: "chai-coffee",
    image: images.chai,
  },
  {
    title: "Tea Pot Small",
    description: "Freshly brewed tea served in a small pot, ideal for sharing.",
    price: 9.99,
    subcategory: "chai-coffee",
    image: images.chai,
  },
  {
    title: "Tea Pot Big",
    description: "Freshly brewed tea served in a large pot for the whole table.",
    price: 14.99,
    subcategory: "chai-coffee",
    image: images.chai,
  },
  {
    title: "Black Coffee",
    description: "Rich freshly brewed black coffee.",
    price: 4.99,
    subcategory: "chai-coffee",
    image: images.chai,
  },
  {
    title: "Milk Coffee",
    description: "Freshly brewed coffee with steamed milk.",
    price: 1.99,
    subcategory: "chai-coffee",
    image: images.chai,
  },
  {
    title: "Iced Cold Coffee",
    description: "Chilled blended coffee served over ice.",
    price: 7.99,
    subcategory: "chai-coffee",
    image: images.chai,
    tags: ["Popular"],
  },
  {
    title: "Hot Lemon",
    description: "Soothing hot lemon water with a touch of honey.",
    price: 5.99,
    subcategory: "chai-coffee",
    image: images.chai,
  },

  // ── Mojitos & mocktails ────────────────────────────────────
  {
    title: "Regular Mojito",
    description: "Classic mint and lime refreshing mocktail.",
    price: 9.99,
    subcategory: "mocktails",
    image: images.mocktails,
    tags: ["Popular"],
  },
  {
    title: "Mango Mojito",
    description: "Tropical mango blend with fresh mint, lime, and crushed ice.",
    price: 9.99,
    subcategory: "mocktails",
    image: images.mocktails,
    tags: ["Customer Fav"],
  },
  {
    title: "Strawberry Mojito",
    description: "Sweet strawberry muddled with fresh mint, lime, and sparkling soda.",
    price: 9.99,
    subcategory: "mocktails",
    image: images.mocktails,
  },
  {
    title: "Watermelon Mojito",
    description: "Fresh watermelon mocktail infused with lime and mint.",
    price: 9.99,
    subcategory: "mocktails",
    image: images.mocktails,
  },
  {
    title: "Classic Fresh Lemonade",
    description: "Freshly squeezed lemon juice with a touch of sweetness.",
    price: 7.99,
    subcategory: "mocktails",
    image: images.mocktails,
    tags: ["Popular"],
  },
  {
    title: "Piña Colada",
    description: "Creamy coconut and pineapple blended iced mocktail.",
    price: 9.99,
    subcategory: "mocktails",
    image: images.mocktails,
    tags: ["Staff Pick"],
  },
  {
    title: "Lassi",
    description: "Traditional creamy yogurt drink. Choice of Sweet or Mango.",
    price: 9.99,
    subcategory: "mocktails",
    image: images.mocktails,
  },
];

async function seedDrinks() {
  await mongoose.connect(MONGO_URI);
  console.log(`Connected to MongoDB (db: ${mongoose.connection.name})`);

  const existing = await Menu.countDocuments({ category: "drinks" });
  const others = await Menu.countDocuments({ category: { $ne: "drinks" } });

  console.log(`\nCurrent drinks in DB : ${existing}`);
  console.log(`Incoming drinks      : ${drinks.length}`);
  console.log(`Untouched (non-drink): ${others}`);

  if (DRY_RUN) {
    console.log("\n--dry: no changes written.\n");
    drinks.forEach((d) => console.log(`  + ${d.title} — $${d.price} [${d.subcategory}]`));
    await mongoose.disconnect();
    return;
  }

  const removed = await Menu.deleteMany({ category: "drinks" });
  console.log(`\nRemoved ${removed.deletedCount} drinks.`);

  const docs = drinks.map((item) => ({
    ...item,
    category: "drinks",
    tags: item.tags || [],
    isAvailable: true,
  }));

  const inserted = await Menu.insertMany(docs);
  console.log(`Inserted ${inserted.length} drinks.`);

  const finalDrinks = await Menu.countDocuments({ category: "drinks" });
  const finalTotal = await Menu.countDocuments();
  console.log(`\nDrinks now: ${finalDrinks} | Menu total: ${finalTotal}`);

  await mongoose.disconnect();
}

seedDrinks().catch((err) => {
  console.error("Seed failed:", err.message);
  process.exitCode = 1;
});
