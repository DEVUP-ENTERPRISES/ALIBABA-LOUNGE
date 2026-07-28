export type MenuCategory = "food" | "hookah" | "drinks" | "desserts";

export type MenuTag = "Popular" | "Staff Pick" | "Customer Fav" | "New";

export type FoodSubcategory =
  | "appetizers"
  | "sandwiches"
  | "bbq"
  | "desi"
  | "chinese"
  | "all";

export type HookahSubcategory =
  | "selection"
  | "house-mixes"
  | "regular"
  | "premium"
  | "all";

export type DrinksSubcategory =
  | "mocktails"
  | "milkshakes"
  | "juices"
  | "chai-coffee"
  | "soda"
  | "all";

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: MenuCategory;
  subcategory?: string;
  image: string;
  tags?: MenuTag[];
  featured?: boolean;
  layout?: "default" | "wide";
}
