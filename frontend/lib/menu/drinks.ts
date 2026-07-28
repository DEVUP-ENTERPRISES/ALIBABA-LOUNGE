import { drinkItem, slug } from "./helpers";

const mocktails = [
  "Lychee Mojito Mocktail",
  "Strawberry Mojito Mocktail",
  "Blueberry Mojito",
  "Jamun Mojito",
  "Mango Mojito",
  "Pineapple Mojito",
  "Passion Fruit Mojito",
  "Ocean Blue Mojito",
  "Mango Mule",
  "OG Lemonade",
  "Mint Lemonade",
  "Berry Burlesque",
  "Hayati",
  "Pina Colada",
  "Falsay Mojito",
];

const milkshakes = [
  "Oreo Milkshake",
  "Chocolate Milkshake",
  "Pistachio Milkshake",
  "Nutella Milkshake",
  "Bombay Breeze Milkshake",
  "Paan Rabri Milkshake",
  "Strawberry Milkshake",
  "Badam Milkshake",
];

const juices = [
  "Fresh Watermelon Juice",
  "Fresh Carrot Juice",
  "Fresh Sugarcane Juice",
  "Fresh Orange Juice",
  "Fresh Apple Juice",
  "Fresh Young Coconut",
];

const chaiCoffee = [
  "Special Gurwali Chai",
  "Special Dhaba Chai",
  "Mint Tea",
  "Mint Tea Pot",
  "Doodh Pati",
  "Americano",
  "Espresso Shot",
  "Latte & Cappuccino",
  "Biscoff Latte",
];

const soda = [
  "Coke",
  "Diet Coke",
  "Coke Zero",
  "Sprite",
  "Limca",
  "Pakola",
  "Vimto",
  "Fiji Water",
  "Sparkling Water",
  "Dr Pepper",
  "Bottled Water",
  "Thumbs Up",
];

function mocktailDesc(name: string) {
  return `${name} — handcrafted, ice-cold, garnished with fresh herbs and a cinematic pour.`;
}

export const drinksMenu = [
  ...mocktails.map((name, i) =>
    drinkItem(slug(name), name, mocktailDesc(name), 10 + (i % 3), "mocktails", {
      tags:
        name.includes("Ocean Blue") || name.includes("Hayati")
          ? ["Popular", "Staff Pick"]
          : name.includes("Lychee")
            ? ["Customer Fav"]
            : undefined,
      featured: name === "Ocean Blue Mojito" || name === "Hayati",
    })
  ),

  ...milkshakes.map((name) =>
    drinkItem(
      slug(name),
      name,
      `${name} — thick, velvety, crowned with whipped cream and gold dust.`,
      9,
      "milkshakes",
      {
        tags:
          name.includes("Oreo") || name.includes("Paan")
            ? ["Popular"]
            : undefined,
        featured: name === "Paan Rabri Milkshake",
      }
    )
  ),

  ...juices.map((name) =>
    drinkItem(
      slug(name),
      name,
      `${name} — pressed to order, bright, refreshing, no compromise.`,
      8,
      "juices",
      { tags: name.includes("Sugarcane") ? ["Customer Fav"] : undefined }
    )
  ),

  ...chaiCoffee.map((name) =>
    drinkItem(
      slug(name),
      name,
      `${name} — brewed with intention, served at the perfect temperature.`,
      name.includes("Espresso") ? 4 : name.includes("Latte") ? 6 : 5,
      "chai-coffee",
      {
        tags:
          name.includes("Dhaba") || name.includes("Biscoff")
            ? ["Staff Pick"]
            : undefined,
        featured: name === "Special Dhaba Chai",
      }
    )
  ),

  ...soda.map((name) =>
    drinkItem(
      slug(name),
      name,
      `${name} — chilled and served with premium glassware.`,
      name.includes("Water") ? 4 : 3,
      "soda"
    )
  ),
];
