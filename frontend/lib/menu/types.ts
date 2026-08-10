export type MenuCategory = "hookah" | "drinks";

export type MenuTag = "Popular" | "Staff Pick" | "Customer Fav" | "New";

export type HookahSubcategory =
  | "hookah-types"
  | "fresh-fruit"
  | "special-mixes"
  | "starbuzz"
  | "fumari"
  | "afzal"
  | "mazaya"
  | "adalya"
  | "al-fakher"
  | "add-ons"
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
