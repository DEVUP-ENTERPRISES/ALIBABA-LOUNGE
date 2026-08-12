"use client";

import { useCallback, useEffect, useState } from "react";
import { Heart, RefreshCw, TrendingUp } from "lucide-react";
import { API_BASE_URL, parseApiError } from "@/lib/admin/api";
import { formatUsTimestamp } from "@/lib/format";
import { cn } from "@/lib/utils";

interface Bucket {
  orders: number;
  amount: number;
}

interface Billing {
  feePerOrder: number;
  currency: string;
  period: { label: string };
  thisMonth: Bucket;
  lastMonth: Bucket;
  allTime: Bucket;
  daily: { date: string; orders: number; amount: number }[];
  recent: {
    orderNumber: number;
    tableCode: string;
    total: number;
    completedAt: string;
    fee: number;
  }[];
}

const POLL_MS = 30000;

export default function AdminBillingPage() {
  const [data, setData] = useState<Billing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (spinner = false) => {
    if (spinner) setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/billing`, { credentials: "include" });
      if (!res.ok) throw new Error(await parseApiError(res));
      const json = (await res.json()) as Billing;
      setData(json);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load billing.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load(true);
    const id = window.setInterval(() => void load(), POLL_MS);
    return () => window.clearInterval(id);
  }, [load]);

  const peak = Math.max(1, ...(data?.daily ?? []).map((d) => d.orders));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-2xl text-white">
            Support the Build
          </h1>
          <p className="mt-1 text-sm text-white/45">
            ${data?.feePerOrder ?? 1} per completed order — a small thank-you for the
            system that runs your floor. Never added to a guest&apos;s bill.
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

      {/* The running total */}
      <div className="relative overflow-hidden rounded-3xl border border-[#d4af37]/30 bg-gradient-to-br from-[#d4af37]/[0.10] via-transparent to-transparent p-7">
        <div className="pointer-events-none absolute -top-16 -right-16 size-52 rounded-full bg-[#d4af37]/10 blur-3xl" />
        <div className="relative">
          <p className="flex items-center gap-2 font-[family-name:var(--font-accent)] text-[10px] tracking-[0.22em] text-[#d4af37] uppercase">
            <Heart className="size-3.5" /> {data?.period.label ?? "This month"}
          </p>
          <p className="mt-3 font-[family-name:var(--font-display)] text-6xl leading-none text-white">
            ${(data?.thisMonth.amount ?? 0).toFixed(2)}
          </p>
          <p className="mt-2 text-sm text-white/50">
            {data?.thisMonth.orders ?? 0} completed order
            {data?.thisMonth.orders === 1 ? "" : "s"} · ${data?.feePerOrder ?? 1} each
          </p>

          {data && data.lastMonth.orders > 0 && (
            <p className="mt-4 flex items-center gap-1.5 text-xs text-white/40">
              <TrendingUp className="size-3.5 text-[#d4af37]/70" />
              Last month: ${data.lastMonth.amount.toFixed(2)} over {data.lastMonth.orders} orders
            </p>
          )}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Stat label="All time" value={`$${(data?.allTime.amount ?? 0).toFixed(2)}`} sub={`${data?.allTime.orders ?? 0} orders`} />
        <Stat label="Last month" value={`$${(data?.lastMonth.amount ?? 0).toFixed(2)}`} sub={`${data?.lastMonth.orders ?? 0} orders`} />
      </div>

      {/* Daily shape */}
      {data && data.daily.length > 0 && (
        <section className="rounded-2xl border border-white/[0.07] bg-[#0c0c0e]/60 p-5">
          <h2 className="font-[family-name:var(--font-accent)] text-[11px] tracking-[0.18em] text-white/60 uppercase">
            This month, day by day
          </h2>
          <div className="mt-4 flex h-28 items-end gap-1">
            {data.daily.map((d) => (
              <div key={d.date} className="group relative flex-1" title={`${d.date}: ${d.orders} orders`}>
                <div
                  className="w-full rounded-t bg-gradient-to-t from-[#8b6914] to-[#d4af37]"
                  style={{ height: `${Math.max(6, (d.orders / peak) * 100)}%` }}
                />
              </div>
            ))}
          </div>
          <p className="mt-2 text-[11px] text-white/30">
            Peak {peak} order{peak === 1 ? "" : "s"} in a day
          </p>
        </section>
      )}

      {/* Recent completions */}
      <section className="glass-luxury overflow-x-auto rounded-2xl">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead className="border-b border-white/[0.06] text-[11px] tracking-[0.14em] text-white/40 uppercase">
            <tr>
              <th className="px-4 py-4">Order</th>
              <th className="px-4 py-4">Table</th>
              <th className="px-4 py-4">Completed</th>
              <th className="px-4 py-4 text-right">Order total</th>
              <th className="px-4 py-4 text-right">Fee</th>
            </tr>
          </thead>
          <tbody>
            {(data?.recent ?? []).map((r) => (
              <tr key={r.orderNumber} className="border-b border-white/[0.04]">
                <td className="px-4 py-3 text-white/70">#{r.orderNumber}</td>
                <td className="px-4 py-3 text-[#d4af37]">{r.tableCode}</td>
                <td className="px-4 py-3 text-white/45">{formatUsTimestamp(r.completedAt)}</td>
                <td className="px-4 py-3 text-right text-white/55">${r.total.toFixed(2)}</td>
                <td className="px-4 py-3 text-right text-[#d4af37]">${r.fee.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!loading && (data?.recent.length ?? 0) === 0 && (
          <p className="px-4 py-8 text-center text-sm text-white/35">
            No completed orders yet.
          </p>
        )}
      </section>

      <p className="pb-2 text-center text-xs leading-relaxed text-white/30">
        Settled monthly. This figure is counted from completed orders, so it always
        reconciles against the order list — cancelled orders are never billed.
      </p>
    </div>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="rounded-2xl border border-white/[0.07] bg-[#0c0c0e]/60 p-5">
      <p className="font-[family-name:var(--font-accent)] text-[10px] tracking-[0.18em] text-white/40 uppercase">
        {label}
      </p>
      <p className="mt-2 font-[family-name:var(--font-display)] text-3xl text-white">{value}</p>
      <p className="mt-1 text-xs text-white/35">{sub}</p>
    </div>
  );
}
