const Menu = require("../models/Menu");
const Table = require("../models/Table");
const env = require("../config/env");
const { asyncHandler } = require("../utils/asyncHandler");

/**
 * Party combos, sized to the table.
 *
 * The item lists are built by rules from the live menu, so every price and
 * every item is real. Only the name and the one-liner come from the model —
 * it never chooses what is in the box, so it cannot invent a product or a
 * price. Without a key, hand-written names are used and nothing else changes.
 */

const MODEL = process.env.OPENROUTER_MODEL || "anthropic/claude-3.5-haiku";
const TIMEOUT_MS = 4000;

/** Roughly one hookah between three or four people. */
const hookahsFor = (seats) => Math.max(1, Math.round(seats / 3.5));
const drinksFor = (seats) => Math.max(1, Math.round(seats * 0.8));

const pick = (list, n) => list.slice(0, Math.max(0, n));
const cheapest = (list) => [...list].sort((a, b) => a.price - b.price);
const dearest = (list) => [...list].sort((a, b) => b.price - a.price);

function money(items) {
  return Math.round(items.reduce((s, i) => s + i.price * i.quantity, 0) * 100) / 100;
}

function line(doc, quantity) {
  return {
    id: String(doc._id),
    name: doc.title,
    price: doc.price,
    quantity,
    subcategory: doc.subcategory,
    image: doc.image,
  };
}

/**
 * Build several distinct packages for a party of `seats`.
 *
 * Each recipe answers a different question a group actually asks: what is
 * cheapest, what impresses, what covers everyone, what if we are only here
 * for an hour.
 */
function buildCombos(seats, menu) {
  const by = (sub) => menu.filter((m) => m.subcategory === sub);

  const types = by("hookah-types").filter((m) => m.price > 0);
  const fruit = by("fresh-fruit");
  const mixes = by("special-mixes");
  const addons = by("add-ons").filter((m) => m.price > 0);
  const mocktails = by("mocktails");
  const juices = by("juices");
  const soda = by("soda");
  const chai = by("chai-coffee");

  const H = hookahsFor(seats);
  const D = drinksFor(seats);
  const combos = [];

  const add = (id, kind, items, note) => {
    const real = items.filter(Boolean);
    if (real.length === 0) return;
    combos.push({ id, kind, note, items: real, total: money(real) });
  };

  if (types.length) {
    const base = cheapest(types)[0];
    add("starter", "Easy Start", [
      line(base, H),
      ...pick(cheapest(soda), 1).map((d) => line(d, D)),
    ], "The straightforward round. Nothing fancy, nothing missing.");
  }

  if (types.length && mocktails.length) {
    const good = cheapest(types)[Math.min(1, types.length - 1)];
    add("classic", "Crowd Pleaser", [
      line(good, H),
      ...pick(mocktails, 2).map((d) => line(d, Math.max(1, Math.ceil(D / 2)))),
      ...pick(cheapest(addons), 1).map((a) => line(a, H)),
    ], "What most tables of this size end up ordering anyway.");
  }

  if (mixes.length) {
    add("house", "House Mixes", [
      ...pick(mixes, Math.min(2, H)).map((m) => line(m, 1)),
      ...pick(mocktails, 1).map((d) => line(d, D)),
    ], "Our own blends. You will not find these anywhere else in Dallas.");
  }

  if (fruit.length) {
    add("fruit", "Fresh Fruit", [
      ...pick(fruit, Math.max(1, Math.floor(H / 2))).map((f) => line(f, 1)),
      ...pick(juices, 1).map((d) => line(d, D)),
      ...pick(cheapest(addons), 1).map((a) => line(a, 1)),
    ], "Carved fruit heads. The table everyone else photographs.");
  }

  if (types.length && addons.length) {
    add("vip", "Go All In", [
      line(dearest(types)[0], H),
      ...pick(dearest(mixes), 1).map((m) => line(m, 1)),
      ...pick(addons, 2).map((a) => line(a, H)),
      ...pick(dearest(mocktails), 2).map((d) => line(d, Math.max(1, Math.ceil(D / 2)))),
    ], "Everything turned up. Bring people you want to impress.");
  }

  if (chai.length && types.length) {
    add("late", "Late Session", [
      line(cheapest(types)[0], H),
      ...pick(chai, 2).map((d) => line(d, Math.max(1, Math.ceil(D / 2)))),
      ...pick(addons.filter((a) => /refill/i.test(a.title)), 1).map((a) => line(a, H)),
    ], "Built to last. Chai, a refill, and nowhere to be.");
  }

  return combos;
}

/** The model names the boxes; it never fills them. */
async function nameCombos(combos, seats) {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) return null;

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
        max_tokens: 400,
        temperature: 0.9,
        messages: [
          {
            role: "system",
            content:
              "You name party packages at a hookah lounge in Dallas. For each " +
              "package you get an id and its contents. Reply with ONLY a JSON " +
              "array of {id, title, tagline}. Title: 2-4 words, confident, a " +
              "little cheeky. Tagline: under 12 words, warm and playful, never " +
              "pushy. No emoji, no exclamation marks, no hashtags. Keep every " +
              "id exactly as given.",
          },
          {
            role: "user",
            content: `Party of ${seats}.\n${combos
              .map(
                (c) =>
                  `${c.id}: ${c.items.map((i) => `${i.quantity}x ${i.name}`).join(", ")} ($${c.total})`
              )
              .join("\n")}`,
          },
        ],
      }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    const text = data?.choices?.[0]?.message?.content || "";
    const match = text.match(/\[[\s\S]*\]/);
    if (!match) return null;
    const parsed = JSON.parse(match[0]);
    if (!Array.isArray(parsed)) return null;

    const byId = new Map(parsed.map((p) => [String(p.id), p]));
    return combos.map((c) => {
      const w = byId.get(c.id);
      return w?.title
        ? { ...c, kind: String(w.title).slice(0, 40), note: String(w.tagline || c.note).slice(0, 90) }
        : c;
    });
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

const getCombos = asyncHandler(async (req, res) => {
  let seats = Number(req.query.seats) || 0;

  if (req.query.tableId) {
    const table = await Table.findById(req.query.tableId).select("seats").lean();
    if (table) seats = table.seats;
  }
  seats = Math.max(1, Math.min(40, seats || 4));

  const menu = await Menu.find({ isAvailable: true }).lean();
  const combos = buildCombos(seats, menu);
  const named = (await nameCombos(combos, seats)) || combos;

  res.json({
    success: true,
    seats,
    source: named === combos ? "rules" : "model",
    combos: named,
  });
});

module.exports = { getCombos };
