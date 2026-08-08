import { hookahMenu } from "./hookah";
import { drinksMenu } from "./drinks";
import { dessertsMenu } from "./desserts";
import type {
  MenuCategory,
  HookahSubcategory,
  DrinksSubcategory,
  MenuItem,
} from "./types";

export const menuCategories: { id: MenuCategory; label: string }[] = [
  { id: "hookah", label: "Hookah" },
  { id: "drinks", label: "Drinks" },
  { id: "desserts", label: "Desserts" },
];

export const hookahSubcategories: { id: HookahSubcategory; label: string }[] = [
  { id: "all", label: "All" },
  { id: "starbuzz", label: "Starbuzz" },
  { id: "fumari", label: "Fumari" },
  { id: "afzal", label: "Afzal" },
  { id: "mazaya", label: "Mazaya" },
  { id: "adalya", label: "Adalya" },
  { id: "al-fakher", label: "Al Fakher" },
  { id: "selection", label: "Hookah Selection" },
  { id: "house-mixes", label: "House Mixes" },
  { id: "regular", label: "Regular Flavors" },
];

export const drinksSubcategories: { id: DrinksSubcategory; label: string }[] = [
  { id: "all", label: "All" },
  { id: "mocktails", label: "Mocktails" },
  { id: "milkshakes", label: "Milkshakes" },
  { id: "juices", label: "Juices" },
  { id: "chai-coffee", label: "Chai & Coffee" },
  { id: "soda", label: "Soda & More" },
];

export const menuItems: MenuItem[] = [
  ...hookahMenu,
  ...drinksMenu,
  ...dessertsMenu,
];

export const featuredMenuItems = menuItems
  .filter((i) => i.featured)
  .slice(0, 8);
