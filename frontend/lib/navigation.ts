/** Public site navigation constants */
export const RESERVE_PHONE = "+14695865437";

export const routes = {
  home: "/",
  menu: "/menu",
  events: "/events",
  reservation: "/reservation",
  gallery: "/gallery",
} as const;

/** Home page section anchors for smooth scroll */
export const homeSections = {
  experience: "experience",
  menu: "menu",
  hookah: "hookah",
  events: "events",
  reviews: "reviews",
  reserve: "reserve",
} as const;

export function homeHash(section: keyof typeof homeSections) {
  return `/#${homeSections[section]}`;
}

export const NAVBAR_OFFSET = -96;
