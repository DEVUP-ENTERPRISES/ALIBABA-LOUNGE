/**
 * ============================================================
 *  🎨 Ali Baba Lounge — Menu Image Generator (DALL-E 3)
 * ============================================================
 *
 *  Usage:
 *    1. Add your OpenAI API key to backend/.env:
 *       OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxx
 *
 *    2. Install the openai package (if not already):
 *       npm install openai
 *
 *    3. Run the script:
 *       node src/scripts/generateMenuImages.js
 *
 *  The script will:
 *    - Generate a unique DALL-E 3 image for every menu item
 *    - Save them to frontend/public/images/menu/<slug>.png
 *    - Skip items that already have an image on disk
 *    - Log progress so you can resume if interrupted
 * ============================================================
 */

const path = require("path");
const fs = require("fs");
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });

// ── OpenAI Setup ────────────────────────────────────────────
const OpenAI = require("openai");
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// ── Output directory ────────────────────────────────────────
// Raw 1024x1024 PNGs land here. This directory is gitignored — it is the
// working set, roughly 725 KB per image. Run optimizeMenuImages.js to emit
// web-sized WebP into frontend/public/images/menu, which IS committed.
const OUTPUT_DIR = path.resolve(__dirname, "../../../frontend/public/images/menu-raw");
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// ── Helper: slugify a title into a filename ─────────────────
function slugify(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "");
}

// ── Helper: delay ───────────────────────────────────────────
const delay = (ms) => new Promise((r) => setTimeout(r, ms));

// ── Helper: download image from URL and save ────────────────
async function downloadImage(url, filepath) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`HTTP ${response.status} downloading image`);
  const buffer = Buffer.from(await response.arrayBuffer());
  fs.writeFileSync(filepath, buffer);
}

// ══════════════════════════════════════════════════════════════
//  📋  MENU ITEMS — each with a custom DALL-E prompt
// ══════════════════════════════════════════════════════════════
const menuItems = [
  // ─────────────────────────────────────────────
  //  MOCKTAILS
  // ─────────────────────────────────────────────
  {
    title: "Regular Mojito",
    prompt: "Professional food photography of a classic mojito mocktail in a tall glass with fresh mint leaves, lime wedges, crushed ice and soda, condensation on glass, dark moody bar background with warm lighting, ultra-realistic, menu card style"
  },
  {
    title: "Mango Mojito",
    prompt: "Professional food photography of a vibrant mango mojito in a tall glass with fresh mango slices, mint sprigs, lime wheel, golden-orange color, crushed ice, dark luxurious bar background, condensation drops, menu card style"
  },
  {
    title: "Strawberry Mojito",
    prompt: "Professional food photography of a strawberry mojito mocktail, vivid pink-red color, fresh strawberry slices, mint leaves, lime, crushed ice in a tall glass, dark moody background with warm highlights, menu card style"
  },
  {
    title: "Watermelon Mojito",
    prompt: "Professional food photography of a watermelon mojito, bright coral-pink drink in a tall glass with watermelon wedge garnish, fresh mint, lime, crushed ice, dark bar background, stunning, menu card style"
  },
  {
    title: "Classic Fresh Lemonade",
    prompt: "Professional food photography of fresh classic lemonade in a mason jar glass, bright yellow, lemon slices floating, ice cubes, mint sprig, condensation on glass, rustic wooden surface, warm natural light, menu card style"
  },
  {
    title: "Pina Colada",
    prompt: "Professional food photography of a creamy pina colada mocktail in a hurricane glass, white creamy coconut drink, pineapple wedge and cherry garnish, tropical vibes, dark luxurious background, menu card style"
  },
  {
    title: "Lychee Mojito Mocktail",
    prompt: "Professional food photography of a lychee mojito, pale translucent pink drink with whole lychee fruits floating, mint leaves, crushed ice, elegant glass, dark sophisticated background, menu card style"
  },
  {
    title: "Ocean Blue Mojito",
    prompt: "Professional food photography of an ocean blue mojito, stunning electric blue curaçao cocktail in a tall glass, dramatic blue color, mint, lime, crushed ice, subtle smoke effect, dark cinematic background with blue light accents, premium menu card style"
  },
  {
    title: "Hayati Mocktail",
    prompt: "Professional food photography of a signature berry hibiscus mocktail, deep ruby-purple color with gold flakes floating, elegant coupe glass, thin wisp of smoke rising, dark luxurious background with warm gold lighting, ultra-premium menu card style"
  },
  {
    title: "Blueberry Mojito",
    prompt: "Professional food photography of a blueberry mojito, deep purple-blue drink with fresh blueberries, mint, lime, crushed ice in a tall glass, dark moody background, menu card style"
  },
  {
    title: "Jamun Mojito",
    prompt: "Professional food photography of a jamun (Indian black plum) mojito, deep dark purple drink with fruit garnish, mint leaves, black salt rim, crushed ice, dark background, unique and exotic, menu card style"
  },
  {
    title: "Pineapple Mojito",
    prompt: "Professional food photography of a pineapple mojito, bright golden-yellow drink, pineapple wedge, mint sprigs, lime, crushed ice in tall glass, tropical feel, dark bar background, menu card style"
  },
  {
    title: "Passion Fruit Mojito",
    prompt: "Professional food photography of a passion fruit mojito, vibrant orange-yellow drink with halved passion fruit garnish showing seeds, mint, lime, crushed ice, dark elegant background, menu card style"
  },
  {
    title: "Mango Mule",
    prompt: "Professional food photography of a mango mule mocktail in a copper mug, bright orange mango puree drink, lime wedge, ginger slices, ice, dark bar background with warm copper tones, premium menu card style"
  },
  {
    title: "Mint Lemonade",
    prompt: "Professional food photography of mint lemonade, bright refreshing green-yellow drink, abundant fresh mint leaves, lemon slices, crushed ice in a tall glass, condensation drops, light and refreshing feel, menu card style"
  },
  {
    title: "Berry Burlesque",
    prompt: "Professional food photography of a mixed berry mocktail, deep crimson-red color with fresh raspberries, blackberries, blueberries piled on top, lime wheel, ginger ale fizz, dark dramatic background, premium menu card style"
  },
  {
    title: "Falsay Mojito",
    prompt: "Professional food photography of a traditional Indian phalsa berry drink, deep purple color, garnished with small berries, mint, black salt rim, crushed ice, dark background, exotic and unique, menu card style"
  },
  {
    title: "Lassi",
    prompt: "Professional food photography of a traditional Indian mango lassi, thick creamy golden-yellow yogurt drink in a tall glass, saffron strands on top, pistachio crumble, authentic Indian clay pot nearby, warm background, menu card style"
  },

  // ─────────────────────────────────────────────
  //  FRESH JUICES
  // ─────────────────────────────────────────────
  {
    title: "Fresh Orange Juice",
    prompt: "Professional food photography of freshly squeezed orange juice in a clear glass, bright vivid orange color, halved oranges nearby, juice splashing, dewy condensation, bright natural light, clean white surface, menu card style"
  },
  {
    title: "Fresh Pineapple Juice",
    prompt: "Professional food photography of fresh pineapple juice, bright golden-yellow, fresh pineapple slices and crown nearby, clear glass, tropical, natural light, clean background, menu card style"
  },
  {
    title: "Fresh Watermelon Juice",
    prompt: "Professional food photography of fresh watermelon juice, vibrant pink-red, watermelon slices with seeds nearby, tall glass, summer vibes, mint garnish, bright natural light, menu card style"
  },
  {
    title: "Fresh Apple Juice",
    prompt: "Professional food photography of fresh cold-pressed apple juice, clear amber-gold color, red apple slices nearby, glass with condensation, natural light, clean background, menu card style"
  },
  {
    title: "Fresh Carrot Juice",
    prompt: "Professional food photography of fresh carrot juice, vibrant deep orange, whole carrots and carrot sticks nearby, clear glass, healthy and nutritious look, natural light, menu card style"
  },
  {
    title: "Fresh Sugarcane Juice",
    prompt: "Professional food photography of fresh sugarcane juice, light green-gold color in a clear glass, sugarcane stalks nearby, lime and ginger pieces, tropical feel, natural background, menu card style"
  },
  {
    title: "Fresh Young Coconut Water",
    prompt: "Professional food photography of a young green coconut with a straw, fresh and tropical, coconut water visible, clean white background, vibrant green shell, refreshing look, menu card style"
  },
  {
    title: "Assorted Juice",
    prompt: "Professional food photography of a colorful lineup of assorted fresh juices in glasses — mango, watermelon, orange, pineapple — rainbow of colors, fruits arranged around, bright cheerful lighting, menu card style"
  },

  // ─────────────────────────────────────────────
  //  CHAI & COFFEE
  // ─────────────────────────────────────────────
  {
    title: "Iced Cold Coffee",
    prompt: "Professional food photography of iced cold coffee in a tall glass, layered milk and espresso, drizzled dark chocolate, whipped cream, ice cubes, condensation, dark moody café background, premium menu card style"
  },
  {
    title: "Tea (Black / Mint / Green)",
    prompt: "Professional food photography of three cups of tea — black, mint, and green tea — in elegant ceramic cups, steam rising, fresh mint leaves and green tea leaves nearby, warm cozy lighting, menu card style"
  },
  {
    title: "Masala Tea",
    prompt: "Professional food photography of traditional Indian masala chai in a glass cup, warm amber-brown color, cinnamon sticks, cardamom pods, star anise, ginger, cloves scattered around, steam rising, warm rustic background, menu card style"
  },
  {
    title: "Tea Pot Small",
    prompt: "Professional food photography of a small traditional teapot with hot tea, steam wisps, elegant porcelain, warm amber liquid pouring into a small cup, cozy warm background, menu card style"
  },
  {
    title: "Tea Pot Big",
    prompt: "Professional food photography of a large ornate teapot with two small cups, steaming hot tea, warm golden liquid, elegant table setting, warm ambient lighting, sharing atmosphere, menu card style"
  },
  {
    title: "Hot Lemon",
    prompt: "Professional food photography of hot lemon tea in a clear glass mug, bright yellow, lemon slices, honey drizzling, fresh mint leaves, steam rising, warm cozy background, menu card style"
  },
  {
    title: "Black Coffee",
    prompt: "Professional food photography of black coffee in a ceramic mug, dark rich espresso, crema on top, coffee beans scattered nearby, moody dark background, steam rising, minimalist and bold, menu card style"
  },
  {
    title: "Milk Coffee",
    prompt: "Professional food photography of a warm milk coffee in a ceramic cup, light brown creamy color, latte art attempt, steamed milk foam, warm café ambiance, soft lighting, menu card style"
  },
  {
    title: "Special Gurwali Chai",
    prompt: "Professional food photography of traditional gurwali chai with jaggery, dark amber color in a traditional Indian clay kulhar cup, jaggery block nearby, rustic wooden surface, warm golden lighting, menu card style"
  },
  {
    title: "Special Dhaba Chai",
    prompt: "Professional food photography of strong Indian dhaba style chai, rich dark-brown tea in a small glass, cardamom pods, being poured dramatically from a height, steam, rustic iron kettle, roadside dhaba vibe, menu card style"
  },
  {
    title: "Mint Tea Pot",
    prompt: "Professional food photography of Moroccan mint tea in an ornate silver teapot, fresh mint sprigs, being poured into a small decorative glass, vibrant green, warm North African ambiance, menu card style"
  },
  {
    title: "Doodh Pati",
    prompt: "Professional food photography of Pakistani doodh pati chai, creamy white-pink milk tea in a small cup, green cardamom pods, boiled purely in milk, rich and thick, warm cozy background, menu card style"
  },
  {
    title: "Americano",
    prompt: "Professional food photography of an americano coffee, dark black coffee in a white ceramic cup, subtle crema, clean modern minimalist café setting, dark background, premium, menu card style"
  },
  {
    title: "Espresso Shot",
    prompt: "Professional food photography of a single espresso shot in a small white demitasse cup, rich golden crema, intense and concentrated, coffee beans, dark dramatic background, premium, menu card style"
  },
  {
    title: "Latte & Cappuccino",
    prompt: "Professional food photography of a latte and cappuccino side by side, beautiful latte art rosetta pattern, silky steamed milk foam, warm café ambiance, premium ceramic cups, menu card style"
  },
  {
    title: "Biscoff Latte",
    prompt: "Professional food photography of a Biscoff latte, caramel-brown latte with Lotus Biscoff cookie crumbled on top, cookie spread drizzle, latte art, warm and indulgent, cozy café background, menu card style"
  },

  // ─────────────────────────────────────────────
  //  SODA & WATER
  // ─────────────────────────────────────────────
  {
    title: "Soda",
    prompt: "Professional food photography of assorted colorful sodas in glass bottles — cola, orange, lime, lemon — ice bucket, condensation droplets, fizzy bubbles, dark bar background, refreshing, menu card style"
  },
  {
    title: "Bottle Water",
    prompt: "Professional food photography of a premium glass water bottle, crystal clear water, water droplets on surface, ice cubes nearby, clean minimalist background, refreshing pure look, menu card style"
  },
  {
    title: "Sparkling Water",
    prompt: "Professional food photography of sparkling mineral water in a glass, visible tiny bubbles rising, lime wedge, elegant, crisp clear, dark background, premium feel, menu card style"
  },
  {
    title: "Topo Chico (Lime / Regular)",
    prompt: "Professional food photography of a Topo Chico sparkling water bottle with lime wedge, ice, condensation on glass bottle, Mexican import vibes, clean bright background, refreshing, menu card style"
  },
  {
    title: "Coconut Water",
    prompt: "Professional food photography of coconut water in a glass with a straw, young coconut nearby, tropical leaves, clean bright background, hydrating and refreshing feel, menu card style"
  },
  {
    title: "Red Bull",
    prompt: "Professional food photography of an energy drink can poured into a glass with ice, golden-amber fizzy liquid, dynamic splash, dark dramatic background with blue and silver accents, energetic feel, menu card style"
  },

  // ─────────────────────────────────────────────
  //  MILKSHAKES
  // ─────────────────────────────────────────────
  {
    title: "Oreo Milkshake",
    prompt: "Professional food photography of a decadent Oreo milkshake in a tall glass, thick creamy white shake with crushed Oreo cookies, whipped cream, whole Oreo on top, chocolate drizzle, dark background, indulgent, menu card style"
  },
  {
    title: "Chocolate Milkshake",
    prompt: "Professional food photography of a rich chocolate milkshake, thick dark brown shake in a tall glass, whipped cream peak, chocolate shavings, cocoa powder dusted, chocolate syrup dripping, dark luxurious background, menu card style"
  },
  {
    title: "Pistachio Milkshake",
    prompt: "Professional food photography of a pistachio milkshake, pale green creamy thick shake, crushed pistachios on top, saffron strands, gold-dusted rim, elegant glass, dark luxurious background, premium feel, menu card style"
  },
  {
    title: "Nutella Milkshake",
    prompt: "Professional food photography of a Nutella milkshake, rich brown hazelnut chocolate shake, Nutella jar nearby, whipped cream, hazelnut pieces on top, chocolate drizzle, indulgent, dark background, menu card style"
  },
  {
    title: "Paan Rabri Milkshake",
    prompt: "Professional food photography of a paan rabri milkshake, unique green-pink creamy shake with betel leaf garnish, rabri cream topping, pistachio crumble, saffron, traditional Indian style, dark luxurious background, signature drink, menu card style"
  },

  // ─────────────────────────────────────────────
  //  HOOKAH — Selection
  // ─────────────────────────────────────────────
  {
    title: "Classic Hookah Selection",
    prompt: "Professional photography of a premium classic hookah setup with a crystal glass bowl on an ornate metal stem, glowing charcoal, thick white smoke rising, warm ambient lighting, luxurious lounge booth setting, dark moody background, premium menu card style"
  },
  {
    title: "Deluxe Hookah Selection",
    prompt: "Professional photography of a deluxe hookah setup with ice hose tip, premium crystal bowl, glowing coals, thick smooth smoke, blue LED accent lighting, VIP lounge table setting, dark dramatic background, ultra-premium menu card style"
  },
  {
    title: "VIP Hookah Selection",
    prompt: "Professional photography of a VIP hookah experience in a private booth, multiple hoses, premium glass hookah with gold accents, luxurious velvet seating, warm gold and purple ambient lighting, thick smoke, exclusive premium feel, menu card style"
  },

  // ─────────────────────────────────────────────
  //  HOOKAH — Starbuzz Flavors
  // ─────────────────────────────────────────────
  {
    title: "Starbuzz Safari Melon",
    prompt: "Professional food photography of ripe honeydew and cantaloupe melon slices with subtle hookah smoke swirling around them, exotic tropical feel, dark moody background, warm lighting, vibrant green and orange, premium hookah menu card style"
  },
  {
    title: "Starbuzz Code 69",
    prompt: "Professional food photography of halved passion fruits and fresh fruit punch with hookah smoke wisps, vibrant orange-purple colors, exotic and bold, dark dramatic background, premium hookah menu card style"
  },
  {
    title: "Starbuzz Blue Mist",
    prompt: "Professional food photography of fresh blueberries with a cooling icy-blue mist effect and elegant hookah smoke drifting, menthol crystals, dark luxurious background, blue accent lighting, premium hookah menu card style"
  },
  {
    title: "Starbuzz Sex on the Beach",
    prompt: "Professional food photography of orange slices, cranberries, and sliced peach with tropical hookah smoke, cocktail-inspired colors, warm sunset tones, dark background, exotic and vibrant, premium hookah menu card style"
  },
  {
    title: "Starbuzz Exotic Guava",
    prompt: "Professional food photography of halved pink guava fruits with hookah smoke wisps, tropical lush vibes, vibrant pink-green colors, dark moody background, exotic premium feel, hookah menu card style"
  },
  {
    title: "Starbuzz Pirate's Cave",
    prompt: "Professional food photography of limes and tropical fruit punch with hookah smoke, citrus blast feel, vibrant green-yellow colors, dark dramatic cave-like background, adventurous mood, premium hookah menu card style"
  },
  {
    title: "Starbuzz Green Savior",
    prompt: "Professional food photography of fresh herbs, botanical leaves, and green spices with hookah smoke swirling, earthy herbal feel, dark moody background with green accents, natural and organic, premium hookah menu card style"
  },
  {
    title: "Starbuzz Citrus Mist",
    prompt: "Professional food photography of lemons and limes with icy frost and hookah smoke, zesty citrus feel, cool blue-green mist effect, dark background, refreshing and crisp, premium hookah menu card style"
  },
  {
    title: "Starbuzz Tangerine Dream",
    prompt: "Professional food photography of peeled tangerine segments with creamy hookah smoke, warm orange dreamy glow, dark background, soft and creamy feel, vibrant citrus, premium hookah menu card style"
  },
  {
    title: "Starbuzz White Peach",
    prompt: "Professional food photography of halved white peaches with juice glistening and hookah smoke wisps, soft peachy-white tones, dark elegant background, delicate and sweet, premium hookah menu card style"
  },
  {
    title: "Starbuzz Irish Peach",
    prompt: "Professional food photography of ripe peaches with citrus zest and vanilla pods, hookah smoke swirling, warm golden creamy tones, dark rich background, sophisticated blend, premium hookah menu card style"
  },
  {
    title: "Starbuzz Mighty Freeze",
    prompt: "Professional food photography of ice crystals, frozen lemon drops, and menthol leaves with intense blue-white hookah smoke, freezing cold visual effect, dark background with icy blue lighting, extreme cool, premium hookah menu card style"
  },

  // ─────────────────────────────────────────────
  //  HOOKAH — Fumari Flavors
  // ─────────────────────────────────────────────
  {
    title: "Fumari Spiced Chai",
    prompt: "Professional food photography of cinnamon sticks, cardamom pods, and a warm chai cup with hookah smoke rising, warm golden-brown tones, cozy and aromatic, dark moody background, premium hookah menu card style"
  },
  {
    title: "Fumari Lemon Mint",
    prompt: "Professional food photography of fresh lemons and bright mint leaves with crisp hookah smoke, zesty and refreshing, yellow-green color palette, dark background, clean and vibrant, premium hookah menu card style"
  },
  {
    title: "Fumari Ambrosia",
    prompt: "Professional food photography of marshmallows, melon slices, and citrus fruits with dreamy hookah smoke, sweet and heavenly feel, soft pastel colors, dark luxurious background, premium hookah menu card style"
  },
  {
    title: "Fumari White Gummy Bear",
    prompt: "Professional food photography of pineapple chunks and colorful gummy bears with playful hookah smoke wisps, fun vibrant candy colors, sweet and fruity, dark background with neon accents, premium hookah menu card style"
  },
  {
    title: "Fumari Mandarin",
    prompt: "Professional food photography of juicy mandarin orange segments, peeled and glistening, with elegant hookah smoke, warm orange glow, dark moody background, sweet and fresh, premium hookah menu card style"
  },
  {
    title: "Fumari Tangelo",
    prompt: "Professional food photography of halved tangelo citrus fruit showing juicy pink-orange flesh with hookah smoke, hybrid citrus feel, vibrant colors, dark background, tangy and fresh, premium hookah menu card style"
  },

  // ─────────────────────────────────────────────
  //  HOOKAH — Afzal Flavors
  // ─────────────────────────────────────────────
  {
    title: "Afzal Paan",
    prompt: "Professional food photography of traditional Indian betel leaves (paan) folded with fillings, with rich hookah smoke rising, deep green leaves, dark moody background with warm Indian-style lighting, aromatic and exotic, premium hookah menu card style"
  },
  {
    title: "Afzal Kesar Paan",
    prompt: "Professional food photography of betel leaves with saffron strands draped over them, golden saffron glow, hookah smoke wisps, luxurious feel, dark background with warm gold lighting, premium hookah menu card style"
  },
  {
    title: "Afzal Paan Masala",
    prompt: "Professional food photography of spiced paan with colorful Indian mouth-freshener spices scattered around, hookah smoke, vibrant colors, dark background with warm spice tones, traditional and aromatic, premium hookah menu card style"
  },
  {
    title: "Afzal Lychee",
    prompt: "Professional food photography of peeled lychee fruits, translucent white flesh with red shells nearby, hookah smoke drifting, exotic sweet feel, dark elegant background, floral and delicate, premium hookah menu card style"
  },
  {
    title: "Afzal Dubai Mint",
    prompt: "Professional food photography of fresh mint leaves with desert sand particles and hookah smoke, cool crisp feel, green and gold color palette, dark background with Dubai-style luxury lighting, premium hookah menu card style"
  },
  {
    title: "Afzal Mango Lassi",
    prompt: "Professional food photography of ripe mango slices with creamy yogurt swirl and hookah smoke, rich golden-yellow and white, tropical and creamy, dark background, Indian lounge feel, premium hookah menu card style"
  },
  {
    title: "Afzal Chief Commissioner",
    prompt: "Professional food photography of dark exotic spices — cloves, star anise, black pepper, dark tobacco leaves — with thick dramatic hookah smoke, rich dark moody tones, masculine and bold, dark background, premium hookah menu card style"
  },

  // ─────────────────────────────────────────────
  //  HOOKAH — Mazaya Flavors
  // ─────────────────────────────────────────────
  {
    title: "Mazaya Lemon Mint",
    prompt: "Professional food photography of lemon halves and fresh spearmint leaves with hookah smoke, balanced citrus-mint feel, bright yellow-green, dark background, classic and refreshing, premium hookah menu card style"
  },
  {
    title: "Mazaya Double Apple",
    prompt: "Professional food photography of red and green apples with star anise (aniseed) and hookah smoke swirling, traditional hookah flavor feel, deep rich colors, dark background, classic and iconic, premium hookah menu card style"
  },

  // ─────────────────────────────────────────────
  //  HOOKAH — Adalya Flavors
  // ─────────────────────────────────────────────
  {
    title: "Adalya Love 66",
    prompt: "Professional food photography of passion fruit, honeydew melon, watermelon slices, and mint with romantic hookah smoke, vibrant mixed tropical colors, love theme with soft pink accents, dark background, premium hookah menu card style"
  },
  {
    title: "Adalya Lady Killer",
    prompt: "Professional food photography of mango, melon, mixed berries, and mint leaves with dramatic hookah smoke, bold and colorful, femme fatale vibes, dark dramatic background with purple accents, premium hookah menu card style"
  },
  {
    title: "Adalya Sky Fall",
    prompt: "Professional food photography of sliced peaches, watermelon, and menthol ice crystals with cascading hookah smoke, falling sky effect, blue-peach color palette, dark cinematic background, premium hookah menu card style"
  },
  {
    title: "Adalya Baku Nights",
    prompt: "Professional food photography of exotic mixed fruits with cool mint and mysterious hookah smoke, nighttime luxury feel, dark purple-blue lighting, exotic and alluring, dark background, premium hookah menu card style"
  },

  // ─────────────────────────────────────────────
  //  HOOKAH — Al Fakher Flavors
  // ─────────────────────────────────────────────
  {
    title: "Al Fakher Double Apple",
    prompt: "Professional food photography of red and green apples with aniseed stars and classic hookah smoke, the benchmark hookah flavor, rich deep colors, traditional feel, dark background, iconic premium hookah menu card style"
  },
  {
    title: "Al Fakher Mint",
    prompt: "Professional food photography of fresh spearmint leaves piled up with crisp hookah smoke, pure refreshing green, icy frost effect, dark background, clean and classic, premium hookah menu card style"
  },
  {
    title: "Al Fakher Kiwi",
    prompt: "Professional food photography of sliced kiwi fruits showing green flesh and black seeds with hookah smoke, tangy-sweet feel, vibrant green, dark background, fresh and tropical, premium hookah menu card style"
  },
  {
    title: "Al Fakher Peach",
    prompt: "Professional food photography of ripe juicy peaches, halved showing pit, with soft hookah smoke, warm peachy-orange tones, velvety and sweet, dark elegant background, premium hookah menu card style"
  },
  {
    title: "Al Fakher Mango",
    prompt: "Professional food photography of sliced ripe mangoes with juice dripping and hookah smoke, lush tropical golden-yellow, dark background, rich and tropical, premium hookah menu card style"
  },
  {
    title: "Al Fakher Rose",
    prompt: "Professional food photography of pink and red rose petals scattered with elegant hookah smoke, fragrant floral feel, romantic pink-red tones, dark background, delicate and aromatic, premium hookah menu card style"
  },
  {
    title: "Al Fakher Strawberry",
    prompt: "Professional food photography of ripe red strawberries with hookah smoke wisps, sweet and juicy, vibrant red, dark moody background, classic fruit, premium hookah menu card style"
  },
  {
    title: "Al Fakher Gum Mint",
    prompt: "Professional food photography of spearmint leaves with bubblegum-pink accents and hookah smoke, playful minty-sweet feel, green and pink color palette, dark background, fun and refreshing, premium hookah menu card style"
  },
  {
    title: "Al Fakher Orange",
    prompt: "Professional food photography of sliced sun-ripened oranges with juice and hookah smoke, bright vivid orange, citrus burst, dark background, fresh and vibrant, premium hookah menu card style"
  },
  {
    title: "Al Fakher Watermelon",
    prompt: "Professional food photography of watermelon slices with red flesh and black seeds, hookah smoke, summer vibes, vibrant red-green, dark background, sweet and crisp, premium hookah menu card style"
  },
  {
    title: "Al Fakher Pineapple",
    prompt: "Professional food photography of fresh pineapple slices and chunks with hookah smoke, tropical punch feel, bright golden-yellow, dark background, sweet and tangy, premium hookah menu card style"
  },
  {
    title: "Al Fakher Guava",
    prompt: "Professional food photography of halved pink guava fruits with hookah smoke, exotic tropical, vibrant pink-green, dark background, rich and exotic, premium hookah menu card style"
  },
  {
    title: "Al Fakher Blueberry",
    prompt: "Professional food photography of fresh dark blueberries piled up with purple hookah smoke, sweet and rich, deep purple-blue tones, dark background, premium hookah menu card style"
  },
  {
    title: "Al Fakher Coconut",
    prompt: "Professional food photography of cracked coconut halves with white flesh and coconut milk, hookah smoke, tropical creamy feel, white-brown tones, dark background, smooth and tropical, premium hookah menu card style"
  },
  {
    title: "Al Fakher Grape",
    prompt: "Professional food photography of dark concord grapes on vine with hookah smoke, rich purple-black, winery feel, dark luxurious background, deep and bold, premium hookah menu card style"
  },
  {
    title: "Al Fakher Magic Love",
    prompt: "Professional food photography of passion fruit, honeydew melon, and subtle spices with magical hookah smoke, enchanting feel, mixed warm colors, dark background with sparkle accents, premium hookah menu card style"
  },
  {
    title: "Al Fakher Orange Mint",
    prompt: "Professional food photography of orange slices with fresh mint leaves and hookah smoke, zesty-cool combination, orange-green color palette, dark background, refreshing blend, premium hookah menu card style"
  },
  {
    title: "Al Fakher Grapefruit Mint",
    prompt: "Professional food photography of halved pink grapefruit with spearmint and hookah smoke, tart and fresh, pink-green colors, dark background, balanced and refreshing, premium hookah menu card style"
  },

  // ─────────────────────────────────────────────
  //  HOOKAH — House Mixes
  // ─────────────────────────────────────────────
  {
    title: "Alibaba Mix",
    prompt: "Professional food photography of an exotic blend of layered fruits and spices with thick, luxurious hookah smoke, signature lounge feel, gold and amber tones, ornate Middle Eastern styling, dark background, ultra-premium exclusive, hookah menu card style"
  },
  {
    title: "Gully Boy",
    prompt: "Professional food photography of mixed berries, mint, and red chili pepper with bold dramatic hookah smoke, street-style bold energy, vibrant red-green-purple colors, dark gritty background, bold and spicy, premium hookah menu card style"
  },
  {
    title: "Dilwale",
    prompt: "Professional food photography of rose petals and red-green apples with romantic hookah smoke, love theme, soft pink and red tones, heart-shaped arrangement, dark background with warm romantic lighting, premium hookah menu card style"
  },
  {
    title: "Smooth Criminal",
    prompt: "Professional food photography of sliced peaches with vanilla beans and cream with velvety hookah smoke, smooth and silky feel, soft peach-cream-gold tones, dark sleek background, sophisticated and smooth, premium hookah menu card style"
  },

  // ─────────────────────────────────────────────
  //  DESSERTS
  // ─────────────────────────────────────────────
  {
    title: "Special Shahi Falooda",
    prompt: "Professional food photography of Indian shahi falooda dessert in a tall glass, layered rose syrup, vermicelli noodles, basil seeds, rabri cream, topped with pistachio ice cream scoop, pink-white-green layers, ornate spoon, dark luxurious background, premium Indian dessert menu card style"
  },
  {
    title: "Gulab Jamun Cheesecake",
    prompt: "Professional food photography of a gulab jamun cheesecake, golden-brown gulab jamuns on a creamy cheesecake slice, cardamom-infused, syrup drizzling, saffron strands, pistachio garnish, fusion dessert, dark luxurious background, premium menu card style"
  },
  {
    title: "Molten Lava Cake",
    prompt: "Professional food photography of a molten lava chocolate cake cut open with liquid dark chocolate flowing out, vanilla ice cream scoop on the side melting, cocoa powder dusted plate, dark dramatic background, warm indulgent, premium dessert menu card style"
  },
];

// ══════════════════════════════════════════════════════════════
//  🚀  Main Generator
// ══════════════════════════════════════════════════════════════
async function generateAllImages() {
  console.log("╔══════════════════════════════════════════════════════╗");
  console.log("║  🎨  Ali Baba Lounge — Menu Image Generator         ║");
  console.log("╚══════════════════════════════════════════════════════╝");
  console.log(`\n📁 Output directory: ${OUTPUT_DIR}`);
  console.log(`📋 Total items to generate: ${menuItems.length}\n`);

  let generated = 0;
  let skipped = 0;
  let failed = 0;

  for (let i = 0; i < menuItems.length; i++) {
    const item = menuItems[i];
    const slug = slugify(item.title);
    const filepath = path.join(OUTPUT_DIR, `${slug}.png`);

    // Skip if already exists
    if (fs.existsSync(filepath)) {
      console.log(`⏭️  [${i + 1}/${menuItems.length}] Skipping "${item.title}" — already exists`);
      skipped++;
      continue;
    }

    console.log(`\n🎨 [${i + 1}/${menuItems.length}] Generating: "${item.title}"...`);

    // Retry logic (up to 3 attempts)
    let success = false;
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const response = await openai.images.generate({
          model: "dall-e-3",
          prompt: item.prompt,
          n: 1,
          size: "1024x1024",
          quality: "standard",
        });

        const imageUrl = response.data[0].url;
        await downloadImage(imageUrl, filepath);

        console.log(`   ✅ Saved: ${slug}.png`);
        generated++;
        success = true;
        break;
      } catch (err) {
        console.error(`   ⚠️  Attempt ${attempt}/3 failed: ${err.message}`);
        if (attempt < 3) {
          const backoff = attempt * 5000;
          console.log(`   ⏳ Retrying in ${backoff / 1000}s...`);
          await delay(backoff);
        } else {
          console.error(`   ❌ Failed after 3 attempts. Skipping.`);
          failed++;
        }
      }
    }

    // Rate limit: wait between successful requests to avoid 429s
    if (success && i < menuItems.length - 1) {
      await delay(2000); // 2 second gap between requests
    }
  }

  // ── Summary ─────────────────────────────────────────────────
  console.log("\n╔══════════════════════════════════════════════════════╗");
  console.log("║  📊  Generation Summary                             ║");
  console.log("╠══════════════════════════════════════════════════════╣");
  console.log(`║  ✅ Generated: ${String(generated).padStart(3)}                               ║`);
  console.log(`║  ⏭️  Skipped:   ${String(skipped).padStart(3)}                               ║`);
  console.log(`║  ❌ Failed:    ${String(failed).padStart(3)}                               ║`);
  console.log("╚══════════════════════════════════════════════════════╝");

  // ── Generate the updated seedMenu image map ─────────────────
  console.log("\n📝 Generating updated image map for seedMenu.js...\n");
  console.log("// Copy-paste this into your seedMenu.js images object:");
  console.log("// (Each menu item now has its own unique image)\n");

  for (const item of menuItems) {
    const slug = slugify(item.title);
    const imgPath = `/images/menu/${slug}.png`;
    console.log(`  // ${item.title}`);
    console.log(`  // image: "${imgPath}",`);
  }

  console.log("\n✨ Done! Now update seedMenu.js to use per-item images and re-run the seeder.");
}

generateAllImages().catch(console.error);
