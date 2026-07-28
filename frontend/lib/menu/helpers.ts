import { resolveMenuImage } from "@/lib/menu-images";
import type { MenuItem, MenuTag, MenuCategory } from "./types";

type FoodSub =
  | "appetizers"
  | "sandwiches"
  | "bbq"
  | "desi"
  | "chinese";

export function foodItem(
  id: string,
  name: string,
  description: string,
  price: number,
  subcategory: FoodSub,
  opts?: {
    tags?: MenuTag[];
    featured?: boolean;
    image?: string;
    layout?: MenuItem["layout"];
  }
): MenuItem {
  return {
    id,
    name,
    description,
    price,
    category: "food",
    subcategory,
    image: opts?.image ?? resolveMenuImage("food", subcategory, id),
    tags: opts?.tags,
    featured: opts?.featured,
    layout: opts?.layout,
  };
}

export function hookahItem(
  id: string,
  name: string,
  description: string,
  price: number,
  subcategory: MenuItem["subcategory"],
  opts?: { tags?: MenuTag[]; featured?: boolean; image?: string }
): MenuItem {
  return {
    id,
    name,
    description,
    price,
    category: "hookah",
    subcategory,
    image: opts?.image ?? resolveMenuImage("hookah", subcategory, id),
    tags: opts?.tags,
    featured: opts?.featured,
  };
}

export function drinkItem(
  id: string,
  name: string,
  description: string,
  price: number,
  subcategory: string,
  opts?: { tags?: MenuTag[]; featured?: boolean }
): MenuItem {
  return {
    id,
    name,
    description,
    price,
    category: "drinks",
    subcategory,
    image: resolveMenuImage("drinks", subcategory, id),
    tags: opts?.tags,
    featured: opts?.featured,
  };
}

export function dessertItem(
  id: string,
  name: string,
  description: string,
  price: number,
  opts?: { tags?: MenuTag[]; featured?: boolean; image?: string }
): MenuItem {
  return {
    id,
    name,
    description,
    price,
    category: "desserts",
    subcategory: "desserts",
    image: opts?.image ?? resolveMenuImage("desserts", "desserts", id),
    tags: opts?.tags,
    featured: opts?.featured,
  };
}

export function slug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
