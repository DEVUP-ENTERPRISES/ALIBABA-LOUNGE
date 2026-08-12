"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Check, ChefHat, Clock, RefreshCw, Utensils } from "lucide-react";
import { orderApi } from "@/lib/admin/data-api";
import type { Order, OrderStatus } from "@/lib/admin/types";
import { formatUsTime } from "@/lib/format";
import { cn } from "@/lib/utils";

const POLL_MS = 10000;

const COLUMNS: { status: OrderStatus; label: string; hint: string }[] = [
  { status: "placed", label: "New", hint: "Waiting to be claimed" },
  { status: "accepted", label: "Accepted", hint: "Claimed, not started" },
  { status: "preparing", label: "Preparing", hint: "Being made" },
  { status: "served", label: "Served", hint: "At the table" },
];

/** Minutes since an order was placed — the number that matters on the floor. */
function minutesSince(iso: string) {
  return Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
}

function ageTone(mins: number, status: OrderStatus) {
  if (status === "served") return "text-white/40";
  if (mins >= 20) return "text-rose-400";
  if (mins >= 10) return "text-amber-400";
  return "text-white/40";
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  const load = useCallback(async (showSpinner = false) => {
    if (showSpinner) setLoading(true);
    try {
      setOrders(await orderApi.list("?scope=open&limit=200"));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load orders.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load(true);
    const poll = window.setInterval(() => void load(), POLL_MS);
    // Re-render every 30s so the age counters stay honest between polls.
    const clock = window.setInterval(() => setTick((t) => t + 1), 30000);
    return () => {
      window.clearInterval(poll);
      window.clearInterval(clock);
    };
  }, [load]);

  const act = async (id: string, fn: () => Promise<Order>) => {
    setBusyId(id);
    setError(null);
    try {
      const updated = await fn();
      setOrders((prev) =>
        updated.status === "completed" || updated.status === "cancelled"
          ? prev.filter((o) => o.id !== id)
          : prev.map((o) => (o.id === id ? updated : o))
      );
    } catch (err) {
      // Most often: another server claimed it first.
      setError(err instanceof Error ? err.message : "That did not work.");
      void load();
    } finally {
      setBusyId(null);
    }
  };

  const grouped = useMemo(() => {
    const map = new Map<OrderStatus, Order[]>();
    COLUMNS.forEach((c) => map.set(c.status, []));
    orders.forEach((o) => map.get(o.status)?.push(o));
    return map;
  }, [orders]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-2xl text-white">
            Order Floor
          </h1>
          <p className="mt-1 text-sm text-white/45">
            Oldest first. Claim an order to make it yours.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void load(true)}
          className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-xs text-white/60 transition-colors hover:border-[#d4af37]/40 hover:text-[#d4af37]"
        >
          <RefreshCw className={cn("size-3.5", loading && "animate-spin")} />
          Refresh
        </button>
      </div>

      {error && (
        <p role="alert" className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
          {error}
        </p>
      )}

      <div className="grid gap-4 lg:grid-cols-4">
        {COLUMNS.map((col) => {
          const list = grouped.get(col.status) ?? [];
          return (
            <section key={col.status} className="rounded-2xl border border-white/[0.07] bg-[#0c0c0e]/60 p-3">
              <header className="flex items-baseline justify-between px-1 pb-3">
                <h2 className="font-[family-name:var(--font-accent)] text-[11px] font-semibold tracking-[0.18em] text-white/70 uppercase">
                  {col.label}
                </h2>
                <span className="rounded-full bg-white/[0.06] px-2 py-0.5 text-[11px] text-white/50">
                  {list.length}
                </span>
              </header>

              {list.length === 0 ? (
                <p className="px-1 py-6 text-center text-xs text-white/25">{col.hint}</p>
              ) : (
                <ul className="space-y-3">
                  {list.map((o) => {
                    const mins = minutesSince(o.placedAt);
                    const busy = busyId === o.id;
                    return (
                      <li
                        key={`${o.id}-${tick}`}
                        className="rounded-xl border border-white/[0.07] bg-[#050505]/70 p-3"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-[family-name:var(--font-display)] text-lg text-[#d4af37]">
                            {o.tableCode}
                          </span>
                          <span className="text-[11px] text-white/35">#{o.orderNumber}</span>
                        </div>

                        <div className="mt-1 flex items-center gap-2 text-[11px]">
                          <Clock className={cn("size-3", ageTone(mins, o.status))} />
                          <span className={ageTone(mins, o.status)}>{mins} min</span>
                          <span className="text-white/25">·</span>
                          <span className="text-white/35">{formatUsTime(
                            new Date(o.placedAt).toTimeString().slice(0, 5)
                          )}</span>
                        </div>

                        <ul className="mt-2.5 space-y-1">
                          {o.items.map((it, i) => (
                            <li key={i} className="flex justify-between gap-2 text-xs text-white/70">
                              <span className="truncate">
                                <span className="text-white/40">{it.quantity}×</span> {it.title}
                              </span>
                            </li>
                          ))}
                        </ul>

                        <p className="mt-2 text-[11px] text-white/40">
                          ${o.total.toFixed(2)}
                          {o.customerName && <> · {o.customerName}</>}
                          {o.assignedName && <> · {o.assignedName}</>}
                        </p>

                        {o.notes && (
                          <p className="mt-2 rounded-lg bg-[#d4af37]/[0.07] px-2 py-1.5 text-[11px] text-[#f5e6c8]/80">
                            {o.notes}
                          </p>
                        )}

                        <div className="mt-3">
                          {o.status === "placed" && (
                            <ActionButton busy={busy} onClick={() => act(o.id, () => orderApi.accept(o.id))}>
                              <Check className="size-3.5" /> Accept
                            </ActionButton>
                          )}
                          {o.status === "accepted" && (
                            <ActionButton busy={busy} onClick={() => act(o.id, () => orderApi.setStatus(o.id, "preparing"))}>
                              <ChefHat className="size-3.5" /> Start preparing
                            </ActionButton>
                          )}
                          {o.status === "preparing" && (
                            <ActionButton busy={busy} onClick={() => act(o.id, () => orderApi.setStatus(o.id, "served"))}>
                              <Utensils className="size-3.5" /> Mark served
                            </ActionButton>
                          )}
                          {o.status === "served" && (
                            <ActionButton busy={busy} onClick={() => act(o.id, () => orderApi.setStatus(o.id, "completed"))}>
                              <Check className="size-3.5" /> Close &amp; pay
                            </ActionButton>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}

function ActionButton({
  children,
  onClick,
  busy,
}: {
  children: React.ReactNode;
  onClick: () => void;
  busy: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy}
      className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#8b6914] via-[#d4af37] to-[#8b6914] py-2 font-[family-name:var(--font-accent)] text-[11px] font-medium tracking-[0.14em] text-[#050505] uppercase transition-opacity disabled:opacity-50"
    >
      {busy ? "Working…" : children}
    </button>
  );
}
