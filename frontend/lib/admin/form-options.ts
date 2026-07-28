import type { MenuCategory } from "@/lib/menu/types";

export const adminCategoryOptions: { value: MenuCategory; label: string }[] = [
  { value: "food", label: "Food" },
  { value: "drinks", label: "Drinks" },
  { value: "hookah", label: "Hookah" },
  { value: "desserts", label: "Desserts" },
];

export const adminSubcategoryOptions: Record<
  MenuCategory,
  { value: string; label: string }[]
> = {
  food: [
    { value: "appetizers", label: "Appetizers" },
    { value: "sandwiches", label: "Sandwiches & Rolls" },
    { value: "bbq", label: "BBQ" },
    { value: "desi", label: "Desi" },
    { value: "chinese", label: "Chinese" },
  ],
  drinks: [
    { value: "mocktails", label: "Mocktails" },
    { value: "milkshakes", label: "Milkshakes" },
    { value: "juices", label: "Juices" },
    { value: "chai-coffee", label: "Chai & Coffee" },
    { value: "soda", label: "Soda & More" },
  ],
  hookah: [
    { value: "selection", label: "Hookah Selection" },
    { value: "house-mixes", label: "House Mixes" },
    { value: "regular", label: "Regular Flavors" },
    { value: "premium", label: "Premium Hookahs" },
  ],
  desserts: [{ value: "desserts", label: "Desserts" }],
};

export const adminTagOptions = [
  { value: "Popular", label: "Popular" },
  { value: "Staff Pick", label: "Staff Pick" },
  { value: "Customer Fav", label: "Customer Fav" },
  { value: "New", label: "New" },
] as const;

export const eventStatusOptions = [
  { value: "Draft", label: "Draft" },
  { value: "Published", label: "Published" },
  { value: "Archived", label: "Archived" },
];

export const galleryCategoryOptions = [
  { value: "Food", label: "Food" },
  { value: "Drinks", label: "Drinks" },
  { value: "Hookah", label: "Hookah" },
  { value: "Ambiance", label: "Ambiance" },
  { value: "Events", label: "Events" },
  { value: "Desserts", label: "Desserts" },
];
