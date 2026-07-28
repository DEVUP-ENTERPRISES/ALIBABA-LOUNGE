export const colors = {
  black: "#050505",
  charcoal: "#0c0c0e",
  charcoalLight: "#141418",
  gold: "#d4af37",
  goldLight: "#f5e6c8",
  goldDark: "#8b6914",
  smoke: "rgba(255, 255, 255, 0.04)",
} as const;

export const fonts = {
  display: "var(--font-display)",
  body: "var(--font-body)",
  accent: "var(--font-accent)",
} as const;

export const navLinks = [
  { href: "/", label: "Home" },
  { href: "/menu", label: "Menu" },
  { href: "/events", label: "Events" },
  { href: "/reservation", label: "Reservations" },
  { href: "/catering", label: "Catering" },
  { href: "/franchise", label: "Franchise" },
  { href: "/gallery", label: "Gallery" },
] as const;
