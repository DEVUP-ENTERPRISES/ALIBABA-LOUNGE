import { hookahItem, slug } from "./helpers";

const houseMixes = [
  "Sheesh Mix",
  "Gully Boy",
  "Dilwale",
  "Smooth Criminal",
  "Daddy Issues",
  "Mommy Issues",
  "Hum Tum",
  "Sabr Ka Phal",
  "Badshah",
  "Chief Saab",
  "Lovely Lady",
  "One Two Ka Four",
  "Teri Maa Ka Paan",
];

const regularFlavors = [
  "Al Faker Vanilla",
  "Al Faker Mint",
  "Al Faker Double Apple",
  "Al Faker Grape Mint",
  "Al Faker Gum",
  "Al Faker Peach",
  "Al Faker Watermelon",
  "Al Faker Blueberry",
  "Al Faker Pan Rasna",
  "Adalya Love 66",
  "Adalya Lady Killer",
  "Adalya Berlin Nights",
  "Starbuzz Blue Mist",
  "Starbuzz Pirate's Cave",
  "Afzal Paan",
  "Afzal Pan Raas",
  "Fumari White Gummi Bear",
  "Fumari Ambrosia",
  "Trifecta Twisted",
  "Social Smoke Absolute Zero",
  "Haze Subzero",
  "Azure Gold",
  "Mazaya Gum",
  "Nakhla Two Apples",
];

const premiumHookahs = [
  "Fumo Premium",
  "Porsche Premium",
  "Maharaja Premium",
  "Halo Premium",
  "Teddy Bear Premium",
  "Moon Man Premium",
  "Kefo Premium",
  "Blade Premium",
  "Matte Black Premium",
];

export const hookahMenu = [
  hookahItem(
    "hookah-selection-classic",
    "Classic Hookah Selection",
    "Premium single-flavor session with expert heat management and crystal bowl.",
    24,
    "selection",
    { tags: ["Popular"] }
  ),
  hookahItem(
    "hookah-selection-deluxe",
    "Deluxe Hookah Selection",
    "Extended session with ice hose tip and flavor refresh.",
    32,
    "selection",
    { tags: ["Staff Pick"], featured: true }
  ),
  hookahItem(
    "hookah-selection-vip",
    "VIP Hookah Selection",
    "Private booth service, premium coal, and custom blend consultation.",
    45,
    "selection",
    { tags: ["Staff Pick"], featured: true }
  ),

  ...houseMixes.map((name) =>
    hookahItem(
      slug(name),
      name,
      `House-crafted blend — ${name}. Signature Sheesh lounge profile with smooth, layered smoke.`,
      28,
      "house-mixes",
      {
        tags:
          name === "Sheesh Mix"
            ? ["Popular", "Staff Pick"]
            : name === "Gully Boy" || name === "Dilwale"
              ? ["Customer Fav"]
              : undefined,
        featured: name === "Sheesh Mix",
      }
    )
  ),

  ...regularFlavors.map((name) =>
    hookahItem(
      slug(name),
      name,
      `Premium ${name} — clean pull, rich aroma, expertly packed.`,
      22,
      "regular",
      {
        tags:
          name.includes("Double Apple") || name.includes("Blue Mist")
            ? ["Popular"]
            : undefined,
      }
    )
  ),

  ...premiumHookahs.map((name) =>
    hookahItem(
      slug(name),
      name,
      `${name} hookah experience — statement piece, velvety clouds, lounge centerpiece.`,
      55,
      "premium",
      {
        tags: ["Staff Pick", "New"],
        featured: name === "Maharaja Premium" || name === "Fumo Premium",
      }
    )
  ),
];
