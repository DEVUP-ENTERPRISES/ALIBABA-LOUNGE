"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { Check, Minus, Plus, ShoppingBag, Sparkles, X } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { menuApi, orderApi, tableApi } from "@/lib/admin/data-api";
import type { FloorTable, Order } from "@/lib/admin/types";
import type { MenuItem } from "@/lib/menu/types";
import { resolveImageUrl } from "@/lib/image-url";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

type CartLine = { item: MenuItem; quantity: number };
type Step = "table" | "menu" | "review" | "done";

const CATEGORY_TABS = [
  { id: "hookah", label: "Hookah" },
  { id: "drinks", label: "Drinks" },
] as const;

export function OrderPageContent() {
  const { user } = useAuth();

  const [step, setStep] = useState<Step>("table");
  const [tables, setTables] = useState<FloorTable[]>([]);
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [table, setTable] = useState<FloorTable | null>(null);
  const [category, setCategory] = useState<string>("hookah");
  const [sub, setSub] = useState<string>("all");
  const [cart, setCart] = useState<CartLine[]>([]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [placed, setPlaced] = useState<Order | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Suggestions come from the server; it decides whether to use the model.
  const [suggestions, setSuggestions] = useState<MenuItem[]>([]);

  useEffect(() => {
    tableApi.list().then(setTables).catch(() => {});
    menuApi.list("?limit=500&isAvailable=true").then(setMenu).catch(() => {});
  }, []);

  useEffect(() => {
    if (user?.displayName && !name) setName(user.displayName);
  }, [user, name]);

  const subcategories = useMemo(() => {
    const set = new Set(
      menu.filter((m) => m.category === category).map((m) => m.subcategory || "")
    );
    return ["all", ...[...set].filter(Boolean).sort()];
  }, [menu, category]);

  const visible = useMemo(
    () =>
      menu.filter(
        (m) => m.category === category && (sub === "all" || m.subcategory === sub)
      ),
    [menu, category, sub]
  );

  const totals = useMemo(() => {
    const subtotal = cart.reduce((s, l) => s + l.item.price * l.quantity, 0);
    const tax = subtotal * 0.0825;
    return {
      subtotal,
      tax,
      total: subtotal + tax,
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
    if (cart.length === 0) {
      setSuggestions([]);
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
        body: JSON.stringify({ itemIds: cart.map((l) => l.item.id) }),
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
  }, [cart]);

  const placeOrder = async () => {
    if (!table || cart.length === 0) return;
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

          <div className="mt-8 rounded-2xl border border-white/[0.08] bg-[#0c0c0e]/70 p-5 text-left">
            {placed.items.map((it, i) => (
              <div key={i} className="flex justify-between py-1.5 text-sm text-white/70">
                <span>
                  <span className="text-white/40">{it.quantity}×</span> {it.title}
                </span>
                <span>${(it.price * it.quantity).toFixed(2)}</span>
              </div>
            ))}
            <div className="mt-3 border-t border-white/[0.08] pt-3 text-sm">
              <Row label="Subtotal" value={placed.subtotal} />
              <Row label="Tax" value={placed.tax} />
              <div className="mt-1 flex justify-between font-[family-name:var(--font-display)] text-lg text-[#d4af37]">
                <span>Total</span>
                <span>${placed.total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setCart([]);
              setPlaced(null);
              setNotes("");
              setStep("menu");
            }}
            className="mt-8 rounded-full border border-[#d4af37]/40 px-6 py-3 font-[family-name:var(--font-accent)] text-xs tracking-[0.18em] text-[#f5e6c8] uppercase transition-colors hover:bg-[#d4af37]/10"
          >
            Order more
          </button>
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
                  onClick={() => {
                    setTable(t);
                    setStep("menu");
                  }}
                  className={cn(
                    "group rounded-xl border p-3 text-center transition-all",
                    taken
                      ? "border-white/[0.06] bg-white/[0.02] opacity-60"
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
                    <span className="mt-1 block text-[9px] tracking-[0.12em] text-amber-400/80 uppercase">
                      In use
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
            <div className="mt-8 flex justify-center gap-2">
              {CATEGORY_TABS.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => {
                    setCategory(c.id);
                    setSub("all");
                  }}
                  className={cn(
                    "rounded-full border px-5 py-2 font-[family-name:var(--font-accent)] text-[10px] tracking-[0.18em] uppercase transition-all",
                    category === c.id
                      ? "border-[#d4af37] bg-[#d4af37]/15 text-[#d4af37]"
                      : "border-white/10 text-white/50 hover:text-white/80"
                  )}
                >
                  {c.label}
                </button>
              ))}
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
                      + {s.name} · ${s.price.toFixed(2)}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
              {visible.map((m) => {
                const inCart = cart.find((l) => l.item.id === m.id);
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => addItem(m)}
                    className="group overflow-hidden rounded-2xl border border-white/[0.07] bg-[#0c0c0e]/70 text-left transition-colors hover:border-[#d4af37]/40"
                  >
                    <div className="relative aspect-[3/4] w-full overflow-hidden">
                      <Image
                        src={resolveImageUrl(m.image)}
                        alt={m.name}
                        fill
                        quality={75}
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <span className="absolute top-2 right-2 rounded-full border border-[#d4af37]/40 bg-[#050505]/85 px-2.5 py-1 text-xs text-[#d4af37]">
                        ${m.price.toFixed(2)}
                      </span>
                      {inCart && (
                        <span className="absolute top-2 left-2 flex size-6 items-center justify-center rounded-full bg-[#d4af37] text-[11px] font-semibold text-[#050505]">
                          {inCart.quantity}
                        </span>
                      )}
                    </div>
                    <div className="p-3">
                      <p className="font-[family-name:var(--font-display)] text-sm leading-tight text-white">
                        {m.name}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* ── Cart bar ── */}
      {step === "menu" && cart.length > 0 && (
        <div className="safe-bottom fixed inset-x-0 bottom-0 z-[8100] border-t border-[#d4af37]/20 bg-[#050505]/95 backdrop-blur-xl">
          <div className="mx-auto max-w-3xl px-4 py-3">
            <ul className="hide-scrollbar mb-2 max-h-32 space-y-1.5 overflow-y-auto">
              {cart.map((l) => (
                <li key={l.item.id} className="flex items-center justify-between gap-3 text-sm">
                  <span className="truncate text-white/75">{l.item.name}</span>
                  <span className="flex shrink-0 items-center gap-2">
                    <IconBtn onClick={() => changeQty(l.item.id, -1)} label="Remove one">
                      <Minus className="size-3" />
                    </IconBtn>
                    <span className="w-5 text-center text-white">{l.quantity}</span>
                    <IconBtn onClick={() => changeQty(l.item.id, 1)} label="Add one">
                      <Plus className="size-3" />
                    </IconBtn>
                    <span className="w-16 text-right text-white/60">
                      ${(l.item.price * l.quantity).toFixed(2)}
                    </span>
                  </span>
                </li>
              ))}
            </ul>

            <div className="mb-2 space-y-2">
              <div className="grid gap-2 sm:grid-cols-2">
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} type="tel" placeholder="Phone (optional)" />
              </div>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                placeholder="Anything we should know? Extra ice, no mint…"
              />
            </div>

            <button
              type="button"
              onClick={placeOrder}
              disabled={submitting}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#8b6914] via-[#d4af37] to-[#8b6914] py-3.5 font-[family-name:var(--font-accent)] text-xs font-medium tracking-[0.16em] text-[#050505] uppercase disabled:opacity-60"
            >
              <ShoppingBag className="size-4" />
              {submitting
                ? "Sending…"
                : `Place order · ${totals.count} item${totals.count === 1 ? "" : "s"} · $${totals.total.toFixed(2)}`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex justify-between text-white/50">
      <span>{label}</span>
      <span>${value.toFixed(2)}</span>
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
