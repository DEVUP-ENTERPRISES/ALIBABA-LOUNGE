"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Calendar, Check, PartyPopper, Search, Users, X } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Input } from "@/components/ui/input";
import {
  RESERVATION_STEPS,
  reservationStepIndex,
  useReservationStatus,
} from "@/hooks/useReservationStatus";
import { formatUsDate, formatUsTime } from "@/lib/format";
import { getCookie, setCookie } from "@/lib/cookies";
import { cn } from "@/lib/utils";

const CODE_KEY = "alibaba-reservation-code";
const CODE_TTL_SECONDS = 14 * 24 * 60 * 60;

/**
 * Where a guest finds out what happened to their booking.
 *
 * Bookings are made by people who are not signed in, so the reference code is
 * the whole key. It arrives in the link from the confirmation, and is
 * remembered afterwards so coming back later does not mean digging through
 * email for it.
 */
export function ReservationStatusContent() {
  const params = useSearchParams();
  const [code, setCode] = useState<string | null>(null);
  const [draft, setDraft] = useState("");

  const { reservation, error, loading, justChanged, acknowledge } =
    useReservationStatus(code);

  // A code from the link wins; otherwise fall back to the last one looked up.
  useEffect(() => {
    const fromLink = params.get("code");
    const remembered = getCookie(CODE_KEY);
    const initial = fromLink || remembered;
    if (initial) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCode(initial.toUpperCase());
      setDraft(initial.toUpperCase());
    }
  }, [params]);

  // Only remember codes that actually resolved, so a typo is not kept.
  useEffect(() => {
    if (reservation?.reference) {
      setCookie(CODE_KEY, reservation.reference, { maxAgeSeconds: CODE_TTL_SECONDS });
    }
  }, [reservation?.reference]);

  useEffect(() => {
    if (!justChanged) return;
    const t = window.setTimeout(acknowledge, 7000);
    return () => window.clearTimeout(t);
  }, [justChanged, acknowledge]);

  const status = reservation?.status;
  const index = reservationStepIndex(status);
  const cancelled = status === "cancelled" || status === "no-show";
  const finished = cancelled || status === "completed";

  return (
    <div className="cinematic-backdrop relative min-h-screen pt-24 pb-24 pb-mobile-cta">
      {/* Sits below the 72px navbar rather than over it — the page is wrapped
          in an animating motion.div, which traps any z-index inside it. */}
      <AnimatePresence>
        {justChanged && (
          <motion.div
            initial={{ y: -80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -80, opacity: 0 }}
            transition={{ type: "spring", damping: 24, stiffness: 300 }}
            role="status"
            aria-live="polite"
            onClick={acknowledge}
            className="fixed inset-x-3 top-[calc(env(safe-area-inset-top,0px)+5.25rem)] z-[9000] mx-auto max-w-md cursor-pointer rounded-2xl border border-[#d4af37]/40 bg-[#0a0a0c]/97 p-4 shadow-[0_20px_50px_rgba(0,0,0,0.65)] backdrop-blur-xl"
          >
            <div className="flex items-center gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#d4af37]/15">
                {justChanged === "confirmed" ? (
                  <PartyPopper className="size-5 text-[#d4af37]" />
                ) : (
                  <Check className="size-5 text-[#d4af37]" />
                )}
              </span>
              <div className="min-w-0 flex-1 text-left">
                <p className="font-[family-name:var(--font-display)] text-base leading-tight text-white">
                  {justChanged === "confirmed" && reservation?.tableCode
                    ? `Table ${reservation.tableCode} is yours`
                    : (RESERVATION_STEPS[reservationStepIndex(justChanged)]?.headline ??
                      "Booking updated")}
                </p>
                <p className="mt-0.5 text-xs leading-snug text-white/55">
                  {justChanged === "confirmed"
                    ? "You are confirmed. Enjoy your night."
                    : RESERVATION_STEPS[reservationStepIndex(justChanged)]?.blurb}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative mx-auto max-w-2xl px-5 sm:px-8">
        <SectionHeading
          eyebrow="Your booking"
          title="Track Your Table"
          subtitle="Enter the code from your confirmation to see where things stand."
        />

        <form
          onSubmit={(e) => {
            e.preventDefault();
            const next = draft.trim().toUpperCase();
            if (next) setCode(next);
          }}
          className="mx-auto mt-8 flex max-w-sm gap-2"
        >
          <Input
            value={draft}
            onChange={(e) => setDraft(e.target.value.toUpperCase())}
            placeholder="AB-XXXXXX"
            aria-label="Reservation code"
            className="text-center tracking-[0.18em] uppercase"
          />
          <button
            type="submit"
            className="flex shrink-0 items-center gap-2 rounded-xl bg-gradient-to-r from-[#8b6914] via-[#d4af37] to-[#8b6914] px-5 font-[family-name:var(--font-accent)] text-[11px] tracking-[0.14em] text-[#050505] uppercase"
          >
            <Search className="size-3.5" /> Find
          </button>
        </form>

        {loading && !reservation && (
          <p className="mt-8 text-center text-sm text-white/35">Looking it up…</p>
        )}

        {error && !reservation && (
          <p
            role="alert"
            className="mx-auto mt-8 max-w-sm rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-center text-sm text-rose-300"
          >
            {error}
          </p>
        )}

        {reservation && (
          <div className="mt-10">
            <div
              className={cn(
                "mx-auto flex size-20 items-center justify-center rounded-full border transition-colors duration-500",
                cancelled
                  ? "border-rose-400/40 bg-rose-500/10"
                  : status === "completed"
                    ? "border-emerald-400/40 bg-emerald-500/10"
                    : "border-[#d4af37]/40 bg-[#d4af37]/10"
              )}
            >
              {cancelled ? (
                <X className="size-9 text-rose-300" />
              ) : status === "completed" ? (
                <PartyPopper className="size-9 text-emerald-300" />
              ) : (
                <Check className="size-9 text-[#d4af37]" />
              )}
            </div>

            <h2 className="mt-6 text-center font-[family-name:var(--font-display)] text-3xl text-white">
              {status === "cancelled"
                ? "This booking was cancelled"
                : status === "no-show"
                  ? "Marked as a no-show"
                  : status === "confirmed" && reservation.tableCode
                    ? `Table ${reservation.tableCode} is yours`
                    : (RESERVATION_STEPS[index]?.headline ?? "Booking found")}
            </h2>

            <p className="mt-3 text-center text-white/55">
              {cancelled
                ? reservation.statusNote ||
                  "Give us a call and we will find you another night."
                : RESERVATION_STEPS[index]?.blurb}
            </p>

            {!cancelled && (
              <ol className="mt-8 flex items-start justify-between gap-1">
                {RESERVATION_STEPS.map((st, i) => {
                  const done = i <= index;
                  const now = i === index;
                  return (
                    <li key={st.id} className="flex flex-1 flex-col items-center gap-2">
                      <div className="flex w-full items-center">
                        <span
                          className={cn(
                            "h-px flex-1",
                            i === 0 ? "opacity-0" : done ? "bg-[#d4af37]/50" : "bg-white/10"
                          )}
                        />
                        <span
                          className={cn(
                            "flex size-6 shrink-0 items-center justify-center rounded-full border text-[10px] transition-colors duration-500",
                            done
                              ? "border-[#d4af37] bg-[#d4af37] text-[#050505]"
                              : "border-white/15 text-white/30",
                            now && "ring-4 ring-[#d4af37]/20"
                          )}
                        >
                          {done ? <Check className="size-3" /> : i + 1}
                        </span>
                        <span
                          className={cn(
                            "h-px flex-1",
                            i === RESERVATION_STEPS.length - 1
                              ? "opacity-0"
                              : i < index
                                ? "bg-[#d4af37]/50"
                                : "bg-white/10"
                          )}
                        />
                      </div>
                      <span
                        className={cn(
                          "text-center text-[10px] leading-tight",
                          now ? "text-[#d4af37]" : done ? "text-white/50" : "text-white/25"
                        )}
                      >
                        {st.label}
                      </span>
                    </li>
                  );
                })}
              </ol>
            )}

            {!finished && (
              <p className="mt-6 flex items-center justify-center gap-2 text-xs text-white/35">
                <span className="relative flex size-1.5">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-[#d4af37] opacity-70" />
                  <span className="relative inline-flex size-1.5 rounded-full bg-[#d4af37]" />
                </span>
                Updating live
              </p>
            )}

            <div className="mt-8 rounded-2xl border border-white/[0.08] bg-[#0c0c0e]/70 p-5">
              <div className="flex items-center justify-between gap-3">
                <p className="font-[family-name:var(--font-accent)] text-[10px] tracking-[0.22em] text-[#d4af37] uppercase">
                  {reservation.reference}
                </p>
                {reservation.tableCode && !cancelled && (
                  <p className="text-xs text-white/45">
                    Table <span className="text-white/80">{reservation.tableCode}</span>
                  </p>
                )}
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <p className="flex items-center gap-2.5 text-sm text-white/70">
                  <Calendar className="size-4 shrink-0 text-[#d4af37]/70" />
                  {formatUsDate(reservation.date)} · {formatUsTime(reservation.time)}
                </p>
                <p className="flex items-center gap-2.5 text-sm text-white/70">
                  <Users className="size-4 shrink-0 text-[#d4af37]/70" />
                  {reservation.guests} {reservation.guests === 1 ? "guest" : "guests"}
                </p>
              </div>

              {reservation.statusNote && !cancelled && (
                <p className="mt-4 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 text-sm text-white/60">
                  {reservation.statusNote}
                </p>
              )}

              <p className="mt-4 text-[11px] text-white/35">
                Bring photo ID — we verify 21+ for all tobacco service.
              </p>
            </div>

            <div className="mt-6 text-center">
              <a
                href="tel:+14695865437"
                className="text-xs text-white/35 transition-colors hover:text-[#d4af37]"
              >
                Need to change something? Call (469) 586-5437
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
