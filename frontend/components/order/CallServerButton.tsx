"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BellRing, Check, Flame, GlassWater, Receipt, X } from "lucide-react";
import { callApi } from "@/lib/admin/data-api";
import type { WaiterCall } from "@/lib/admin/types";
import { getCookie, setCookie, deleteCookie } from "@/lib/cookies";
import { cn } from "@/lib/utils";

const CALL_KEY = "alibaba-open-call";
const CALL_TTL_SECONDS = 2 * 60 * 60;
const POLL_MS = 10000;

const REASONS: { id: WaiterCall["reason"]; label: string; icon: typeof BellRing }[] = [
  { id: "service", label: "Just a server", icon: BellRing },
  { id: "coals", label: "Change my coals", icon: Flame },
  { id: "water", label: "More water", icon: GlassWater },
  { id: "bill", label: "The bill, please", icon: Receipt },
];

/**
 * The button a guest presses instead of waving into the dark.
 *
 * Kept deliberately honest: once pressed it says someone is coming and, when
 * a server claims it, names them. A button that lights up and then tells you
 * nothing is worse than no button, because the guest cannot tell whether it
 * worked and ends up waving anyway.
 *
 * The open call is remembered in a cookie so closing the tab, or the phone
 * locking, does not lose it — they come back to "Sarah is on her way" rather
 * than a button that looks unpressed.
 */
export function CallServerButton({
  tableId,
  tableCode,
}: {
  tableId: string;
  tableCode: string;
}) {
  const [open, setOpen] = useState(false);
  const [call, setCall] = useState<WaiterCall | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Pick an existing call back up after a reload.
  useEffect(() => {
    const id = getCookie(CALL_KEY);
    if (!id) return;
    let alive = true;
    callApi
      .status(id)
      .then((c) => {
        if (!alive) return;
        if (["open", "acknowledged"].includes(c.status)) setCall(c);
        else deleteCookie(CALL_KEY);
      })
      .catch(() => deleteCookie(CALL_KEY));
    return () => {
      alive = false;
    };
  }, []);

  // While someone is waiting, watch for a server claiming it.
  useEffect(() => {
    if (!call || !["open", "acknowledged"].includes(call.status)) return;
    const t = window.setInterval(async () => {
      try {
        const next = await callApi.status(call.id);
        setCall(next);
        if (!["open", "acknowledged"].includes(next.status)) {
          deleteCookie(CALL_KEY);
          // Resolved means a server dealt with it — clear after a beat so the
          // guest sees the confirmation rather than the UI just snapping back.
          window.setTimeout(() => setCall(null), 4000);
        } else if (next.status === "acknowledged" && call.status === "open") {
          try {
            navigator.vibrate?.(60);
          } catch {
            /* unsupported */
          }
        }
      } catch {
        /* a blip; the next tick retries */
      }
    }, POLL_MS);
    return () => window.clearInterval(t);
  }, [call]);

  const raise = useCallback(
    async (reason: WaiterCall["reason"]) => {
      setBusy(true);
      setError(null);
      try {
        const res = await callApi.raise(tableId, reason);
        setCall(res.call);
        setCookie(CALL_KEY, res.call.id, { maxAgeSeconds: CALL_TTL_SECONDS });
        setOpen(false);
        try {
          navigator.vibrate?.([40, 30, 40]);
        } catch {
          /* unsupported */
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "Could not reach the floor.");
      } finally {
        setBusy(false);
      }
    },
    [tableId]
  );

  const cancel = useCallback(async () => {
    if (!call) return;
    setBusy(true);
    try {
      await callApi.cancel(call.id);
      deleteCookie(CALL_KEY);
      setCall(null);
    } catch {
      /* leave it showing; the server will resolve it */
    } finally {
      setBusy(false);
    }
  }, [call]);

  // Someone is already coming.
  if (call && ["open", "acknowledged"].includes(call.status)) {
    const claimed = call.status === "acknowledged";
    return (
      <div
        className={cn(
          "mx-auto mt-3 flex max-w-sm items-center gap-3 rounded-2xl border px-4 py-3",
          claimed
            ? "border-emerald-400/40 bg-emerald-500/[0.07]"
            : "border-[#d4af37]/40 bg-[#d4af37]/[0.07]"
        )}
      >
        <span className="relative flex size-8 shrink-0 items-center justify-center">
          {!claimed && (
            <span className="absolute inline-flex size-8 animate-ping rounded-full bg-[#d4af37]/30" />
          )}
          <span
            className={cn(
              "relative flex size-8 items-center justify-center rounded-full",
              claimed ? "bg-emerald-500/20" : "bg-[#d4af37]/20"
            )}
          >
            {claimed ? (
              <Check className="size-4 text-emerald-300" />
            ) : (
              <BellRing className="size-4 text-[#d4af37]" />
            )}
          </span>
        </span>

        <div className="min-w-0 flex-1 text-left">
          <p className="text-sm text-white">
            {claimed
              ? `${call.acknowledgedName || "A server"} is on the way`
              : "The floor has been told"}
          </p>
          <p className="text-[11px] text-white/45">
            {claimed ? call.reasonLabel : `${call.reasonLabel} · table ${tableCode}`}
          </p>
        </div>

        {!claimed && (
          <button
            type="button"
            onClick={cancel}
            disabled={busy}
            className="shrink-0 text-[11px] text-white/35 transition-colors hover:text-white/70 disabled:opacity-40"
          >
            Never mind
          </button>
        )}
      </div>
    );
  }

  // Just resolved — a brief confirmation before it disappears.
  if (call && call.status === "resolved") {
    return (
      <div className="mx-auto mt-3 flex max-w-sm items-center gap-2 rounded-2xl border border-white/10 px-4 py-3 text-sm text-white/50">
        <Check className="size-4 text-emerald-400" />
        Sorted — thanks for your patience.
      </div>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mx-auto mt-3 flex items-center gap-2 rounded-full border border-[#d4af37]/35 bg-[#d4af37]/[0.06] px-5 py-2.5 text-[11px] tracking-[0.1em] text-[#f5e6c8] uppercase transition-colors hover:bg-[#d4af37]/12"
      >
        <BellRing className="size-3.5 text-[#d4af37]" />
        Call a server
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-[8200] bg-black/75 backdrop-blur-sm"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 260 }}
              data-lenis-prevent
              className="safe-bottom fixed inset-x-0 bottom-0 z-[8300] rounded-t-3xl border-t border-[#d4af37]/30 bg-[#0a0a0c]"
            >
              <div className="mx-auto max-w-md px-5 pt-3 pb-6">
                <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-white/15" />

                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-[family-name:var(--font-accent)] text-[10px] tracking-[0.22em] text-[#d4af37] uppercase">
                      Table {tableCode}
                    </p>
                    <h2 className="mt-1.5 font-[family-name:var(--font-display)] text-2xl text-white">
                      What do you need?
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    aria-label="Close"
                    className="mt-1 flex size-9 shrink-0 items-center justify-center rounded-full border border-white/10 text-white/50"
                  >
                    <X className="size-4" />
                  </button>
                </div>

                {error && (
                  <p
                    role="alert"
                    className="mt-3 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-300"
                  >
                    {error}
                  </p>
                )}

                <div className="mt-5 grid gap-2">
                  {REASONS.map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      disabled={busy}
                      onClick={() => void raise(r.id)}
                      className="flex items-center gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.02] px-4 py-3.5 text-left transition-colors hover:border-[#d4af37]/45 hover:bg-[#d4af37]/[0.05] disabled:opacity-40"
                    >
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#d4af37]/12">
                        <r.icon className="size-4 text-[#d4af37]" />
                      </span>
                      <span className="text-sm text-white">{r.label}</span>
                    </button>
                  ))}
                </div>

                <p className="mt-4 text-center text-[11px] text-white/30">
                  Someone will come to table {tableCode}.
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
