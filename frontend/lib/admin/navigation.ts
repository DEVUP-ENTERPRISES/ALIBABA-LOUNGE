const BASE = `/admin`;

export const adminNavItems = [
  { href: `${BASE}/dashboard`,    label: "Dashboard",              icon: "layout-dashboard" },
  { href: `${BASE}/menu`,         label: "Menu Management",        icon: "utensils" },
  { href: `${BASE}/events`,       label: "Event Management",       icon: "calendar" },
  { href: `${BASE}/reservations`, label: "Reservations",           icon: "book-open" },
  { href: `${BASE}/catering`,     label: "Catering Inquiries",     icon: "concierge-bell" },
  { href: `${BASE}/franchise`,    label: "Franchise Applications", icon: "building" },
  { href: `${BASE}/gallery`,      label: "Gallery",                icon: "image" },
  { href: `${BASE}/users`,        label: "Users",                  icon: "users" },
  { href: `${BASE}/settings`,     label: "Settings",               icon: "settings" },
] as const;

export type AdminNavIcon = (typeof adminNavItems)[number]["icon"];

export const ADMIN_BASE = BASE;
