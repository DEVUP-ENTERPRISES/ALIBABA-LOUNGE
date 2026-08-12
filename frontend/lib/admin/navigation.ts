const ADMIN_SLUG = process.env.NEXT_PUBLIC_ADMIN_SLUG || "admin";
const BASE = `/${ADMIN_SLUG}`;

export type StaffRole = "super-admin" | "admin" | "manager" | "server";

/**
 * Who may reach what.
 *
 * A server needs the order floor and the table map — nothing else. Without
 * this a server could edit menu prices, read guest contact details or change
 * venue settings, none of which is their job.
 */
const ALL: StaffRole[] = ["super-admin", "admin", "manager", "server"];
const MANAGER_UP: StaffRole[] = ["super-admin", "admin", "manager"];
const ADMIN_UP: StaffRole[] = ["super-admin", "admin"];
const OWNER_ONLY: StaffRole[] = ["super-admin"];

export const adminNavItems = [
  { href: `${BASE}/orders`,       label: "Order Floor",            icon: "clipboard-list",   roles: ALL },
  { href: `${BASE}/floor`,        label: "Floor Plan",             icon: "layout-grid",      roles: ALL },
  { href: `${BASE}/dashboard`,    label: "Dashboard",              icon: "layout-dashboard", roles: MANAGER_UP },
  { href: `${BASE}/reservations`, label: "Reservations",           icon: "book-open",        roles: MANAGER_UP },
  { href: `${BASE}/menu`,         label: "Menu Management",        icon: "utensils",         roles: ADMIN_UP },
  { href: `${BASE}/events`,       label: "Event Management",       icon: "calendar",         roles: ADMIN_UP },
  { href: `${BASE}/gallery`,      label: "Gallery",                icon: "image",            roles: ADMIN_UP },
  { href: `${BASE}/reviews`,      label: "Guest Reviews",          icon: "star",             roles: ADMIN_UP },
  { href: `${BASE}/users`,        label: "Users",                  icon: "users",            roles: ADMIN_UP },
  { href: `${BASE}/settings`,     label: "Settings",               icon: "settings",         roles: ADMIN_UP },
  { href: `${BASE}/staff`,        label: "Staff",                  icon: "user-cog",         roles: OWNER_ONLY },
  { href: `${BASE}/billing`,      label: "Support the Build",      icon: "heart",            roles: OWNER_ONLY },
] as const;

export type AdminNavIcon = (typeof adminNavItems)[number]["icon"];

export function navItemsFor(role: StaffRole | undefined) {
  if (!role) return [];
  return adminNavItems.filter((i) => (i.roles as readonly StaffRole[]).includes(role));
}

/** Where a role lands after signing in. Servers go straight to the floor. */
export function landingFor(role: StaffRole | undefined) {
  return role === "server" ? `${BASE}/orders` : `${BASE}/dashboard`;
}

/** Is this path allowed for the role? Used by the route guard. */
export function canAccess(role: StaffRole | undefined, pathname: string) {
  if (!role) return false;
  const match = adminNavItems.find((i) => pathname.startsWith(i.href));
  // Unlisted paths (login, index) are handled by the auth guard itself.
  if (!match) return true;
  return (match.roles as readonly StaffRole[]).includes(role);
}

export const ADMIN_BASE = BASE;

