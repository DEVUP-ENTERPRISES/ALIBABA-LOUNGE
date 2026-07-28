/** Curated cinematic imagery — warm luxury grading, consistent Pexels IDs */
const p = (id: number, w = 800) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${w}`;

export const menuImages = {
  appetizers: p(1642454),
  sandwiches: p(1633578),
  burger: p(156114),
  bbq: p(1640777),        // replaced 361184 (deleted from Pexels)
  desi: p(958545),        // gourmet plated food — replaced unreliable high-ID
  biryani: p(1640777),    // warm gourmet dish — replaced unreliable high-ID
  karahi: p(2313686),     // spiced pan dish — replaced unreliable high-ID
  chinese: p(357756),
  tacos: p(2097090),
  soup: p(691114),
  fries: p(1893556),
  wings: p(60616),
  chaat: p(1640777),      // replaced unreliable high-ID
  hookah: p(341481),           // hookah narguile smoke — atmospheric dark
  hookahLounge: p(30562747),   // glowing hookah coals in traditional setup
  hookahPremium: p(30694805),  // close-up hookah with glowing charcoal
  hookahGreen: p(4538912),     // selective focus green hookah
  mocktails: p(1125720),
  milkshakes: p(103566),
  juices: p(143133),
  chai: p(1414132),
  soda: p(50593),
  desserts: p(45201),
  cake: p(291528),
  falooda: p(1120588),
  lounge: p(1199957),
  catering: p(3184191),
  events: p(1105666),
  hero: p(262978, 1920),
  experience: p(1199957),
  cuisine: p(958545),
} as const;

export type ImageKey = keyof typeof menuImages;

const foodBySub: Record<string, string> = {
  appetizers: menuImages.appetizers,
  sandwiches: menuImages.sandwiches,
  bbq: menuImages.bbq,
  desi: menuImages.desi,
  chinese: menuImages.chinese,
};

const drinkBySub: Record<string, string> = {
  mocktails: menuImages.mocktails,
  milkshakes: menuImages.milkshakes,
  juices: menuImages.juices,
  "chai-coffee": menuImages.chai,
  soda: menuImages.soda,
};

const itemOverrides: Record<string, string> = {
  "pani-puri-shots": menuImages.chaat,
  "papdi-chaat": menuImages.chaat,
  "samosa-chaat": menuImages.chaat,
  "chicken-wings": menuImages.wings,
  "sheesh-burger": menuImages.burger,
  "sheesh-smash-burger": menuImages.burger,
  "goat-biryani": menuImages.biryani,
  "chicken-biryani": menuImages.biryani,
  "chicken-karahi": menuImages.karahi,
  "magaz-nihari": menuImages.desi,
  "beef-nihari": menuImages.desi,
  "sheesh-bbq-platter": menuImages.bbq,
  "gola-kabob-roll": menuImages.tacos,
  "bang-bang-shrimp": p(699953), // Gourmet cooked chili prawns under rich lighting
  "special-shahi-falooda": menuImages.falooda,
  "gulab-jamun-cheesecake": menuImages.cake,
  "ocean-blue-mojito": menuImages.mocktails,
  hayati: menuImages.mocktails,
  "oreo-milkshake": menuImages.milkshakes,
  "paan-rabri-milkshake": menuImages.milkshakes,
};

export function resolveMenuImage(
  category: string,
  subcategory?: string,
  id?: string
): string {
  if (id && itemOverrides[id]) return itemOverrides[id];

  if (category === "food" && subcategory) {
    return foodBySub[subcategory] ?? menuImages.desi;
  }

  if (category === "hookah") {
    if (subcategory === "premium" || subcategory === "selection") {
      return menuImages.hookahPremium;
    }
    if (subcategory === "house-mixes") return menuImages.hookahLounge;
    return menuImages.hookahGreen;
  }

  if (category === "drinks" && subcategory) {
    return drinkBySub[subcategory] ?? menuImages.mocktails;
  }

  if (category === "desserts") return menuImages.desserts;

  return menuImages.lounge;
}
