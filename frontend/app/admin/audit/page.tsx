"use client";

import { useCallback, useEffect, useState } from "react";
import { Clock3, RefreshCw, ShieldAlert, User, X } from "lucide-react";
import { orderApi } from "@/lib/admin/data-api";
import type { AuditEntry, AuditSummary } from "@/lib/admin/types";
import { cn } from "@/lib/utils";

const FILTERS: { action: AuditEntry["action"] | "all"; label: string }[] = [
  { action: "all", label: "Everything" },
  { action: "order.cancelled", label: "Cancelled" },
  { action: "order.auto-cancelled", label: "Auto-closed" },
  { action: "order.completed", label: "Completed" },
];

const ACTION_LABEL: Record<AuditEntry["action"], string> = {
  "order.cancelled": "Cancelled",
  "order.auto-cancelled": "Auto-closed",
  "order.completed": "Completed",
  "reservation.cancelled": "Booking cancelled",
  "reservation.no-show": "No-show",
};

/**
 * The morning-after page.
 *
 * An order that gets cancelled shows only that it is cancelled — not what it
 * was worth, who decided, or why. This is where that question gets answered,
 * for every order that closed without becoming a paid tab: someone's
 * decision, or ours, at 500 minutes, with the amount attached either way.
 */
export default function AdminAuditPage() {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [summary, setSummary] = useState<Record<string, AuditSummary>>({});
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["action"]>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (action: string) => {
    setLoading(true);
    try {
      const q = action === "all" ? "?limit=150" : `?limit=150&action=${action}`;
      const res = await orderApi.audit(q);
      setEntries(res.entries);
      setSummary(res.summary);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load the audit trail.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load(filter);
  }, [filter, load]);

  const cancelledTotal =
    (summary["order.cancelled"]?.amount || 0) + (summary["order.auto-cancelled"]?.amount || 0);
  const cancelledCount =
    (summary["order.cancelled"]?.count || 0) + (summary["order.auto-cancelled"]?.count || 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-2xl text-white">Audit</h1>
          <p className="mt-1 text-sm text-white/45">
            Every order that closed without becoming a paid tab — who decided, and what it was worth.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void load(filter)}
          className="flex items-center gap-1.5 rounded-xl border border-zinc-800 px-3 py-2 text-xs text-white/60 hover:text-white"
        >
          <RefreshCw className={cn("size-3.5", loading && "animate-spin")} />
          Refresh
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Stat
          label="Cancelled, all time"
          value={String(cancelledCount)}
          sub={`$${cancelledTotal.toFixed(2)} lost`}
          accent={cancelledCount > 0}
        />
        <Stat
          label="Auto-closed"
          value={String(summary["order.auto-cancelled"]?.count || 0)}
          sub={`$${(summary["order.auto-cancelled"]?.amount || 0).toFixed(2)} — left open too long`}
        />
        <Stat
          label="By staff"
          value={String(summary["order.cancelled"]?.count || 0)}
          sub={`$${(summary["order.cancelled"]?.amount || 0).toFixed(2)}`}
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.action}
            type="button"
            onClick={() => setFilter(f.action)}
            className={cn(
              "rounded-lg border px-3 py-1.5 text-xs transition-colors",
              filter === f.action
                ? "border-[#d4af37]/50 bg-[#d4af37]/10 text-[#d4af37]"
                : "border-zinc-800 text-white/50 hover:text-white"
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {error && (
        <p role="alert" className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
          {error}
        </p>
      )}

      <div className="glass-luxury overflow-x-auto rounded-2xl">
        <table className="w-full min-w-[860px] text-left text-sm">
          <thead>
            <tr className="border-b border-white/[0.06] text-[10px] tracking-[0.2em] text-white/40 uppercase">
              <th className="px-4 py-4">When</th>
              <th className="px-4 py-4">Order</th>
              <th className="px-4 py-4">Table</th>
              <th className="px-4 py-4">Action</th>
              <th className="px-4 py-4">Amount</th>
              <th className="px-4 py-4">By</th>
              <th className="px-4 py-4">Reason</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((e) => (
              <tr key={e.id} className="border-b border-white/[0.04] hover:bg-white/[0.02]">
                <td className="px-4 py-3 text-white/50">
                  <span className="flex items-center gap-1.5">
                    <Clock3 className="size-3 text-white/25" />
                    {new Date(e.at).toLocaleString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </span>
                </td>
                <td className="px-4 py-3 text-white/70">
                  {e.orderNumber ? `#${e.orderNumber}` : "—"}
                </td>
                <td className="px-4 py-3 text-white/60">{e.tableCode || "—"}</td>
                <td className="px-4 py-3">
                  <span
                    className={cn(
                      "rounded-full border px-2.5 py-1 text-[11px]",
                      e.action === "order.auto-cancelled"
                        ? "border-amber-500/30 bg-amber-500/[0.07] text-amber-300"
                        : e.action.includes("cancel") || e.action === "reservation.no-show"
                          ? "border-rose-500/30 bg-rose-500/[0.07] text-rose-300"
                          : "border-emerald-500/30 bg-emerald-500/[0.07] text-emerald-300"
                    )}
                  >
                    {ACTION_LABEL[e.action]}
                  </span>
                </td>
                <td className="px-4 py-3 font-medium text-[#d4af37]">
                  {e.amount > 0 ? `$${e.amount.toFixed(2)}` : "—"}
                  {e.itemCount > 0 && (
                    <span className="ml-1 text-[10px] text-white/30">({e.itemCount} items)</span>
                  )}
                </td>
                <td className="px-4 py-3 text-white/50">
                  <span className="flex items-center gap-1.5">
                    {e.actor.kind === "system" ? (
                      <ShieldAlert className="size-3 text-amber-400/70" />
                    ) : (
                      <User className="size-3 text-white/30" />
                    )}
                    {e.actor.name || (e.actor.kind === "system" ? "System" : "Staff")}
                  </span>
                </td>
                <td className="max-w-[280px] px-4 py-3 text-xs text-white/45">{e.reason}</td>
              </tr>
            ))}
            {entries.length === 0 && !loading && (
              <tr>
                <td colSpan={7} className="px-4 py-14 text-center text-sm text-white/35">
                  Nothing here yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
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
        accent ? "border-rose-500/30 bg-rose-500/[0.06]" : "border-zinc-800 bg-zinc-900/50"
      )}
    >
      <p className="text-[10px] tracking-[0.18em] text-white/40 uppercase">{label}</p>
      <p
        className={cn(
          "mt-1 font-[family-name:var(--font-display)] text-2xl",
          accent ? "text-rose-300" : "text-white"
        )}
      >
        {value}
      </p>
      {sub && <p className="mt-0.5 text-[11px] text-white/40">{sub}</p>}
    </div>
  );
}
