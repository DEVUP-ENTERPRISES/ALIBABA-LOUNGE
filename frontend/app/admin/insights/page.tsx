"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CalendarDays, Monitor, RefreshCw, Smartphone, TrendingUp } from "lucide-react";
import { orderApi } from "@/lib/admin/data-api";
import type { TradeAnalytics, TradeDay } from "@/lib/admin/types";
import { cn } from "@/lib/utils";

const RANGES = [
  { days: 7, label: "7 days" },
  { days: 30, label: "30 days" },
  { days: 90, label: "90 days" },
] as const;

/**
 * Trade, counting the whole venue.
 *
 * The number that matters here is the split. Most of the night is rung up at
 * the till, so a page built only from website orders would make a packed
 * Saturday look dead — and would hide the one figure worth watching, which is
 * whether guests are actually using the online ordering.
 */
export default function AdminInsightsPage() {
  const [data, setData] = useState<TradeAnalytics | null>(null);
  const [days, setDays] = useState<number>(30);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (range: number) => {
    setLoading(true);
    try {
      setData(await orderApi.analytics(range));
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load trade.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load(days);
  }, [days, load]);

  const byDay = useMemo(() => {
    const m = new Map<string, TradeDay>();
    for (const r of data?.rows ?? []) m.set(r.day, r);
    return m;
  }, [data]);

  /** The grid runs up to today, so the last cell is always tonight. */
  const cells = useMemo(() => {
    const out: { key: string; date: Date }[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(Date.now() - i * 864e5);
      out.push({
        key: new Intl.DateTimeFormat("en-CA", { timeZone: "America/Chicago" }).format(d),
        date: d,
      });
    }
    return out;
  }, [days]);

  const peak = useMemo(
    () => Math.max(1, ...(data?.rows ?? []).map((r) => r.totalCount)),
    [data]
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-2xl text-white">Trade</h1>
          <p className="mt-1 text-sm text-white/45">
            Website and till together — the whole room, not half of it.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-xl border border-zinc-800 bg-zinc-900/50 p-1">
            {RANGES.map((r) => (
              <button
                key={r.days}
                type="button"
                onClick={() => setDays(r.days)}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-xs transition-colors",
                  days === r.days
                    ? "bg-[#d4af37] text-[#050505]"
                    : "text-white/50 hover:text-white"
                )}
              >
                {r.label}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => void load(days)}
            className="flex items-center gap-1.5 rounded-xl border border-zinc-800 px-3 py-2 text-xs text-white/60 hover:text-white"
          >
            <RefreshCw className={cn("size-3.5", loading && "animate-spin")} />
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <p
          role="alert"
          className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300"
        >
          {error}
        </p>
      )}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat
          label="Tonight"
          value={data ? String(data.today.totalCount) : "—"}
          sub={data ? `$${data.today.totalRevenue.toFixed(2)}` : ""}
          accent
        />
        <Stat
          label={`Orders · ${days} days`}
          value={data ? String(data.totals.totalCount) : "—"}
          sub={data ? `$${data.totals.totalRevenue.toFixed(2)}` : ""}
        />
        <Stat
          label="Busiest night"
          value={data?.busiest ? String(data.busiest.totalCount) : "—"}
          sub={data?.busiest ? prettyDay(data.busiest.day) : ""}
        />
        <Stat
          label="Ordered online"
          value={
            data && data.totals.totalCount > 0
              ? `${Math.round((data.totals.webCount / data.totals.totalCount) * 100)}%`
              : "—"
          }
          sub={data ? `${data.totals.webCount} of ${data.totals.totalCount}` : ""}
        />
      </div>

      <section className="rounded-2xl border border-white/[0.07] bg-[#0c0c0e]/60 p-4">
        <div className="mb-3 flex items-center gap-2">
          <CalendarDays className="size-4 text-[#d4af37]" />
          <h2 className="text-[11px] font-medium tracking-[0.16em] text-white/70 uppercase">
            Every night
          </h2>
          <span className="ml-auto flex items-center gap-3 text-[10px] text-white/35">
            <span className="flex items-center gap-1">
              <Smartphone className="size-3" /> website
            </span>
            <span className="flex items-center gap-1">
              <Monitor className="size-3" /> till
            </span>
          </span>
        </div>

        <div className="grid grid-cols-7 gap-1.5">
          {cells.map(({ key, date }) => {
            const row = byDay.get(key);
            const count = row?.totalCount ?? 0;
            // Depth by volume, so a busy night reads at a glance.
            const depth = count === 0 ? 0 : Math.min(1, count / peak);
            const isToday = key === data?.today.day;
            return (
              <div
                key={key}
                title={
                  row
                    ? `${prettyDay(key)} — ${row.totalCount} orders, $${row.totalRevenue.toFixed(
                        2
                      )} (${row.webCount} online, ${row.terminalCount} till)`
                    : `${prettyDay(key)} — no trade`
                }
                className={cn(
                  "relative rounded-lg border p-2 transition-colors",
                  count > 0 ? "border-[#d4af37]/25" : "border-white/[0.05]",
                  isToday && "ring-1 ring-[#d4af37]/60"
                )}
                style={
                  count > 0
                    ? { backgroundColor: `rgba(212,175,55,${0.06 + depth * 0.3})` }
                    : undefined
                }
              >
                <p className="text-[9px] text-white/35">{date.getDate()}</p>
                <p
                  className={cn(
                    "mt-0.5 font-[family-name:var(--font-display)] text-sm",
                    count > 0 ? "text-white" : "text-white/20"
                  )}
                >
                  {count || "·"}
                </p>
                {row && row.webCount > 0 && (
                  <span className="absolute top-1 right-1 size-1.5 rounded-full bg-emerald-400/80" />
                )}
              </div>
            );
          })}
        </div>

        <p className="mt-3 text-[10px] text-white/30">
          A night runs to 6am, so a tab opened at 1am counts as the evening
          before. The green dot marks a night with at least one online order.
        </p>
      </section>

      <section className="rounded-2xl border border-white/[0.07] bg-[#0c0c0e]/60 p-4">
        <div className="mb-3 flex items-center gap-2">
          <TrendingUp className="size-4 text-[#d4af37]" />
          <h2 className="text-[11px] font-medium tracking-[0.16em] text-white/70 uppercase">
            Night by night
          </h2>
        </div>

        {(data?.rows.length ?? 0) === 0 ? (
          <p className="text-xs text-white/35">No trade in this range.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead>
                <tr className="border-b border-white/[0.06] text-[10px] tracking-[0.18em] text-white/40 uppercase">
                  <th className="py-2">Night</th>
                  <th className="py-2 text-right">Online</th>
                  <th className="py-2 text-right">Till</th>
                  <th className="py-2 text-right">Orders</th>
                  <th className="py-2 text-right">Takings</th>
                </tr>
              </thead>
              <tbody>
                {[...(data?.rows ?? [])].reverse().map((r) => (
                  <tr key={r.day} className="border-b border-white/[0.04]">
                    <td className="py-2 text-white/70">{prettyDay(r.day)}</td>
                    <td className="py-2 text-right text-white/50">{r.webCount || "—"}</td>
                    <td className="py-2 text-right text-white/50">
                      {r.terminalCount || "—"}
                    </td>
                    <td className="py-2 text-right text-white">{r.totalCount}</td>
                    <td className="py-2 text-right text-[#d4af37]">
                      ${r.totalRevenue.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

/** "2026-09-15" to "Tue 15 Sep", built from parts so it cannot shift a day. */
function prettyDay(key: string) {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

function Stat({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string;
  sub?: string;
  accent?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border p-4",
        accent
          ? "border-[#d4af37]/35 bg-[#d4af37]/[0.06]"
          : "border-zinc-800 bg-zinc-900/50"
      )}
    >
      <p className="text-[10px] tracking-[0.18em] text-white/40 uppercase">{label}</p>
      <p
        className={cn(
          "mt-1 font-[family-name:var(--font-display)] text-2xl",
          accent ? "text-[#d4af37]" : "text-white"
        )}
      >
        {value}
      </p>
      {sub && <p className="mt-0.5 text-[11px] text-white/40">{sub}</p>}
    </div>
  );
}
