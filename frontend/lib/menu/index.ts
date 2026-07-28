import { foodMenu } from "./food";
import { hookahMenu } from "./hookah";
import { drinksMenu } from "./drinks";
import { dessertsMenu } from "./desserts";
import type {
  MenuCategory,
  FoodSubcategory,
  HookahSubcategory,
  DrinksSubcategory,
  MenuItem,
} from "./types";

export const menuCategories: { id: MenuCategory; label: string }[] = [
  { id: "food", label: "Food" },
  { id: "hookah", label: "Hookah" },
  { id: "drinks", label: "Drinks" },
  { id: "desserts", label: "Desserts" },
];

export const foodSubcategories: { id: FoodSubcategory; label: string }[] = [
  { id: "all", label: "All" },
  { id: "appetizers", label: "Appetizers" },
  { id: "sandwiches", label: "Sandwiches & Rolls" },
  { id: "bbq", label: "BBQ" },
  { id: "desi", label: "Desi" },
  { id: "chinese", label: "Chinese" },
];

export const hookahSubcategories: { id: HookahSubcategory; label: string }[] = [
  { id: "all", label: "All" },
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
  ...foodMenu,
  ...hookahMenu,
  ...drinksMenu,
  ...dessertsMenu,
];

export const featuredMenuItems = menuItems
  .filter((i) => i.featured)
  .slice(0, 8);
