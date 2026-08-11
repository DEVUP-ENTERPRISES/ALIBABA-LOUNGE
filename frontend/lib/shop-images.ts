/**
 * Real photography of the lounge, shot on site.
 *
 * These replace the stock food imagery the site shipped with — Alibaba is a
 * hookah lounge, not an eatery, so burgers and chopping boards were both
 * off-brand and inaccurate.
 */
export const shopImages = {
  /** Main floor: seating, stage, branded wall */
  mainLounge: "/shop-images/main-lounge.webp",
  /** Event night: crowd, DJ, stage lighting */
  eventLounge: "/shop-images/event-lounge.webp",
  /** VIP booths behind the carved screens */
  seatingLounge: "/shop-images/seating-lounge.webp",
  /** Additional seating angle */
  seating: "/shop-images/seating-1.webp",
  /** The hookah bar — bowls and stems lined up */
  showcase: "/shop-images/showcase-lounge.webp",
} as const;

/** Rotates behind the hero. */
export const heroSlides = [
  shopImages.mainLounge,
  shopImages.seatingLounge,
  shopImages.eventLounge,
  shopImages.showcase,
] as const;

export type ShopImageKey = keyof typeof shopImages;
