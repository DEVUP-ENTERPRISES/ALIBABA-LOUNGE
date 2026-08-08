const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });

const mongoose = require("mongoose");
const Menu = require("../models/Menu");

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/sheesh";

const p = (id, w = 800) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${w}`;

const images = {
  mocktails: p(1125720),
  juices: p(143133),
  chai: p(1414132),
  soda: p(50593),
  milkshakes: p(103566),
  hookah: p(341481),
  hookahLounge: p(30562747),
  hookahPremium: p(30694805),
  hookahGreen: p(4538912),
  appetizers: p(1642454),
  sandwiches: p(1633578),
  bbq: p(1640777),
  desi: p(958545),
  chinese: p(357756),
  desserts: p(45201),
};

const menuItemsData = [
  // ==========================================
  // 1. DRINKS (Poster & Notebook)
  // ==========================================
  // Mocktails
  { title: "Regular Mojito", description: "Classic mint and lime refreshing mocktail.", category: "drinks", subcategory: "mocktails", price: 9.99, image: images.mocktails, tags: ["Popular"] },
  { title: "Mango Mojito", description: "Tropical mango blend with fresh mint, lime, and crushed ice.", category: "drinks", subcategory: "mocktails", price: 9.99, image: images.mocktails, tags: ["Customer Fav"] },
  { title: "Strawberry Mojito", description: "Sweet strawberry muddled with fresh mint, lime, and sparkling soda.", category: "drinks", subcategory: "mocktails", price: 9.99, image: images.mocktails },
  { title: "Watermelon Mojito", description: "Fresh watermelon mocktail infused with lime and mint.", category: "drinks", subcategory: "mocktails", price: 9.99, image: images.mocktails },
  { title: "Classic Fresh Lemonade", description: "Freshly squeezed lemon juice with a touch of sweetness.", category: "drinks", subcategory: "mocktails", price: 7.99, image: images.mocktails, tags: ["Popular"] },
  { title: "Pina Colada", description: "Creamy coconut and pineapple blended iced mocktail.", category: "drinks", subcategory: "mocktails", price: 9.99, image: images.mocktails, tags: ["Staff Pick"] },
  { title: "Lychee Mojito Mocktail", description: "Exotic lychee infused with fresh mint and crushed ice.", category: "drinks", subcategory: "mocktails", price: 9.99, image: images.mocktails, tags: ["Customer Fav"] },
  { title: "Ocean Blue Mojito", description: "Signature blue curaçao citrus mocktail with fresh mint and cinematic pour.", category: "drinks", subcategory: "mocktails", price: 11.99, image: images.mocktails, tags: ["Popular", "Staff Pick"], featured: true },
  { title: "Hayati Mocktail", description: "Lounge signature berry hibiscus elixir with gold flakes and smoke.", category: "drinks", subcategory: "mocktails", price: 11.99, image: images.mocktails, tags: ["Popular", "Staff Pick"], featured: true },
  { title: "Blueberry Mojito", description: "Fresh blueberries muddled with lime and mint.", category: "drinks", subcategory: "mocktails", price: 9.99, image: images.mocktails },
  { title: "Jamun Mojito", description: "Indian black plum nectar mixed with chatpata spices and soda.", category: "drinks", subcategory: "mocktails", price: 9.99, image: images.mocktails },
  { title: "Pineapple Mojito", description: "Tropical pineapple twist with fresh spearmint.", category: "drinks", subcategory: "mocktails", price: 9.99, image: images.mocktails },
  { title: "Passion Fruit Mojito", description: "Tangy passion fruit pulp with chilled sparkling soda.", category: "drinks", subcategory: "mocktails", price: 9.99, image: images.mocktails },
  { title: "Mango Mule", description: "Mango puree, fresh lime juice, and spicy ginger beer infusion.", category: "drinks", subcategory: "mocktails", price: 9.99, image: images.mocktails },
  { title: "Mint Lemonade", description: "Blend of fresh mint leaves, lemon juice, and crushed ice.", category: "drinks", subcategory: "mocktails", price: 7.99, image: images.mocktails },
  { title: "Berry Burlesque", description: "Rich mixed berry blend topped with ginger ale and fresh lime.", category: "drinks", subcategory: "mocktails", price: 9.99, image: images.mocktails },
  { title: "Falsay Mojito", description: "Traditional Grewia asiatica berry mocktail with black salt.", category: "drinks", subcategory: "mocktails", price: 9.99, image: images.mocktails },
  { title: "Lassi", description: "Traditional rich Indian yogurt drink. Choice of Sweet or Mango.", category: "drinks", subcategory: "mocktails", price: 9.99, image: images.mocktails, tags: ["Popular"] },

  // Fresh Juices
  { title: "Fresh Orange Juice", description: "Pressed to order 100% pure orange juice. Small (10oz) $5.99 / Big (16oz) $9.99.", category: "drinks", subcategory: "juices", price: 5.99, image: images.juices, tags: ["Popular"] },
  { title: "Fresh Pineapple Juice", description: "Cold-pressed fresh pineapple juice. Small (10oz) $5.99 / Big (16oz) $9.99.", category: "drinks", subcategory: "juices", price: 5.99, image: images.juices },
  { title: "Fresh Watermelon Juice", description: "Freshly extracted sweet watermelon juice. Small (10oz) $5.99 / Big (16oz) $9.99.", category: "drinks", subcategory: "juices", price: 5.99, image: images.juices, tags: ["Customer Fav"] },
  { title: "Fresh Apple Juice", description: "Crisp cold-pressed red apple juice. Small (10oz) $5.99 / Big (16oz) $9.99.", category: "drinks", subcategory: "juices", price: 5.99, image: images.juices },
  { title: "Fresh Carrot Juice", description: "Nutritious raw carrot juice pressed fresh.", category: "drinks", subcategory: "juices", price: 5.99, image: images.juices },
  { title: "Fresh Sugarcane Juice", description: "Traditional sugarcane juice pressed with lime and ginger.", category: "drinks", subcategory: "juices", price: 6.99, image: images.juices, tags: ["Customer Fav"] },
  { title: "Fresh Young Coconut Water", description: "Whole tender young coconut served chilled with straw.", category: "drinks", subcategory: "juices", price: 4.99, image: images.juices },
  { title: "Assorted Juice", description: "Refreshing glass of juice. Choice of Mango, Watermelon, Fruit Punch, Orange, or Pineapple.", category: "drinks", subcategory: "juices", price: 4.99, image: images.juices },

  // Chai & Coffee
  { title: "Iced Cold Coffee", description: "Chilled espresso blended with cold milk, ice, and dark chocolate drizzle.", category: "drinks", subcategory: "chai-coffee", price: 7.99, image: images.chai, tags: ["Popular"], featured: true },
  { title: "Tea (Black / Mint / Green)", description: "Freshly brewed hot tea. Choice of Black, Mint, or Green.", category: "drinks", subcategory: "chai-coffee", price: 3.99, image: images.chai },
  { title: "Masala Tea", description: "Spiced traditional masala chai brewed with aromatic spices and milk.", category: "drinks", subcategory: "chai-coffee", price: 4.99, image: images.chai, tags: ["Staff Pick"] },
  { title: "Tea Pot Small", description: "Small pot of freshly brewed tea served hot for sharing.", category: "drinks", subcategory: "chai-coffee", price: 9.99, image: images.chai },
  { title: "Tea Pot Big", description: "Large pot of freshly brewed tea served hot for the table.", category: "drinks", subcategory: "chai-coffee", price: 14.99, image: images.chai },
  { title: "Hot Lemon", description: "Warming hot lemon tea infused with honey and fresh mint.", category: "drinks", subcategory: "chai-coffee", price: 5.99, image: images.chai },
  { title: "Black Coffee", description: "Rich and bold freshly brewed dark roast coffee.", category: "drinks", subcategory: "chai-coffee", price: 4.99, image: images.chai },
  { title: "Milk Coffee", description: "Smooth coffee blended with warm steamed milk.", category: "drinks", subcategory: "chai-coffee", price: 1.99, image: images.chai },
  { title: "Special Gurwali Chai", description: "Traditional jaggery-infused slow-cooked chai.", category: "drinks", subcategory: "chai-coffee", price: 5.99, image: images.chai },
  { title: "Special Dhaba Chai", description: "Strong, cardamom-rich highway dhaba style chai.", category: "drinks", subcategory: "chai-coffee", price: 5.99, image: images.chai, tags: ["Popular", "Staff Pick"], featured: true },
  { title: "Mint Tea Pot", description: "Pot of fresh Moroccan mint tea leaves steeped in hot water.", category: "drinks", subcategory: "chai-coffee", price: 4.99, image: images.chai },
  { title: "Doodh Pati", description: "Rich pakistani tea boiled purely in milk and green cardamom.", category: "drinks", subcategory: "chai-coffee", price: 4.99, image: images.chai },
  { title: "Americano", description: "Double shot espresso diluted with hot water.", category: "drinks", subcategory: "chai-coffee", price: 4.99, image: images.chai },
  { title: "Espresso Shot", description: "Intense concentrated single shot espresso.", category: "drinks", subcategory: "chai-coffee", price: 3.99, image: images.chai },
  { title: "Latte & Cappuccino", description: "Espresso topped with silky steamed milk foam.", category: "drinks", subcategory: "chai-coffee", price: 5.99, image: images.chai },
  { title: "Biscoff Latte", description: "Espresso blended with Lotus Biscoff cookie spread.", category: "drinks", subcategory: "chai-coffee", price: 6.99, image: images.chai, tags: ["Staff Pick"] },

  // Soda & Water
  { title: "Soda", description: "Selection of Coke, Diet Coke, Coke Zero, Fanta, Sprite, Mountain Dew, Pepsi, or Ginger Ale.", category: "drinks", subcategory: "soda", price: 2.99, image: images.soda },
  { title: "Bottle Water", description: "Chilled premium bottled spring water.", category: "drinks", subcategory: "soda", price: 1.99, image: images.soda },
  { title: "Sparkling Water", description: "Crisp, chilled sparkling mineral water.", category: "drinks", subcategory: "soda", price: 4.99, image: images.soda },
  { title: "Topo Chico (Lime / Regular)", description: "Imported Mexican sparkling mineral water available in Lime or Regular flavor.", category: "drinks", subcategory: "soda", price: 4.99, image: images.soda },
  { title: "Coconut Water", description: "100% pure hydrating coconut water.", category: "drinks", subcategory: "soda", price: 4.99, image: images.soda },
  { title: "Red Bull", description: "Chilled original energy drink.", category: "drinks", subcategory: "soda", price: 5.99, image: images.soda },

  // Milkshakes
  { title: "Oreo Milkshake", description: "Creamy vanilla milkshake blended with crunchy Oreo cookies.", category: "drinks", subcategory: "milkshakes", price: 8.99, image: images.milkshakes, tags: ["Popular"] },
  { title: "Chocolate Milkshake", description: "Rich Belgian chocolate milkshake topped with whipped cream.", category: "drinks", subcategory: "milkshakes", price: 8.99, image: images.milkshakes },
  { title: "Pistachio Milkshake", description: "Gourmet roasted pistachio blend with saffron cream.", category: "drinks", subcategory: "milkshakes", price: 9.99, image: images.milkshakes },
  { title: "Nutella Milkshake", description: "Decadent hazelnut chocolate Nutella milkshake.", category: "drinks", subcategory: "milkshakes", price: 9.99, image: images.milkshakes },
  { title: "Paan Rabri Milkshake", description: "Signature betel leaf and rabri sweet cream milkshake.", category: "drinks", subcategory: "milkshakes", price: 9.99, image: images.milkshakes, tags: ["Popular", "Staff Pick"], featured: true },

  // ==========================================
  // 2. HOOKAH MENU (Ali Baba Hookah Lounge Menu)
  // ==========================================
  // Selection
  { title: "Classic Hookah Selection", description: "Premium single-flavor session with expert heat management and crystal bowl.", category: "hookah", subcategory: "selection", price: 24, image: images.hookahPremium, tags: ["Popular"] },
  { title: "Deluxe Hookah Selection", description: "Extended session with ice hose tip and flavor refresh.", category: "hookah", subcategory: "selection", price: 32, image: images.hookahPremium, tags: ["Staff Pick"], featured: true },
  { title: "VIP Hookah Selection", description: "Private booth service, premium coal, and custom blend consultation.", category: "hookah", subcategory: "selection", price: 45, image: images.hookahPremium, tags: ["Staff Pick"], featured: true },

  // Starbuzz
  { title: "Starbuzz Safari Melon", description: "Smooth, sweet, and exotic melon profile.", category: "hookah", subcategory: "starbuzz", price: 22.99, image: images.hookahGreen },
  { title: "Starbuzz Code 69", description: "Tart passion fruit and cool fruit punch blend.", category: "hookah", subcategory: "starbuzz", price: 22.99, image: images.hookahGreen },
  { title: "Starbuzz Blue Mist", description: "Refining sweet blueberry with a cooling menthol undertone.", category: "hookah", subcategory: "starbuzz", price: 22.99, image: images.hookahGreen, tags: ["Popular"] },
  { title: "Starbuzz Sex on the Beach", description: "Tropical cocktail blend of orange, cranberry, and peach.", category: "hookah", subcategory: "starbuzz", price: 22.99, image: images.hookahGreen },
  { title: "Starbuzz Exotic Guava", description: "Lush, sweet tropical guava smoke.", category: "hookah", subcategory: "starbuzz", price: 22.99, image: images.hookahGreen },
  { title: "Starbuzz Pirate's Cave", description: "Lime and fruit punch blast with citrus notes.", category: "hookah", subcategory: "starbuzz", price: 22.99, image: images.hookahGreen },
  { title: "Starbuzz Green Savior", description: "Traditional herbal spice and botanical notes.", category: "hookah", subcategory: "starbuzz", price: 22.99, image: images.hookahGreen },
  { title: "Starbuzz Citrus Mist", description: "Zesty lemon-lime with a refreshing icy finish.", category: "hookah", subcategory: "starbuzz", price: 22.99, image: images.hookahGreen },
  { title: "Starbuzz Tangerine Dream", description: "Creamy orange tangerine flavor profile.", category: "hookah", subcategory: "starbuzz", price: 22.99, image: images.hookahGreen },
  { title: "Starbuzz White Peach", description: "Juicy, sweet orchard white peach.", category: "hookah", subcategory: "starbuzz", price: 22.99, image: images.hookahGreen },
  { title: "Starbuzz Irish Peach", description: "Peach with a hint of citrus and creamy vanilla.", category: "hookah", subcategory: "starbuzz", price: 22.99, image: images.hookahGreen },
  { title: "Starbuzz Mighty Freeze", description: "Intense icy menthol combined with lemon drop.", category: "hookah", subcategory: "starbuzz", price: 22.99, image: images.hookahGreen },

  // Fumari
  { title: "Fumari Spiced Chai", description: "Warm sweet tea infused with cinnamon and cardamom.", category: "hookah", subcategory: "fumari", price: 24.99, image: images.hookahLounge, tags: ["Staff Pick"] },
  { title: "Fumari Lemon Mint", description: "Zesty tart lemon paired with crisp cooling mint.", category: "hookah", subcategory: "fumari", price: 24.99, image: images.hookahLounge },
  { title: "Fumari Ambrosia", description: "Sweet marshmallow and fresh citrus melon mix.", category: "hookah", subcategory: "fumari", price: 24.99, image: images.hookahLounge },
  { title: "Fumari White Gummy Bear", description: "Famous pineapple and gummy candy profile.", category: "hookah", subcategory: "fumari", price: 24.99, image: images.hookahLounge, tags: ["Popular"] },
  { title: "Fumari Mandarin", description: "Juicy, sweet mandarin orange notes.", category: "hookah", subcategory: "fumari", price: 24.99, image: images.hookahLounge },
  { title: "Fumari Tangelo", description: "Hybrid citrus mix of grapefruit and tangerine.", category: "hookah", subcategory: "fumari", price: 24.99, image: images.hookahLounge },

  // Afzal
  { title: "Afzal Paan", description: "Authentic betel leaf flavor with rich aromatic undertones.", category: "hookah", subcategory: "afzal", price: 22.99, image: images.hookah, tags: ["Popular"] },
  { title: "Afzal Kesar Paan", description: "Betel leaf infused with luxurious saffron.", category: "hookah", subcategory: "afzal", price: 22.99, image: images.hookah },
  { title: "Afzal Paan Masala", description: "Spiced betel leaf with traditional Indian notes.", category: "hookah", subcategory: "afzal", price: 22.99, image: images.hookah },
  { title: "Afzal Lychee", description: "Exotic, sweet floral lychee fruit pull.", category: "hookah", subcategory: "afzal", price: 22.99, image: images.hookah },
  { title: "Afzal Dubai Mint", description: "Cool, crisp desert mint with smooth finish.", category: "hookah", subcategory: "afzal", price: 22.99, image: images.hookah },
  { title: "Afzal Mango Lassi", description: "Creamy mango and yogurt lounge smoke.", category: "hookah", subcategory: "afzal", price: 22.99, image: images.hookah },
  { title: "Afzal Chief Commissioner", description: "Rich, robust signature dark spiced blend.", category: "hookah", subcategory: "afzal", price: 22.99, image: images.hookah },

  // Mazaya
  { title: "Mazaya Lemon Mint", description: "Balanced citrus lemon with natural spearmint.", category: "hookah", subcategory: "mazaya", price: 22.99, image: images.hookahGreen },
  { title: "Mazaya Double Apple", description: "Traditional rich aniseed and green apple profile.", category: "hookah", subcategory: "mazaya", price: 22.99, image: images.hookahGreen },

  // Adalya
  { title: "Adalya Love 66", description: "Iconic blend of passion fruit, honeydew melon, watermelon, and mint.", category: "hookah", subcategory: "adalya", price: 24.99, image: images.hookahPremium, tags: ["Popular"], featured: true },
  { title: "Adalya Lady Killer", description: "Mango, melon, berry, and mint signature blend.", category: "hookah", subcategory: "adalya", price: 24.99, image: images.hookahPremium, tags: ["Customer Fav"] },
  { title: "Adalya Sky Fall", description: "Sweet peach, watermelon, and icy menthol blast.", category: "hookah", subcategory: "adalya", price: 24.99, image: images.hookahPremium },
  { title: "Adalya Baku Nights", description: "Exotic fruit blend with cooling mint finish.", category: "hookah", subcategory: "adalya", price: 24.99, image: images.hookahPremium },

  // Al Fakher
  { title: "Al Fakher Double Apple", description: "The classic benchmark hookah flavor — aniseed and sweet apple.", category: "hookah", subcategory: "al-fakher", price: 22.99, image: images.hookah, tags: ["Popular"] },
  { title: "Al Fakher Mint", description: "Pure, crisp, refreshing spearmint.", category: "hookah", subcategory: "al-fakher", price: 22.99, image: images.hookah },
  { title: "Al Fakher Kiwi", description: "Tangy sweet kiwi fruit profile.", category: "hookah", subcategory: "al-fakher", price: 22.99, image: images.hookah },
  { title: "Al Fakher Peach", description: "Sweet orchard peach notes.", category: "hookah", subcategory: "al-fakher", price: 22.99, image: images.hookah },
  { title: "Al Fakher Mango", description: "Lush tropical mango.", category: "hookah", subcategory: "al-fakher", price: 22.99, image: images.hookah },
  { title: "Al Fakher Rose", description: "Fragrant floral rose petal aromatic smoke.", category: "hookah", subcategory: "al-fakher", price: 22.99, image: images.hookah },
  { title: "Al Fakher Strawberry", description: "Sweet ripe strawberry.", category: "hookah", subcategory: "al-fakher", price: 22.99, image: images.hookah },
  { title: "Al Fakher Gum Mint", description: "Spearmint bubblegum mix.", category: "hookah", subcategory: "al-fakher", price: 22.99, image: images.hookah },
  { title: "Al Fakher Orange", description: "Sun-ripened orange citrus.", category: "hookah", subcategory: "al-fakher", price: 22.99, image: images.hookah },
  { title: "Al Fakher Watermelon", description: "Crisp, sweet summer watermelon.", category: "hookah", subcategory: "al-fakher", price: 22.99, image: images.hookah },
  { title: "Al Fakher Pineapple", description: "Tropical pineapple punch.", category: "hookah", subcategory: "al-fakher", price: 22.99, image: images.hookah },
  { title: "Al Fakher Guava", description: "Rich exotic tropical guava.", category: "hookah", subcategory: "al-fakher", price: 22.99, image: images.hookah },
  { title: "Al Fakher Blueberry", description: "Sweet dark blueberry.", category: "hookah", subcategory: "al-fakher", price: 22.99, image: images.hookah },
  { title: "Al Fakher Coconut", description: "Creamy tropical coconut.", category: "hookah", subcategory: "al-fakher", price: 22.99, image: images.hookah },
  { title: "Al Fakher Grape", description: "Rich dark concord grape.", category: "hookah", subcategory: "al-fakher", price: 22.99, image: images.hookah },
  { title: "Al Fakher Magic Love", description: "Passion fruit, melon, and subtle spice.", category: "hookah", subcategory: "al-fakher", price: 22.99, image: images.hookah },
  { title: "Al Fakher Orange Mint", description: "Zesty orange with cooling mint.", category: "hookah", subcategory: "al-fakher", price: 22.99, image: images.hookah },
  { title: "Al Fakher Grapefruit Mint", description: "Tart grapefruit balanced with spearmint.", category: "hookah", subcategory: "al-fakher", price: 22.99, image: images.hookah },

  // House Mixes
  { title: "Alibaba Mix", description: "Signature Alibaba lounge blend with smooth, layered smoke.", category: "hookah", subcategory: "house-mixes", price: 28, image: images.hookahLounge, tags: ["Popular", "Staff Pick"], featured: true },
  { title: "Gully Boy", description: "Bold spicy mint berry blend.", category: "hookah", subcategory: "house-mixes", price: 28, image: images.hookahLounge, tags: ["Customer Fav"] },
  { title: "Dilwale", description: "Sweet rose and double apple romantic fusion.", category: "hookah", subcategory: "house-mixes", price: 28, image: images.hookahLounge },
  { title: "Smooth Criminal", description: "Velvety vanilla peach cream.", category: "hookah", subcategory: "house-mixes", price: 28, image: images.hookahLounge },

  // ==========================================
  // 3. DESSERTS MENU
  // ==========================================
  { title: "Special Shahi Falooda", description: "Traditional sweet rose syrup milk dessert with vermicelli, basil seeds, rabri, and rich pistachio ice cream.", category: "desserts", subcategory: "desserts", price: 11.99, image: images.desserts, tags: ["Popular"], featured: true },
  { title: "Gulab Jamun Cheesecake", description: "Fusion dessert featuring warm gulab jamuns baked inside a silky cardamom-infused cream cheese crust.", category: "desserts", subcategory: "desserts", price: 10.99, image: images.desserts, tags: ["Staff Pick"], featured: true },
  { title: "Molten Lava Cake", description: "Warm chocolate sponge cake with a liquid molten dark chocolate core, served with vanilla bean ice cream.", category: "desserts", subcategory: "desserts", price: 9.99, image: images.desserts },
];

async function seedMenu() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB:", MONGO_URI);

    // Delete all food items from the database
    const deletedFood = await Menu.deleteMany({ category: "food" });
    console.log(`🗑️ Removed ${deletedFood.deletedCount} food items from database.`);

    const bulkOps = menuItemsData.map((item) => ({
      updateOne: {
        filter: { title: item.title },
        update: { $set: { ...item, isAvailable: true } },
        upsert: true,
      },
    }));

    const result = await Menu.bulkWrite(bulkOps);
    console.log(`🎉 Menu Bulk Seeding Completed successfully!`);
    console.log(`   - Upserted: ${result.upsertedCount}`);
    console.log(`   - Modified: ${result.modifiedCount}`);
    console.log(`   - Total Menu Items in DB: ${await Menu.countDocuments()}`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("❌ Seed failed:", err);
    process.exit(1);
  }
}

seedMenu();
