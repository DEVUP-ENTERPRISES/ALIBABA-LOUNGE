"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Bell, BellOff, BellRing, Check, ChefHat, Clock, CloudOff, Lock, Monitor, RefreshCw, Trophy, Utensils, X } from "lucide-react";
import { orderApi, callApi } from "@/lib/admin/data-api";
import type {
  CloverSyncState,
  Order,
  OrderStatus,
  TerminalOrder,
  TerminalSyncStatus,
  WaiterCall,
} from "@/lib/admin/types";
import { formatUsTime } from "@/lib/format";
import { useOrderAlerts } from "@/hooks/useOrderAlerts";
import { cn } from "@/lib/utils";

// Every device in the venue shares one public IP against the rate limit,
// so poll conservatively. 15s is still faster than a server crosses the room.
const POLL_MS = 15000;

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
  const [freshCount, setFreshCount] = useState(0);
  const [stats, setStats] = useState<Awaited<ReturnType<typeof orderApi.stats>> | null>(null);
  const [terminal, setTerminal] = useState<TerminalOrder[]>([]);
  const [termSync, setTermSync] = useState<TerminalSyncStatus | null>(null);
  const [staleTabs, setStaleTabs] = useState(0);
  const [calls, setCalls] = useState<WaiterCall[]>([]);
  const [callBusy, setCallBusy] = useState<string | null>(null);
  const alerts = useOrderAlerts();

  const load = useCallback(async (showSpinner = false) => {
    if (showSpinner) setLoading(true);
    try {
      const next = await orderApi.list("?scope=open&limit=200");
      // Tabs from the terminal — a busy night is mostly these, and without
      // them the floor view looks empty while the room is full.
      void orderApi
        .terminal("?scope=open&limit=100")
        .then((t) => {
          setTerminal(t.orders);
          setTermSync(t.sync);
          setStaleTabs(t.staleOpen ?? 0);
        })
        .catch(() => {});
      setOrders(next);
      // Stats are decorative; the queue must render even if they fail or the
      // API has not been redeployed with the endpoint yet.
      try {
        void orderApi.stats?.().then(setStats).catch(() => {});
      } catch {
        /* ignore */
      }
      const n = alerts.check(next.filter((o) => o.status === "placed"));

      // A guest waving for someone matters more than a new order — poll it in
      // the same cycle rather than a second timer drifting out of step.
      void callApi
        .list()
        .then((c) => {
          setCalls(c);
          alerts.checkCalls(c);
        })
        .catch(() => {});
      if (n > 0) setFreshCount(n);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load orders.");
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [alerts.check]);

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
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => (alerts.enabled ? alerts.disable() : void alerts.enable())}
            className={cn(
              "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs transition-colors",
              alerts.enabled
                ? "border-[#d4af37]/50 bg-[#d4af37]/10 text-[#d4af37]"
                : "border-white/10 text-white/55 hover:text-white/80"
            )}
            title={alerts.enabled ? "Alerts on — tap to mute" : "Turn on sound and vibration"}
          >
            {alerts.enabled ? <Bell className="size-3.5" /> : <BellOff className="size-3.5" />}
            {alerts.enabled ? "Alerts on" : "Turn on alerts"}
          </button>
          <button
            type="button"
            onClick={() => void load(true)}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-xs text-white/60 transition-colors hover:border-[#d4af37]/40 hover:text-[#d4af37]"
          >
            <RefreshCw className={cn("size-3.5", loading && "animate-spin")} />
            Refresh
          </button>
        </div>
      </div>

      {stats && (
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-3 rounded-2xl border border-[#d4af37]/25 bg-[#d4af37]/[0.06] px-4 py-3">
            <span className="flex size-9 items-center justify-center rounded-full bg-[#d4af37]/15">
              <Trophy className="size-4 text-[#d4af37]" />
            </span>
            <span>
              <span className="block font-[family-name:var(--font-display)] text-xl leading-none text-white">
                {stats.me.today}
              </span>
              <span className="block text-[10px] tracking-[0.16em] text-white/45 uppercase">
                closed today
              </span>
            </span>
          </div>
          <Chip label="This month" value={stats.me.month} />
          <Chip label="On you now" value={stats.me.openNow} />

          {stats.leaderboard.length > 1 && (
            <div className="hide-scrollbar flex items-center gap-2 overflow-x-auto">
              {stats.leaderboard.map((l, i) => (
                <span
                  key={l.name}
                  className={cn(
                    "shrink-0 rounded-full border px-3 py-1.5 text-[11px]",
                    i === 0
                      ? "border-[#d4af37]/45 text-[#d4af37]"
                      : "border-white/10 text-white/45"
                  )}
                >
                  {i === 0 && "★ "}
                  {l.name} · {l.orders}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* A table waiting for a server outranks everything else on this
          screen — it goes first, above even a fresh order. */}
      {calls.length > 0 && (
        <div className="space-y-2">
          {calls.map((call) => {
            const claimed = call.status === "acknowledged";
            const busy = callBusy === call.id;
            const waitedMin = Math.max(0, Math.round((Date.now() - new Date(call.createdAt).getTime()) / 60000));
            return (
              <div
                key={call.id}
                className={cn(
                  "flex items-center justify-between gap-3 rounded-xl border px-4 py-3",
                  claimed
                    ? "border-sky-400/35 bg-sky-500/[0.07]"
                    : "border-[#d4af37]/50 bg-[#d4af37]/[0.1]"
                )}
              >
                <div className="flex items-center gap-3">
                  <span className="relative flex size-9 shrink-0 items-center justify-center">
                    {!claimed && (
                      <span className="absolute inline-flex size-9 animate-ping rounded-full bg-[#d4af37]/35" />
                    )}
                    <span
                      className={cn(
                        "relative flex size-9 items-center justify-center rounded-full",
                        claimed ? "bg-sky-500/20" : "bg-[#d4af37]/25"
                      )}
                    >
                      <BellRing className={cn("size-4", claimed ? "text-sky-300" : "text-[#d4af37]")} />
                    </span>
                  </span>
                  <div>
                    <p className="text-sm font-medium text-white">
                      Table {call.tableCode} · {call.reasonLabel}
                    </p>
                    <p className="text-[11px] text-white/45">
                      {claimed
                        ? `${call.acknowledgedName || "Claimed"} is on it`
                        : `Waiting ${waitedMin < 1 ? "just now" : `${waitedMin} min`}`}
                    </p>
                  </div>
                </div>
                <div className="flex shrink-0 gap-2">
                  {!claimed && (
                    <button
                      type="button"
                      disabled={busy}
                      onClick={async () => {
                        setCallBusy(call.id);
                        try {
                          const updated = await callApi.acknowledge(call.id);
                          setCalls((prev) => prev.map((c) => (c.id === call.id ? updated : c)));
                        } catch {
                          /* another server may have claimed it first; next poll corrects the list */
                        } finally {
                          setCallBusy(null);
                        }
                      }}
                      className="rounded-lg bg-[#d4af37] px-3 py-1.5 text-[11px] font-medium text-[#050505] disabled:opacity-50"
                    >
                      I've got it
                    </button>
                  )}
                  <button
                    type="button"
                    disabled={busy}
                    onClick={async () => {
                      setCallBusy(call.id);
                      try {
                        await callApi.resolve(call.id);
                        setCalls((prev) => prev.filter((c) => c.id !== call.id));
                      } catch {
                        /* leave it showing; the next poll will reflect reality */
                      } finally {
                        setCallBusy(null);
                      }
                    }}
                    className={cn(
                      "rounded-lg border px-3 py-1.5 text-[11px]",
                      claimed
                        ? "border-sky-400/40 text-sky-200"
                        : "border-[#d4af37]/40 text-[#f5e6c8]"
                    )}
                  >
                    Done
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {freshCount > 0 && (
        <button
          type="button"
          onClick={() => setFreshCount(0)}
          className="flex w-full items-center justify-between rounded-xl border border-[#d4af37]/40 bg-[#d4af37]/10 px-4 py-3 text-sm text-[#f5e6c8]"
        >
          <span>
            {freshCount} new order{freshCount === 1 ? "" : "s"} just came in
          </span>
          <span className="text-xs text-white/45">Dismiss</span>
        </button>
      )}

      {!alerts.enabled && (
        <p className="rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-xs text-white/45">
          Sound and vibration are off. Tap <strong className="text-white/70">Turn on alerts</strong> so
          you do not miss a table — browsers require a tap before they will make noise.
        </p>
      )}

      {error && (
        <p role="alert" className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
          {error}
        </p>
      )}

      {/* Tabs opened on the Clover terminal.
          On a normal night most of the floor is here rather than in the
          columns below — anything a server rang up at the till never touched
          the website. Read-only: the terminal owns these. */}
      {(terminal.length > 0 || termSync?.configured) && (
        <section className="rounded-2xl border border-white/[0.07] bg-[#0c0c0e]/60 p-3">
          <div className="flex items-center justify-between gap-3 px-1 pb-2">
            <div className="flex items-center gap-2">
              <Monitor className="size-3.5 text-[#d4af37]" />
              <h2 className="text-[11px] font-medium tracking-[0.16em] text-white/70 uppercase">
                On the terminal
              </h2>
              <span className="rounded-full bg-white/[0.06] px-2 py-0.5 text-[10px] text-white/50">
                {terminal.length}
              </span>
            </div>
            <TerminalSyncNote sync={termSync} />
          </div>

          {staleTabs > 0 && (
            <p className="mb-2 rounded-lg border border-amber-500/25 bg-amber-500/[0.06] px-2.5 py-1.5 text-[10px] text-amber-200/80">
              {staleTabs} tab{staleTabs === 1 ? "" : "s"} left open on the terminal from
              a previous day — worth closing off at the till.
            </p>
          )}

          {terminal.length === 0 ? (
            <p className="px-1 pb-1 text-[11px] text-white/35">
              No open tabs on the terminal right now.
            </p>
          ) : (
            <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              {terminal.map((t) => (
                <li
                  key={t.id}
                  className="rounded-xl border border-white/[0.07] bg-[#050505]/70 p-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-[family-name:var(--font-display)] text-lg text-[#d4af37]">
                      {t.tableCode || t.title || "—"}
                    </span>
                    <span className="text-[11px] text-white/35">
                      ${t.total.toFixed(2)}
                    </span>
                  </div>

                  <ul className="mt-2 space-y-1">
                    {t.items.map((it, i) => (
                      <li key={i} className="flex justify-between gap-2 text-xs text-white/70">
                        <span className="truncate">
                          <span className="text-white/40">{it.quantity}×</span> {it.name}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <p className="mt-2 flex items-center gap-1.5 text-[10px] text-white/30">
                    <Monitor className="size-3" />
                    Rung up at the till
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>
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
                          <span className="flex items-center gap-1.5 text-[11px] text-white/35">
                            <Lock className="size-3 text-[#d4af37]/70" />
                            #{o.orderNumber}
                          </span>
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

                        {o.clover && (
                          <CloverBadge
                            state={o.clover.state}
                            lastError={o.clover.lastError}
                            paymentState={o.clover.paymentState}
                            busy={busy}
                            onRetry={() =>
                              act(o.id, () => orderApi.retryClover(o.id))
                            }
                          />
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

                          {/* Cancelling is destructive and cannot be undone,
                              so it confirms and stays visually quiet. */}
                          {o.status !== "served" && (
                            <button
                              type="button"
                              disabled={busy}
                              onClick={() => {
                                const reason = window.prompt(
                                  `Cancel order #${o.orderNumber} for table ${o.tableCode} ($${o.total.toFixed(2)})?

Reason (kept in the audit log):`
                                );
                                // Cancelling the prompt must not cancel the order — only an
                                // explicit reason, even a short one, confirms the action.
                                if (reason === null) return;
                                act(o.id, () => orderApi.setStatus(o.id, "cancelled", reason));
                              }}
                              className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-lg border border-white/10 py-1.5 text-[11px] text-white/35 transition-colors hover:border-rose-500/40 hover:text-rose-300 disabled:opacity-40"
                            >
                              <X className="size-3" /> Cancel
                            </button>
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

/**
 * Is the terminal mirror actually alive?
 *
 * Quiet when it is working. It only speaks up when the floor view might be
 * out of date, because a stale mirror looks exactly like a quiet night.
 */
function TerminalSyncNote({ sync }: { sync: TerminalSyncStatus | null }) {
  if (!sync) return null;

  if (!sync.configured) {
    return <span className="text-[10px] text-white/30">Clover not connected</span>;
  }
  if (sync.lastError) {
    return (
      <span className="flex items-center gap-1 text-[10px] text-amber-300" title={sync.lastError}>
        <CloudOff className="size-3" />
        Sync failing
      </span>
    );
  }
  const stale =
    sync.lastRun && Date.now() - new Date(sync.lastRun).getTime() > sync.pollMs * 3;
  if (stale) {
    return (
      <span className="flex items-center gap-1 text-[10px] text-amber-300">
        <CloudOff className="size-3" />
        Last synced {new Date(sync.lastRun!).toLocaleTimeString()}
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1 text-[10px] text-emerald-400/60">
      <RefreshCw className="size-3" />
      Live
    </span>
  );
}

/**
 * Whether this tab actually reached the Clover terminal.
 *
 * Silent when everything is fine and Clover is not in use — a venue running
 * without the POS integration should not see a badge on every order. It only
 * speaks up when there is something a human needs to act on, because the
 * failure this guards against is discovering at close-out that the till and
 * the app disagree.
 */
function CloverBadge({
  state,
  lastError,
  paymentState,
  onRetry,
  busy,
}: {
  state: CloverSyncState;
  lastError?: string;
  paymentState?: string;
  onRetry: () => void;
  busy: boolean;
}) {
  // Not configured on this server — nothing to report.
  if (state === "skipped") return null;

  // The till told us, on a later poll, that this got paid — nothing pushes
  // that to us, so seeing it here means the sync actually caught it.
  const paid = paymentState === "PAID";

  if (state === "synced") {
    return (
      <span
        className={cn(
          "mt-2 flex items-center gap-1.5 text-[10px]",
          paid ? "text-emerald-400" : "text-emerald-400/70"
        )}
      >
        {paid ? <Check className="size-3" /> : <Monitor className="size-3" />}
        {paid ? "Paid at the till" : "On the terminal"}
      </span>
    );
  }

  if (state === "voided") {
    return (
      <span className="mt-2 flex items-center gap-1.5 text-[10px] text-white/35">
        <CloudOff className="size-3" />
        Voided on the terminal
      </span>
    );
  }

  // pending or failed — both mean the till does not have this tab yet.
  return (
    <div className="mt-2 rounded-lg border border-amber-500/30 bg-amber-500/[0.07] px-2 py-1.5">
      <p className="flex items-center gap-1.5 text-[10px] font-medium text-amber-300">
        <CloudOff className="size-3" />
        {state === "failed" ? "Not on the terminal" : "Reaching the terminal…"}
      </p>
      {state === "failed" && (
        <>
          {lastError && (
            <p className="mt-1 line-clamp-2 text-[10px] leading-snug text-amber-200/60">
              {lastError}
            </p>
          )}
          <button
            type="button"
            disabled={busy}
            onClick={onRetry}
            className="mt-1.5 flex items-center gap-1 text-[10px] font-medium text-amber-300 underline underline-offset-2 disabled:opacity-40"
          >
            <RefreshCw className={cn("size-2.5", busy && "animate-spin")} />
            {busy ? "Retrying…" : "Retry"}
          </button>
        </>
      )}
    </div>
  );
}

function Chip({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-white/[0.08] px-4 py-3">
      <span className="block font-[family-name:var(--font-display)] text-xl leading-none text-white">
        {value}
      </span>
      <span className="block text-[10px] tracking-[0.16em] text-white/45 uppercase">{label}</span>
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
