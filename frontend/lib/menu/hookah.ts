import { hookahItem, slug } from "./helpers";

const starbuzzFlavors = [
  { name: "Safari Melon", desc: "Smooth, sweet, and exotic melon profile." },
  { name: "Code 69", desc: "Tart passion fruit and cool fruit punch blend." },
  { name: "Blue Mist", desc: "Refining sweet blueberry with a cooling menthol undertone.", tag: "Popular" },
  { name: "Sex on the Beach", desc: "Tropical cocktail blend of orange, cranberry, and peach." },
  { name: "Exotic Guava", desc: "Lush, sweet tropical guava smoke." },
  { name: "Pirate's Cave", desc: "Lime and fruit punch blast with citrus notes." },
  { name: "Green Savior", desc: "Traditional herbal spice and botanical notes." },
  { name: "Citrus Mist", desc: "Zesty lemon-lime with a refreshing icy finish." },
  { name: "Tangerine Dream", desc: "Creamy orange tangerine flavor profile." },
  { name: "White Peach", desc: "Juicy, sweet orchard white peach." },
  { name: "Irish Peach", desc: "Peach with a hint of citrus and creamy vanilla." },
  { name: "Mighty Freeze", desc: "Intense icy menthol combined with lemon drop." },
];

const fumariFlavors = [
  { name: "Spiced Chai", desc: "Warm sweet tea infused with cinnamon and cardamom.", tag: "Staff Pick" },
  { name: "Lemon Mint", desc: "Zesty tart lemon paired with crisp cooling mint." },
  { name: "Ambrosia", desc: "Sweet marshmallow and fresh citrus melon mix." },
  { name: "White Gummy Bear", desc: "Famous pineapple and gummy candy profile.", tag: "Popular" },
  { name: "Mandarin", desc: "Juicy, sweet mandarin orange notes." },
  { name: "Tangelo", desc: "Hybrid citrus mix of grapefruit and tangerine." },
];

const afzalFlavors = [
  { name: "Paan", desc: "Authentic betel leaf flavor with rich aromatic undertones.", tag: "Popular" },
  { name: "Kesar Paan", desc: "Betel leaf infused with luxurious saffron." },
  { name: "Paan Masala", desc: "Spiced betel leaf with traditional Indian notes." },
  { name: "Lychee", desc: "Exotic, sweet floral lychee fruit pull." },
  { name: "Dubai Mint", desc: "Cool, crisp desert mint with smooth finish." },
  { name: "Mango Lassi", desc: "Creamy mango and yogurt lounge smoke." },
  { name: "Chief Commissioner", desc: "Rich, robust signature dark spiced blend." },
];

const mazayaFlavors = [
  { name: "Lemon Mint", desc: "Balanced citrus lemon with natural spearmint." },
  { name: "Double Apple", desc: "Traditional rich aniseed and green apple profile." },
];

const adalyaFlavors = [
  { name: "Love 66", desc: "Iconic blend of passion fruit, honeydew melon, watermelon, and mint.", tag: "Popular", featured: true },
  { name: "Lady Killer", desc: "Mango, melon, berry, and mint signature blend.", tag: "Customer Fav" },
  { name: "Sky Fall", desc: "Sweet peach, watermelon, and icy menthol blast." },
  { name: "Baku Nights", desc: "Exotic fruit blend with cooling mint finish." },
];

const alFakherFlavors = [
  { name: "Kiwi", desc: "Tangy sweet kiwi fruit profile." },
  { name: "Peach", desc: "Sweet orchard peach notes." },
  { name: "Double Apple", desc: "The classic benchmark hookah flavor — aniseed and sweet apple.", tag: "Popular" },
  { name: "Mango", desc: "Lush tropical mango." },
  { name: "Mint", desc: "Pure, crisp, refreshing spearmint." },
  { name: "Rose", desc: "Fragrant floral rose petal aromatic smoke." },
  { name: "Strawberry", desc: "Sweet ripe strawberry." },
  { name: "Gum Mint", desc: "Spearmint bubblegum mix." },
  { name: "Orange", desc: "Sun-ripened orange citrus." },
  { name: "Watermelon", desc: "Crisp, sweet summer watermelon." },
  { name: "Pineapple", desc: "Tropical pineapple punch." },
  { name: "Guava", desc: "Rich exotic tropical guava." },
  { name: "Blueberry", desc: "Sweet dark blueberry." },
  { name: "Coconut", desc: "Creamy tropical coconut." },
  { name: "Grape", desc: "Rich dark concord grape." },
  { name: "Magic Love", desc: "Passion fruit, melon, and subtle spice." },
  { name: "Orange Mint", desc: "Zesty orange with cooling mint." },
  { name: "Grapefruit Mint", desc: "Tart grapefruit balanced with spearmint." },
];

const houseMixes = [
  { name: "Alibaba Mix", desc: "Signature Alibaba lounge blend with smooth, layered smoke.", tag: "Popular", featured: true },
  { name: "Gully Boy", desc: "Bold spicy mint berry blend.", tag: "Customer Fav" },
  { name: "Dilwale", desc: "Sweet rose and double apple romantic fusion." },
  { name: "Smooth Criminal", desc: "Velvety vanilla peach cream." },
  { name: "Daddy Issues", desc: "Heavy icy citrus menthol kick." },
  { name: "Mommy Issues", desc: "Sweet white gummy and lychee splash." },
  { name: "Hum Tum", desc: "Dual melon and passionfruit harmony." },
  { name: "Sabr Ka Phal", desc: "Slow-burning mixed berry and paan." },
  { name: "Badshah", desc: "Royal saffron, paan, and cardamom mix." },
  { name: "Chief Saab", desc: "Rich dark leaf espresso and cocoa." },
  { name: "Lovely Lady", desc: "Lady killer and love 66 fusion." },
];

export const hookahMenu = [
  // --- HOOKAH SELECTIONS ---
  hookahItem("hookah-selection-classic", "Classic Hookah Selection", "Premium single-flavor session with expert heat management and crystal bowl.", 24, "selection", { tags: ["Popular"] }),
  hookahItem("hookah-selection-deluxe", "Deluxe Hookah Selection", "Extended session with ice hose tip and flavor refresh.", 32, "selection", { tags: ["Staff Pick"], featured: true }),
  hookahItem("hookah-selection-vip", "VIP Hookah Selection", "Private booth service, premium coal, and custom blend consultation.", 45, "selection", { tags: ["Staff Pick"], featured: true }),

  // --- BRAND: STARBUZZ ---
  ...starbuzzFlavors.map((item) =>
    hookahItem(slug(`Starbuzz ${item.name}`), `Starbuzz ${item.name}`, item.desc, 22.99, "starbuzz", {
      tags: item.tag ? [item.tag as any] : undefined,
    })
  ),

  // --- BRAND: FUMARI ---
  ...fumariFlavors.map((item) =>
    hookahItem(slug(`Fumari ${item.name}`), `Fumari ${item.name}`, item.desc, 24.99, "fumari", {
      tags: item.tag ? [item.tag as any] : undefined,
    })
  ),

  // --- BRAND: AFZAL ---
  ...afzalFlavors.map((item) =>
    hookahItem(slug(`Afzal ${item.name}`), `Afzal ${item.name}`, item.desc, 22.99, "afzal", {
      tags: item.tag ? [item.tag as any] : undefined,
    })
  ),

  // --- BRAND: MAZAYA ---
  ...mazayaFlavors.map((item) =>
    hookahItem(slug(`Mazaya ${item.name}`), `Mazaya ${item.name}`, item.desc, 22.99, "mazaya"),
  ),

  // --- BRAND: ADALYA ---
  ...adalyaFlavors.map((item) =>
    hookahItem(slug(`Adalya ${item.name}`), `Adalya ${item.name}`, item.desc, 24.99, "adalya", {
      tags: item.tag ? [item.tag as any] : undefined,
      featured: item.featured,
    })
  ),

  // --- BRAND: AL FAKHER ---
  ...alFakherFlavors.map((item) =>
    hookahItem(slug(`Al Fakher ${item.name}`), `Al Fakher ${item.name}`, item.desc, 22.99, "al-fakher", {
      tags: item.tag ? [item.tag as any] : undefined,
    })
  ),

  // --- HOUSE MIXES ---
  ...houseMixes.map((item) =>
    hookahItem(slug(item.name), item.name, item.desc, 28, "house-mixes", {
      tags: item.tag ? [item.tag as any] : undefined,
      featured: item.featured,
    })
  ),
];
