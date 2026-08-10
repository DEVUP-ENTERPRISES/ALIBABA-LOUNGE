import { hookahMenu } from "./hookah";
import { drinksMenu } from "./drinks";
import type {
  MenuCategory,
  HookahSubcategory,
  DrinksSubcategory,
  MenuItem,
} from "./types";

export const menuCategories: { id: MenuCategory; label: string }[] = [
  { id: "hookah", label: "Hookah" },
  { id: "drinks", label: "Drinks" },
];

export const hookahSubcategories: { id: HookahSubcategory; label: string }[] = [
  { id: "all", label: "All" },
  { id: "hookah-types", label: "Hookah Types" },
  { id: "fresh-fruit", label: "Fresh Fruit" },
  { id: "special-mixes", label: "Special Mixes" },
  { id: "starbuzz", label: "Starbuzz" },
  { id: "fumari", label: "Fumari" },
  { id: "afzal", label: "Afzal" },
  { id: "mazaya", label: "Mazaya" },
  { id: "adalya", label: "Adalya" },
  { id: "al-fakher", label: "Al Fakher" },
  { id: "add-ons", label: "Add-Ons" },
];

export const drinksSubcategories: { id: DrinksSubcategory; label: string }[] = [
  { id: "all", label: "All" },
  { id: "mocktails", label: "Mocktails" },
  { id: "juices", label: "Juices" },
  { id: "chai-coffee", label: "Chai & Coffee" },
  { id: "soda", label: "Soda & More" },
];

export const menuItems: MenuItem[] = [
  ...hookahMenu,
  ...drinksMenu,
];

export const featuredMenuItems = menuItems
  .filter((i) => i.featured)
  .slice(0, 8);
