const Menu = require("../models/Menu");
const env = require("../config/env");
const { asyncHandler } = require("../utils/asyncHandler");

/**
 * "Goes well with" suggestions for the cart.
 *
 * An LLM proposes pairings, but it never invents menu items: the model is
 * given the real menu and must answer with ids, and anything it returns that
 * is not on the menu is discarded. If the key is missing, the model is slow,
 * or the response is unusable, a deterministic rule set answers instead — a
 * suggestion is a nicety and must never delay an order.
 */

const MODEL = process.env.OPENROUTER_MODEL || "anthropic/claude-3.5-haiku";
const TIMEOUT_MS = 3500;

/** Deterministic pairings, also the fallback when the model is unavailable. */
function ruleBasedSuggestions(cart, menu) {
  const cartIds = new Set(cart.map((i) => String(i._id)));
  const has = (sub) => cart.some((i) => i.subcategory === sub);
  const hasCategory = (cat) => cart.some((i) => i.category === cat);

  const wanted = [];

  // Hookah on the order? Add-ons are the highest-value upsell.
  if (hasCategory("hookah") && !has("add-ons")) wanted.push("add-ons");
  // Hookah but nothing to drink is the most common gap.
  if (hasCategory("hookah") && !hasCategory("drinks")) wanted.push("mocktails", "soda");
  // Drinks only — offer the thing they came for.
  if (hasCategory("drinks") && !hasCategory("hookah")) wanted.push("hookah-types", "special-mixes");
  // Flavors chosen but no fresh fruit head shown yet.
  if (hasCategory("hookah") && !has("fresh-fruit")) wanted.push("fresh-fruit");

  const picked = [];
  for (const sub of wanted) {
    const options = menu.filter((m) => m.subcategory === sub && !cartIds.has(String(m._id)));
    // Cheapest first for add-ons, most popular otherwise.
    options.sort((a, b) => (sub === "add-ons" ? a.price - b.price : b.price - a.price));
    for (const o of options.slice(0, 2)) {
      if (!picked.find((p) => String(p._id) === String(o._id))) picked.push(o);
      if (picked.length >= 4) break;
    }
    if (picked.length >= 4) break;
  }
  return picked.slice(0, 4);
}

async function modelSuggestions(cart, menu) {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) return null;

  // Keep the prompt small: id, name, category, price only.
  const catalogue = menu
    .filter((m) => m.isAvailable !== false)
    .slice(0, 120)
    .map((m) => `${m._id}|${m.title}|${m.subcategory || m.category}|$${m.price}`)
    .join("\n");

  const inCart = cart.map((i) => `${i.title} (${i.subcategory || i.category})`).join(", ");

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
        "HTTP-Referer": env.clientUrl,
        "X-Title": "Alibaba Hookah Lounge",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 120,
        temperature: 0.4,
        messages: [
          {
            role: "system",
            content:
              "You suggest add-ons at a hookah lounge. You are given a menu as " +
              "`id|name|category|price` lines and the guest's current order. " +
              "Reply with ONLY a JSON array of up to 4 menu ids that genuinely " +
              "complement the order, most compelling first. Never invent an id. " +
              "Never repeat something already in the order. Prefer add-ons, " +
              "fruit heads and drinks alongside hookah.",
          },
          { role: "user", content: `MENU:\n${catalogue}\n\nORDER: ${inCart}` },
        ],
      }),
    });

    if (!res.ok) return null;
    const data = await res.json();
    const text = data?.choices?.[0]?.message?.content || "";

    const match = text.match(/\[[\s\S]*?\]/);
    if (!match) return null;
    const ids = JSON.parse(match[0]);
    if (!Array.isArray(ids)) return null;

    // The model may only choose from the real menu.
    const byId = new Map(menu.map((m) => [String(m._id), m]));
    const cartIds = new Set(cart.map((i) => String(i._id)));
    const picked = ids
      .map((id) => byId.get(String(id)))
      .filter((m) => m && !cartIds.has(String(m._id)));

    return picked.length ? picked.slice(0, 4) : null;
  } catch {
    return null; // timeout, network, bad JSON — fall through to rules
  } finally {
    clearTimeout(timer);
  }
}

function formatItem(m) {
  return {
    id: m._id,
    name: m.title,
    description: m.description,
    price: m.price,
    category: m.category,
    subcategory: m.subcategory,
    image: m.image,
  };
}

const getSuggestions = asyncHandler(async (req, res) => {
  const ids = (req.body.itemIds || []).slice(0, 30);
  if (ids.length === 0) return res.json({ success: true, suggestions: [], source: "none" });

  const [cart, menu] = await Promise.all([
    Menu.find({ _id: { $in: ids } }),
    Menu.find({ isAvailable: true }),
  ]);
  if (cart.length === 0) return res.json({ success: true, suggestions: [], source: "none" });

  const fromModel = await modelSuggestions(cart, menu);
  const picked = fromModel || ruleBasedSuggestions(cart, menu);

  res.json({
    success: true,
    source: fromModel ? "model" : "rules",
    suggestions: picked.map(formatItem),
  });
});

module.exports = { getSuggestions };
