"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Clock, Lock, Minus, Plus, ShoppingBag, Sparkles, X } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { menuApi, orderApi, tableApi } from "@/lib/admin/data-api";
import { API_BASE_URL } from "@/lib/admin/api";
import type { FloorTable, Order } from "@/lib/admin/types";
import type { MenuItem } from "@/lib/menu/types";
import { resolveImageUrl } from "@/lib/image-url";
import { useAuth } from "@/contexts/AuthContext";
import { useSmoothScroll } from "@/contexts/SmoothScrollContext";
import { useNudgeDue, useOpenTab } from "@/hooks/useOpenTab";
import { getCookie, setCookie, getJsonCookie, setJsonCookie, deleteCookie } from "@/lib/cookies";
import { cn } from "@/lib/utils";

const CART_KEY = "alibaba-cart";
const SEAT_KEY = "alibaba-seat";
/** Long enough to survive a session at the table, short enough to go stale. */
const CART_TTL_SECONDS = 4 * 60 * 60;

type CartLine = { item: MenuItem; quantity: number };

interface ComboItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  subcategory: string;
  image: string;
}
interface Combo {
  id: string;
  kind: string;
  note: string;
  items: ComboItem[];
  total: number;
}
type Step = "table" | "menu" | "review" | "done";

/**
 * The order a guest actually decides in.
 *
 * Free-form category tabs let someone land on tobacco brands without ever
 * choosing the hookah those flavours sit in. These stages walk through it,
 * and every one can be skipped.
 */
const STAGES = [
  {
    id: "hookah",
    label: "Your Hookah",
    blurb: "Pick the setup. Flavour comes next, and it is included.",
    category: "hookah",
    subs: ["hookah-types", "fresh-fruit", "special-mixes"],
  },
  {
    id: "flavour",
    label: "Your Flavour",
    blurb: "Six brands, no extra charge.",
    category: "hookah",
    subs: ["starbuzz", "fumari", "afzal", "mazaya", "adalya", "al-fakher"],
  },
  {
    id: "extras",
    label: "Add-Ons",
    blurb: "Ice base, fresh hose, refills.",
    category: "hookah",
    subs: ["add-ons"],
  },
  {
    id: "drinks",
    label: "Drinks",
    blurb: "Mocktails, juices, chai and soda.",
    category: "drinks",
    subs: ["mocktails", "juices", "chai-coffee", "soda"],
  },
] as const;

export function OrderPageContent() {
  const { user } = useAuth();
  const { setPaused } = useSmoothScroll();
  const { tab, ready: tabReady, remember, clear } = useOpenTab();
  const nudgeDue = useNudgeDue(tab?.lastOrderAt);
  const [nudgeDismissed, setNudgeDismissed] = useState(false);

  const [step, setStep] = useState<Step>("table");
  const [tables, setTables] = useState<FloorTable[]>([]);
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [table, setTable] = useState<FloorTable | null>(null);
  const [stageIndex, setStageIndex] = useState(0);
  const [lastCall, setLastCall] = useState<{ headline: string; items: MenuItem[] } | null>(null);
  const [lastCallBusy, setLastCallBusy] = useState(false);
  const [combos, setCombos] = useState<Combo[]>([]);
  const [combosOpen, setCombosOpen] = useState(false);
  const [sub, setSub] = useState<string>("all");
  const [cart, setCart] = useState<CartLine[]>([]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [placed, setPlaced] = useState<Order | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [cartRestored, setCartRestored] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Suggestions come from the server; it decides whether to use the model.
  const [suggestions, setSuggestions] = useState<MenuItem[]>([]);

  useEffect(() => {
    tableApi.list().then(setTables).catch(() => {});
    menuApi.list("?limit=500&isAvailable=true").then(setMenu).catch(() => {});
  }, []);

  /**
   * Keep the cart across a reload or a stray Back press.
   *
   * Losing a built-up order because someone swiped back is the fastest way to
   * lose the order entirely — they will not rebuild it. Stored as ids and
   * quantities only; prices are re-read from the menu, so a stale cookie can
   * never carry an old price into a new order.
   */
  useEffect(() => {
    if (menu.length === 0 || cartRestored) return;
    const saved = getJsonCookie<{ id: string; q: number }[]>(CART_KEY);
    if (saved?.length) {
      const byId = new Map(menu.map((m) => [m.id, m]));
      const lines = saved
        .map((r) => {
          const item = byId.get(r.id);
          return item ? { item, quantity: Math.max(1, Math.min(50, r.q)) } : null;
        })
        .filter(Boolean) as CartLine[];
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (lines.length) setCart(lines);
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCartRestored(true);
  }, [menu, cartRestored]);

  // Persist on every change, once the initial restore has run.
  useEffect(() => {
    if (!cartRestored) return;
    if (cart.length === 0) deleteCookie(CART_KEY);
    else
      setJsonCookie(
        CART_KEY,
        cart.map((l) => ({ id: l.item.id, q: l.quantity })),
        CART_TTL_SECONDS
      );
  }, [cart, cartRestored]);

  useEffect(() => {
    // Prefill once auth resolves; the name is not known during first render.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (user?.displayName && !name) setName(user.displayName);
  }, [user, name]);

  // Pause smooth scroll and lock the page while the cart sheet is open, so
  // wheel and touch reach the sheet instead of the document behind it.
  useEffect(() => {
    setPaused(cartOpen);
    document.body.style.overflow = cartOpen ? "hidden" : "";
    return () => {
      setPaused(false);
      document.body.style.overflow = "";
    };
  }, [cartOpen, setPaused]);

  // A seat chosen earlier in this session, even if nothing was ordered yet.
  useEffect(() => {
    if (table || tables.length === 0) return;
    const seatId = getCookie(SEAT_KEY);
    if (!seatId) return;
    const seat = tables.find((t) => t.id === seatId);
    if (seat) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTable(seat);
      setStep("menu");
    }
  }, [table, tables]);

  // Returning guest with a live tab: skip the table step. Their own table
  // reads as locked to everyone else, so asking them to pick it again would
  // look like a fault.
  useEffect(() => {
    if (!tabReady || !tab || table || tables.length === 0) return;
    const seat = tables.find((t) => t.id === tab.tableId);
    if (seat) {
      // Restoring a remembered tab depends on the tables having loaded, so it
      // cannot happen during render.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTable(seat);
      setStep("menu");
    }
  }, [tabReady, tab, table, tables]);

  const stage = STAGES[stageIndex];

  /**
   * Packages sized to the table.
   *
   * A group of ten does not want to assemble an order item by item, and left
   * to themselves they under-order. The server builds these from the live
   * menu, so every price is real.
   */
  useEffect(() => {
    if (!table) return;
    let alive = true;
    fetch(`${API_BASE_URL}/combos?tableId=${table.id}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!alive || !data?.combos?.length) return;
        setCombos(data.combos);
        // Offer them straight away, but only while the cart is untouched —
        // nobody wants a package pushed at them mid-order.
        setCombosOpen(cart.length === 0);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [table?.id]);

  const addCombo = (combo: Combo) => {
    const byId = new Map(menu.map((m) => [m.id, m]));
    setCart((prev) => {
      const next = [...prev];
      for (const ci of combo.items) {
        const item = byId.get(ci.id);
        if (!item) continue;
        const found = next.find((l) => l.item.id === item.id);
        if (found) found.quantity += ci.quantity;
        else next.push({ item, quantity: ci.quantity });
      }
      return next;
    });
    setCombosOpen(false);
    setCartOpen(true);
  };

  const subcategories = useMemo(() => {
    const present = new Set(
      menu.filter((m) => m.category === stage.category).map((m) => m.subcategory || "")
    );
    const ordered = (stage.subs as readonly string[]).filter((x) => present.has(x));
    return ordered.length > 1 ? ["all", ...ordered] : ordered;
  }, [menu, stage]);

  const visible = useMemo(
    () =>
      menu.filter(
        (m) =>
          m.category === stage.category &&
          (stage.subs as readonly string[]).includes(m.subcategory || "") &&
          (sub === "all" || m.subcategory === sub)
      ),
    [menu, stage, sub]
  );

  /**
   * What is left to explore, grouped the way the menu is.
   *
   * Built from what is NOT on the tab, so a guest is never offered the thing
   * they just ordered. Five per rail keeps each row swipeable.
   */
  const browseRails = useMemo(() => {
    if (!placed) return [];
    const ordered = new Set(placed.items.map((i) => String(i.menuItem)));

    const groups: { id: string; label: string; items: MenuItem[] }[] = [];
    for (const st of STAGES) {
      for (const subId of st.subs) {
        const items = menu
          .filter((m) => m.subcategory === subId && !ordered.has(m.id))
          .slice(0, 5);
        if (items.length > 0) {
          groups.push({
            id: subId,
            label: subId.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
            items,
          });
        }
      }
    }
    return groups;
  }, [placed, menu]);

  // Flavours cost nothing on their own, so a cart of only flavours totals $0.
  // Require at least one priced item — you cannot smoke a flavour without a
  // hookah, and the server rejects it too.
  const hasPricedItem = cart.some((l) => l.item.price > 0);

  // No tax here — the till settles it on the printed receipt, and the API
  // returns totals without it. Adding it twice made the cart disagree with
  // the confirmed order.
  const totals = useMemo(() => {
    const subtotal = cart.reduce((s, l) => s + l.item.price * l.quantity, 0);
    return {
      subtotal,
      total: subtotal,
      count: cart.reduce((n, l) => n + l.quantity, 0),
    };
  }, [cart]);

  const addItem = (item: MenuItem) =>
    setCart((prev) => {
      const found = prev.find((l) => l.item.id === item.id);
      return found
        ? prev.map((l) => (l.item.id === item.id ? { ...l, quantity: l.quantity + 1 } : l))
        : [...prev, { item, quantity: 1 }];
    });

  const changeQty = (id: string, delta: number) =>
    setCart((prev) =>
      prev
        .map((l) => (l.item.id === id ? { ...l, quantity: l.quantity + delta } : l))
        .filter((l) => l.quantity > 0)
    );

  // Ask the server what pairs well once there is something in the cart.
  useEffect(() => {
    // With an open tab we still want ideas to show in the nudge, so fall back
    // to asking about the last order rather than clearing the list.
    if (cart.length === 0 && !tab) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSuggestions([]);
      return;
    }
    if (cart.length === 0 && tab && !nudgeDue) {
      return;
    }
    let alive = true;
    const controller = new AbortController();
    fetch(
      `${process.env.NEXT_PUBLIC_API_URL || ""}/suggestions`.replace(/([^:])\/\//g, "$1/"),
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          itemIds: cart.length > 0 ? cart.map((l) => l.item.id) : [],
          tableId: table?.id ?? tab?.tableId,
        }),
      }
    )
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!alive || !data?.suggestions) return;
        const ids = new Set(cart.map((l) => l.item.id));
        setSuggestions(data.suggestions.filter((s: MenuItem) => !ids.has(s.id)).slice(0, 4));
      })
      .catch(() => {});
    return () => {
      alive = false;
      controller.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cart, tab, nudgeDue, table?.id]);

  /**
   * Last call.
   *
   * Runs once per order, and only when there is a genuine gap — a hookah with
   * nothing to drink, no add-ons, that sort of thing. If the server has
   * nothing worth saying it submits straight through, so this never becomes
   * a toll gate on every order.
   */
  const tryLastCall = async () => {
    if (!table || lastCall) return false;
    setLastCallBusy(true);
    try {
      const res = await fetch(`${API_BASE_URL}/suggestions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemIds: cart.map((l) => l.item.id),
          tableId: table.id,
          mode: "last-call",
        }),
      });
      if (!res.ok) return false;
      const data = await res.json();
      const ids = new Set(cart.map((l) => l.item.id));
      const items = (data.suggestions || []).filter((i: MenuItem) => !ids.has(i.id)).slice(0, 4);
      if (items.length === 0 || !data.headline) return false;
      setLastCall({ headline: data.headline, items });
      return true;
    } catch {
      return false;
    } finally {
      setLastCallBusy(false);
    }
  };

  const placeOrder = async (skipLastCall = false) => {
    if (!table || cart.length === 0 || !hasPricedItem) return;

    if (!skipLastCall && (await tryLastCall())) return;
    setSubmitting(true);
    setError(null);
    try {
      const order = await orderApi.create({
        table: table.id,
        items: cart.map((l) => ({ menuItem: l.item.id, quantity: l.quantity })),
        customerName: name.trim(),
        customerPhone: phone.trim(),
        notes: notes.trim(),
      });
      setPlaced(order);
      // These items are now on the tab; leaving them in the cart would restore
      // an already-sent order if the guest reopens the page.
      setCart([]);
      remember({
        tableId: table.id,
        tableCode: order.tableCode,
        orderNumber: order.orderNumber,
      });
      setNudgeDismissed(false);
      setCartOpen(false);
      setStep("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not place the order.");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Confirmation ───────────────────────────────────────────
  if (step === "done" && placed) {
    return (
      <div className="cinematic-backdrop relative min-h-screen pt-24 pb-20 pb-mobile-cta">
        <div className="relative mx-auto max-w-xl px-5 text-center sm:px-8">
          <div className="mx-auto flex size-20 items-center justify-center rounded-full border border-[#d4af37]/40 bg-[#d4af37]/10">
            <Check className="size-9 text-[#d4af37]" />
          </div>
          <h1 className="mt-6 font-[family-name:var(--font-display)] text-3xl text-white">
            Order #{placed.orderNumber}
          </h1>
          <p className="mt-3 text-white/55">
            Sent to the floor for table{" "}
            <span className="text-[#d4af37]">{placed.tableCode}</span>. A server will
            confirm shortly.
          </p>
          <p className="mt-3 text-xs text-white/35">
            Have photo ID ready — we verify 21+ for all tobacco service.
          </p>

          <div className="mt-8 rounded-2xl border border-white/[0.08] bg-[#0c0c0e]/70 p-5 text-left">
            {placed.items.map((it, i) => (
              <div key={i} className="flex justify-between py-1.5 text-sm text-white/70">
                <span>
                  <span className="text-white/40">{it.quantity}×</span> {it.title}
                </span>
                <span>{it.price > 0 ? `$${(it.price * it.quantity).toFixed(2)}` : "—"}</span>
              </div>
            ))}
            <div className="mt-3 border-t border-white/[0.08] pt-3 text-sm">
              <div className="flex justify-between font-[family-name:var(--font-display)] text-lg text-[#d4af37]">
                <span>Total</span>
                <span>${placed.total.toFixed(2)}</span>
              </div>
              <p className="mt-1 text-[11px] text-white/35">
                Tax is added on your final bill at the table.
              </p>
            </div>
          </div>

          <div className="mt-8 flex flex-col items-center gap-3">
            <button
              type="button"
              onClick={() => {
                setCart([]);
                setPlaced(null);
                setNotes("");
                setStep("menu");
              }}
              className="rounded-full border border-[#d4af37]/40 px-6 py-3 font-[family-name:var(--font-accent)] text-xs tracking-[0.18em] text-[#f5e6c8] uppercase transition-colors hover:bg-[#d4af37]/10"
            >
              Order more
            </button>
            <button
              type="button"
              onClick={() => {
                clear();
                deleteCookie(SEAT_KEY);
                deleteCookie(CART_KEY);
                setCart([]);
                setPlaced(null);
                setTable(null);
                setStep("table");
              }}
              className="text-xs text-white/35 transition-colors hover:text-white/60"
            >
              Leaving? Start a new table
            </button>
          </div>

          {/* Everything they have not tried yet, one rail per part of the menu.
              Only items absent from this tab appear, so nothing already
              ordered is offered back to them. */}
          {browseRails.length > 0 && (
            <div className="mt-12 text-left">
              <p className="text-center font-[family-name:var(--font-accent)] text-[10px] tracking-[0.22em] text-[#d4af37] uppercase">
                Still curious?
              </p>
              <h2 className="mt-2 text-center font-[family-name:var(--font-display)] text-2xl text-white">
                You have not tried these
              </h2>

              <div className="mt-7 space-y-7">
                {browseRails.map((rail) => (
                  <section key={rail.id}>
                    <div className="flex items-baseline justify-between">
                      <h3 className="font-[family-name:var(--font-accent)] text-[11px] tracking-[0.18em] text-white/65 uppercase">
                        {rail.label}
                      </h3>
                      <span className="text-[11px] text-white/25">{rail.items.length}</span>
                    </div>

                    <div className="hide-scrollbar mt-3 flex snap-x snap-mandatory gap-3 overflow-x-auto pb-1">
                      {rail.items.map((m) => (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => {
                            addItem(m);
                            setPlaced(null);
                            setStep("menu");
                            setCartOpen(true);
                          }}
                          className="group w-[40vw] max-w-[150px] shrink-0 snap-start overflow-hidden rounded-2xl border border-white/[0.07] bg-[#0c0c0e]/70 text-left transition-colors hover:border-[#d4af37]/40"
                        >
                          <div className="relative aspect-square w-full overflow-hidden">
                            <Image
                              src={resolveImageUrl(m.image)}
                              alt={m.name}
                              fill
                              quality={75}
                              sizes="150px"
                              className="object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                            <span className="absolute right-2 bottom-2 flex size-7 items-center justify-center rounded-full border border-[#d4af37] bg-[#050505]/90 text-[#d4af37]">
                              <Plus className="size-3.5" />
                            </span>
                          </div>
                          <div className="p-2.5">
                            <p className="line-clamp-2 min-h-[2.3em] text-[12px] leading-tight text-white">
                              {m.name}
                            </p>
                            <p className="mt-1 text-xs font-semibold text-[#d4af37]">
                              {m.price > 0 ? `$${m.price.toFixed(2)}` : "Included"}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="cinematic-backdrop relative min-h-screen pt-24 pb-32 pb-mobile-cta">
      <div className="relative mx-auto max-w-7xl px-5 sm:px-8 md:px-12 lg:px-20">
        <SectionHeading
          eyebrow={step === "table" ? "Step 1 of 2" : "Step 2 of 2"}
          title={step === "table" ? "Where Are You Sitting?" : "Build Your Order"}
          subtitle={
            step === "table"
              ? "Pick your table so we know where to bring it."
              : `Table ${table?.code}. Add what you want, then review.`
          }
        />

        {error && (
          <p role="alert" className="mx-auto mt-6 max-w-lg rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-center text-sm text-rose-300">
            {error}
          </p>
        )}

        {/* ── Table picker ── */}
        {step === "table" && (
          <div className="mt-10 grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-7">
            {tables.map((t) => {
              const taken = t.status === "occupied" || t.status === "reserved";
              return (
                <button
                  key={t.id}
                  type="button"
                  disabled={taken}
                  title={taken ? "In use — ask a server" : undefined}
                  onClick={() => {
                    if (taken) return;
                    setTable(t);
                    setStep("menu");
                    // Persist immediately. Reloading or pressing Back used to
                    // drop the guest back to the table picker with a cart they
                    // could no longer see.
                    setCookie(SEAT_KEY, t.id, { maxAgeSeconds: CART_TTL_SECONDS });
                  }}
                  className={cn(
                    "group rounded-xl border p-3 text-center transition-all",
                    taken
                      ? "cursor-not-allowed border-white/[0.06] bg-white/[0.02] opacity-50"
                      : "border-[#d4af37]/25 bg-[#d4af37]/[0.04] hover:border-[#d4af37] hover:bg-[#d4af37]/10"
                  )}
                >
                  <span className="block font-[family-name:var(--font-display)] text-lg text-white">
                    {t.code}
                  </span>
                  <span className="mt-0.5 block text-[10px] tracking-[0.14em] text-white/40 uppercase">
                    {t.seats} seats
                  </span>
                  {taken && (
                    <span className="mt-1 flex items-center justify-center gap-1 text-[9px] tracking-[0.12em] text-amber-400/80 uppercase">
                      <Lock className="size-2.5" /> In use
                    </span>
                  )}
                </button>
              );
            })}
            {tables.length === 0 && (
              <p className="col-span-full py-10 text-center text-sm text-white/35">
                Loading the floor…
              </p>
            )}
          </div>
        )}

        {/* ── Menu ── */}
        {step === "menu" && (
          <>
            {tab && nudgeDue && !nudgeDismissed && cart.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-8 rounded-2xl border border-[#d4af37]/30 bg-gradient-to-r from-[#d4af37]/[0.10] to-transparent p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full bg-[#d4af37]/15">
                      <Clock className="size-4 text-[#d4af37]" />
                    </span>
                    <div>
                      <p className="font-[family-name:var(--font-display)] text-base text-white">
                        Still going at {tab.tableCode}?
                      </p>
                      <p className="mt-1 text-xs leading-relaxed text-white/55">
                        Your bowl has been on about half an hour. A refill or a
                        fresh round keeps it smooth.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setNudgeDismissed(true)}
                    aria-label="Dismiss"
                    className="shrink-0 text-white/30 transition-colors hover:text-white/60"
                  >
                    <X className="size-4" />
                  </button>
                </div>

                {suggestions.length > 0 && (
                  <div className="hide-scrollbar mt-3 flex gap-2 overflow-x-auto pb-1">
                    {suggestions.slice(0, 3).map((sg) => (
                      <button
                        key={sg.id}
                        type="button"
                        onClick={() => addItem(sg)}
                        className="shrink-0 rounded-full border border-[#d4af37]/40 bg-[#050505]/60 px-3.5 py-2 text-xs text-[#f5e6c8] transition-colors hover:bg-[#d4af37]/10"
                      >
                        + {sg.name}
                        {sg.price > 0 ? ` · $${sg.price.toFixed(2)}` : ""}
                      </button>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* Stage stepper */}
            <div className="mt-8">
              <div className="hide-scrollbar flex items-center justify-start gap-2 overflow-x-auto sm:justify-center">
                {STAGES.map((st, i) => {
                  const done = i < stageIndex;
                  const active = i === stageIndex;
                  return (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => {
                        setStageIndex(i);
                        setSub("all");
                      }}
                      className={cn(
                        "flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-2 font-[family-name:var(--font-accent)] text-[10px] tracking-[0.14em] uppercase transition-all",
                        active
                          ? "border-[#d4af37] bg-[#d4af37]/15 text-[#d4af37]"
                          : done
                            ? "border-[#d4af37]/25 text-[#d4af37]/60"
                            : "border-white/10 text-white/40 hover:text-white/70"
                      )}
                    >
                      {done ? (
                        <Check className="size-3" />
                      ) : (
                        <span className="text-[9px] opacity-60">{i + 1}</span>
                      )}
                      {st.label}
                    </button>
                  );
                })}
              </div>
              <p className="mt-3 text-center text-xs text-white/40">{stage.blurb}</p>

              {combos.length > 0 && !combosOpen && (
                <button
                  type="button"
                  onClick={() => setCombosOpen(true)}
                  className="mx-auto mt-3 flex items-center gap-2 rounded-full border border-[#d4af37]/35 bg-[#d4af37]/[0.06] px-4 py-2 text-[11px] text-[#f5e6c8] transition-colors hover:bg-[#d4af37]/12"
                >
                  <Sparkles className="size-3.5 text-[#d4af37]" />
                  Packages for {table?.seats} — one tap
                </button>
              )}
            </div>

            <div className="hide-scrollbar mt-4 flex justify-start gap-2 overflow-x-auto sm:justify-center">
              {subcategories.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSub(s)}
                  className={cn(
                    "shrink-0 rounded-full px-3.5 py-1.5 text-[11px] capitalize transition-colors",
                    sub === s ? "bg-[#d4af37]/15 text-[#d4af37]" : "text-white/45 hover:text-white/75"
                  )}
                >
                  {s.replace(/-/g, " ")}
                </button>
              ))}
            </div>

            {suggestions.length > 0 && (
              <div className="mt-8 rounded-2xl border border-[#d4af37]/20 bg-[#d4af37]/[0.04] p-4">
                <p className="flex items-center gap-2 font-[family-name:var(--font-accent)] text-[10px] tracking-[0.2em] text-[#d4af37] uppercase">
                  <Sparkles className="size-3.5" /> Goes well with your order
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {suggestions.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => addItem(s)}
                      className="rounded-full border border-white/10 bg-[#050505]/60 px-3.5 py-2 text-xs text-white/75 transition-colors hover:border-[#d4af37]/45 hover:text-white"
                    >
                      + {s.name}{s.price > 0 ? ` · $${s.price.toFixed(2)}` : ""}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-5 grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3 lg:grid-cols-4 xl:grid-cols-5">
              {visible.map((m) => {
                const line = cart.find((l) => l.item.id === m.id);
                return (
                  <div
                    key={m.id}
                    className="group relative overflow-hidden rounded-2xl border border-white/[0.07] bg-[#0c0c0e]/70 transition-colors hover:border-[#d4af37]/35"
                  >
                    <div className="relative aspect-square w-full overflow-hidden">
                      <Image
                        src={resolveImageUrl(m.image)}
                        alt={m.name}
                        fill
                        quality={75}
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#0c0c0e] to-transparent" />

                      {/* Stepper sits on the image so the tap target is always
                          in the same place and never pushed off screen. */}
                      <div className="absolute right-2 bottom-2">
                        {line ? (
                          <div className="flex items-center gap-0.5 rounded-full border border-[#d4af37] bg-[#050505]/95 p-0.5 shadow-[0_4px_16px_rgba(0,0,0,0.6)]">
                            <button
                              type="button"
                              aria-label={`Remove one ${m.name}`}
                              onClick={() => changeQty(m.id, -1)}
                              className="flex size-7 items-center justify-center rounded-full text-[#d4af37] active:scale-90"
                            >
                              <Minus className="size-3.5" />
                            </button>
                            <span className="min-w-5 text-center text-sm font-semibold text-[#d4af37]">
                              {line.quantity}
                            </span>
                            <button
                              type="button"
                              aria-label={`Add one ${m.name}`}
                              onClick={() => addItem(m)}
                              className="flex size-7 items-center justify-center rounded-full text-[#d4af37] active:scale-90"
                            >
                              <Plus className="size-3.5" />
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            aria-label={`Add ${m.name}`}
                            onClick={() => addItem(m)}
                            className="flex items-center gap-1 rounded-full border border-[#d4af37] bg-[#050505]/95 px-3.5 py-1.5 text-xs font-semibold tracking-wide text-[#d4af37] shadow-[0_4px_16px_rgba(0,0,0,0.6)] active:scale-95"
                          >
                            <Plus className="size-3.5" /> ADD
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="p-2.5 pt-2">
                      <p className="line-clamp-2 min-h-[2.4em] font-[family-name:var(--font-body)] text-[13px] leading-tight text-white">
                        {m.name}
                      </p>
                      <p className="mt-1 text-sm font-semibold text-[#d4af37]">
                        {m.price > 0 ? `$${m.price.toFixed(2)}` : (
                          <span className="text-[10px] tracking-[0.14em] text-white/40 uppercase">
                            Included with hookah
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-8 flex items-center justify-between gap-3">
              <button
                type="button"
                disabled={stageIndex === 0}
                onClick={() => {
                  setStageIndex((i) => Math.max(0, i - 1));
                  setSub("all");
                }}
                className="rounded-full border border-white/10 px-5 py-2.5 text-xs text-white/50 transition-colors enabled:hover:text-white/80 disabled:opacity-30"
              >
                Back
              </button>
              {stageIndex < STAGES.length - 1 ? (
                <button
                  type="button"
                  onClick={() => {
                    setStageIndex((i) => Math.min(STAGES.length - 1, i + 1));
                    setSub("all");
                  }}
                  className="rounded-full border border-[#d4af37]/45 px-6 py-2.5 font-[family-name:var(--font-accent)] text-[11px] tracking-[0.16em] text-[#f5e6c8] uppercase transition-colors hover:bg-[#d4af37]/10"
                >
                  {cart.length === 0 ? "Skip" : "Next"} · {STAGES[stageIndex + 1].label}
                </button>
              ) : (
                <span className="text-xs text-white/35">That is everything</span>
              )}
            </div>
          </>
        )}
      </div>

      {/* Last call */}
      <AnimatePresence>
        {lastCall && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[8400] bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ type: "spring", damping: 26, stiffness: 280 }}
              className="fixed inset-x-4 top-1/2 z-[8500] mx-auto max-w-md -translate-y-1/2 rounded-3xl border border-[#d4af37]/35 bg-[#0a0a0c] p-6 shadow-[0_40px_100px_rgba(0,0,0,0.7)]"
            >
              <div className="mx-auto flex size-12 items-center justify-center rounded-full border border-[#d4af37]/40 bg-[#d4af37]/10">
                <Sparkles className="size-5 text-[#d4af37]" />
              </div>

              <p className="mt-4 text-center font-[family-name:var(--font-display)] text-xl leading-snug text-white">
                {lastCall.headline}
              </p>

              <div className="mt-5 space-y-2">
                {lastCall.items.map((it) => {
                  const added = cart.some((l) => l.item.id === it.id);
                  return (
                    <button
                      key={it.id}
                      type="button"
                      onClick={() => addItem(it)}
                      disabled={added}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-2xl border p-2.5 text-left transition-colors",
                        added
                          ? "border-[#d4af37]/50 bg-[#d4af37]/10"
                          : "border-white/[0.08] bg-white/[0.02] hover:border-[#d4af37]/40"
                      )}
                    >
                      <div className="relative size-12 shrink-0 overflow-hidden rounded-xl">
                        <Image
                          src={resolveImageUrl(it.image)}
                          alt=""
                          fill
                          quality={75}
                          sizes="48px"
                          className="object-cover"
                        />
                      </div>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm text-white">{it.name}</span>
                        <span className="block text-xs text-white/45">
                          {it.price > 0 ? `$${it.price.toFixed(2)}` : "Included"}
                        </span>
                      </span>
                      <span
                        className={cn(
                          "shrink-0 rounded-full px-3 py-1.5 text-[11px] font-semibold",
                          added
                            ? "bg-[#d4af37] text-[#050505]"
                            : "border border-[#d4af37]/50 text-[#d4af37]"
                        )}
                      >
                        {added ? "Added" : "+ Add"}
                      </span>
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={() => {
                  setLastCall(null);
                  void placeOrder(true);
                }}
                disabled={submitting}
                className="mt-5 w-full rounded-xl bg-gradient-to-r from-[#8b6914] via-[#d4af37] to-[#8b6914] py-3.5 font-[family-name:var(--font-accent)] text-xs font-medium tracking-[0.16em] text-[#050505] uppercase disabled:opacity-60"
              >
                {submitting ? "Sending…" : `Send it · $${totals.total.toFixed(2)}`}
              </button>
              <button
                type="button"
                onClick={() => {
                  setLastCall(null);
                  void placeOrder(true);
                }}
                className="mt-2 w-full py-2 text-xs text-white/35 transition-colors hover:text-white/60"
              >
                No thanks, I am good
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Party packages */}
      <AnimatePresence>
        {combosOpen && combos.length > 0 && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setCombosOpen(false)}
              className="fixed inset-0 z-[8200] bg-black/75 backdrop-blur-sm"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 260 }}
              data-lenis-prevent
              className="hide-scrollbar safe-bottom fixed inset-x-0 bottom-0 z-[8300] max-h-[90dvh] overflow-y-auto overscroll-contain rounded-t-3xl border-t border-[#d4af37]/30 bg-[#0a0a0c]"
            >
              <div className="mx-auto max-w-2xl px-5 pt-3 pb-6">
                <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-white/15" />

                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-[family-name:var(--font-accent)] text-[10px] tracking-[0.22em] text-[#d4af37] uppercase">
                      Table {table?.code} · {table?.seats} seats
                    </p>
                    <h2 className="mt-1.5 font-[family-name:var(--font-display)] text-2xl leading-tight text-white">
                      Sorted for {table?.seats}, in one tap
                    </h2>
                    <p className="mt-1.5 text-xs text-white/45">
                      Built for your table size. Change anything after.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCombosOpen(false)}
                    aria-label="Close"
                    className="mt-1 flex size-9 shrink-0 items-center justify-center rounded-full border border-white/10 text-white/50"
                  >
                    <X className="size-4" />
                  </button>
                </div>

                <div className="mt-5 space-y-3">
                  {combos.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => addCombo(c)}
                      className="group w-full rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4 text-left transition-colors hover:border-[#d4af37]/45 hover:bg-[#d4af37]/[0.04]"
                    >
                      <div className="flex items-baseline justify-between gap-3">
                        <span className="font-[family-name:var(--font-display)] text-lg text-white">
                          {c.kind}
                        </span>
                        <span className="shrink-0 font-[family-name:var(--font-display)] text-lg text-[#d4af37]">
                          ${c.total.toFixed(2)}
                        </span>
                      </div>

                      <p className="mt-1 text-xs leading-relaxed text-white/50">{c.note}</p>

                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {c.items.map((i) => (
                          <span
                            key={i.id}
                            className="rounded-full border border-white/[0.08] px-2.5 py-1 text-[11px] text-white/60"
                          >
                            {i.quantity}× {i.name}
                          </span>
                        ))}
                      </div>

                      <span className="mt-3 flex items-center gap-1.5 text-[11px] font-semibold tracking-[0.12em] text-[#d4af37] uppercase">
                        <Plus className="size-3" /> Add this
                      </span>
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => setCombosOpen(false)}
                  className="mt-5 w-full rounded-xl border border-white/10 py-3 text-[11px] tracking-[0.14em] text-white/45 uppercase transition-colors hover:text-white/75"
                >
                  I will build my own
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Slim cart bar. The details form used to sit open at all times and
          covered half the menu, so it moved into the sheet below. */}
      {step === "menu" && cart.length > 0 && !cartOpen && (
        <div className="safe-bottom fixed inset-x-0 bottom-0 z-[8100] border-t border-[#d4af37]/25 bg-[#050505]/95 backdrop-blur-xl">
          <button
            type="button"
            onClick={() => setCartOpen(true)}
            className="mx-auto flex w-full max-w-3xl items-center justify-between gap-4 px-4 py-3.5"
          >
            <span className="flex items-center gap-3">
              <span className="relative flex size-10 items-center justify-center rounded-full bg-[#d4af37]/15">
                <ShoppingBag className="size-4 text-[#d4af37]" />
                <span className="absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full bg-[#d4af37] text-[10px] font-bold text-[#050505]">
                  {totals.count}
                </span>
              </span>
              <span className="text-left">
                <span className="block font-[family-name:var(--font-body)] text-sm text-white">
                  {totals.count} item{totals.count === 1 ? "" : "s"}
                </span>
                <span className="block text-xs text-white/45">Table {table?.code}</span>
              </span>
            </span>
            <span className="flex items-center gap-3">
              <span className="font-[family-name:var(--font-display)] text-lg text-[#d4af37]">
                ${totals.total.toFixed(2)}
              </span>
              <span className="rounded-full bg-gradient-to-r from-[#8b6914] via-[#d4af37] to-[#8b6914] px-4 py-2 font-[family-name:var(--font-accent)] text-[11px] font-medium tracking-[0.14em] text-[#050505] uppercase">
                Review
              </span>
            </span>
          </button>
        </div>
      )}

      <AnimatePresence>
        {cartOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setCartOpen(false)}
              className="fixed inset-0 z-[8200] bg-black/70 backdrop-blur-sm"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 260 }}
              data-lenis-prevent
              className="hide-scrollbar safe-bottom fixed inset-x-0 bottom-0 z-[8300] max-h-[88dvh] overflow-y-auto overscroll-contain rounded-t-3xl border-t border-[#d4af37]/25 bg-[#0a0a0c]"
            >
              <div className="mx-auto max-w-2xl px-5 pt-3 pb-6">
                <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-white/15" />

                <div className="flex items-center justify-between">
                  <h2 className="font-[family-name:var(--font-display)] text-xl text-white">
                    Your order
                  </h2>
                  <button
                    type="button"
                    onClick={() => setCartOpen(false)}
                    aria-label="Close"
                    className="flex size-9 items-center justify-center rounded-full border border-white/10 text-white/50"
                  >
                    <X className="size-4" />
                  </button>
                </div>
                <p className="mt-1 text-xs text-white/40">Table {table?.code}</p>

                <ul className="mt-4 space-y-3">
                  {cart.map((l) => (
                    <li key={l.item.id} className="flex items-center gap-3">
                      <div className="relative size-14 shrink-0 overflow-hidden rounded-xl border border-white/[0.07]">
                        <Image
                          src={resolveImageUrl(l.item.image)}
                          alt=""
                          fill
                          quality={75}
                          sizes="56px"
                          className="object-cover"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm text-white">{l.item.name}</p>
                        <p className="text-xs text-white/45">
                          {l.item.price > 0
                            ? `$${l.item.price.toFixed(2)} each`
                            : "Included with hookah"}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 rounded-full border border-[#d4af37]/40 p-0.5">
                        <IconBtn onClick={() => changeQty(l.item.id, -1)} label="Remove one">
                          <Minus className="size-3" />
                        </IconBtn>
                        <span className="w-5 text-center text-sm text-[#d4af37]">{l.quantity}</span>
                        <IconBtn onClick={() => addItem(l.item)} label="Add one">
                          <Plus className="size-3" />
                        </IconBtn>
                      </div>
                    </li>
                  ))}
                </ul>

                {suggestions.length > 0 && (
                  <div className="mt-5 border-t border-white/[0.06] pt-4">
                    <p className="flex items-center gap-2 font-[family-name:var(--font-accent)] text-[10px] tracking-[0.2em] text-[#d4af37] uppercase">
                      <Sparkles className="size-3.5" /> Add to your order
                    </p>
                    <div className="hide-scrollbar mt-3 flex gap-2 overflow-x-auto pb-1">
                      {suggestions.map((sg) => (
                        <button
                          key={sg.id}
                          type="button"
                          onClick={() => addItem(sg)}
                          className="shrink-0 rounded-full border border-white/12 bg-white/[0.03] px-3.5 py-2 text-xs text-white/75 transition-colors hover:border-[#d4af37]/50 hover:text-white"
                        >
                          + {sg.name}
                          {sg.price > 0 ? ` · $${sg.price.toFixed(2)}` : ""}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-5 space-y-2 border-t border-white/[0.06] pt-4">
                  <div className="grid gap-2 sm:grid-cols-2">
                    <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
                    <Input value={phone} onChange={(e) => setPhone(e.target.value)} type="tel" placeholder="Phone (optional)" />
                  </div>
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={2}
                    placeholder="Extra ice, no mint, anything else…"
                  />
                </div>

                <div className="mt-4 border-t border-white/[0.06] pt-4 text-sm">
                  <div className="flex justify-between font-[family-name:var(--font-display)] text-lg text-[#d4af37]">
                    <span>Total</span>
                    <span>${totals.total.toFixed(2)}</span>
                  </div>
                  <p className="mt-1 text-[11px] text-white/35">
                    Tax is added on your final bill at the table.
                  </p>
                </div>

                {error && (
                  <p role="alert" className="mt-3 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-300">
                    {error}
                  </p>
                )}

                <button
                  type="button"
                  onClick={() => void placeOrder()}
                  disabled={submitting || lastCallBusy || !hasPricedItem}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#8b6914] via-[#d4af37] to-[#8b6914] py-4 font-[family-name:var(--font-accent)] text-xs font-medium tracking-[0.16em] text-[#050505] uppercase disabled:opacity-60"
                >
                  <ShoppingBag className="size-4" />
                  {submitting || lastCallBusy
                    ? "Sending…"
                    : !hasPricedItem
                      ? "Add a hookah or a drink"
                      : `Place order · $${totals.total.toFixed(2)}`}
                </button>

                {!hasPricedItem && (
                  <p className="mt-2 text-center text-[11px] text-white/45">
                    Flavours come with a hookah — pick one from Hookah Types, Fresh
                    Fruit or Special Mixes.
                  </p>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}

function IconBtn({
  children,
  onClick,
  label,
}: {
  children: React.ReactNode;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="flex size-6 items-center justify-center rounded-full border border-white/15 text-white/60 transition-colors hover:border-[#d4af37]/50 hover:text-[#d4af37]"
    >
      {children}
    </button>
  );
}
