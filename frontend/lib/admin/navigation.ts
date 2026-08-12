const ADMIN_SLUG = process.env.NEXT_PUBLIC_ADMIN_SLUG || "admin";
const BASE = `/${ADMIN_SLUG}`;

export const adminNavItems = [
  { href: `${BASE}/dashboard`,    label: "Dashboard",              icon: "layout-dashboard" },
  { href: `${BASE}/orders`,       label: "Order Floor",            icon: "clipboard-list" },
  { href: `${BASE}/floor`,        label: "Floor Plan",             icon: "layout-grid" },
  { href: `${BASE}/menu`,         label: "Menu Management",        icon: "utensils" },
  { href: `${BASE}/events`,       label: "Event Management",       icon: "calendar" },
  { href: `${BASE}/reservations`, label: "Reservations",           icon: "book-open" },
  { href: `${BASE}/gallery`,      label: "Gallery",                icon: "image" },
  { href: `${BASE}/reviews`,      label: "Guest Reviews",          icon: "star" },
  { href: `${BASE}/staff`,        label: "Staff",                  icon: "user-cog" },
  { href: `${BASE}/users`,        label: "Users",                  icon: "users" },
  { href: `${BASE}/settings`,     label: "Settings",               icon: "settings" },
] as const;

export type AdminNavIcon = (typeof adminNavItems)[number]["icon"];

export const ADMIN_BASE = BASE;

