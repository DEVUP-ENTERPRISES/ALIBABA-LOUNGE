"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { reservationApi } from "@/lib/admin/data-api";
import type { ReservationLifecycle, ReservationView } from "@/lib/admin/types";

/** States the floor may still act on, so the page keeps asking. */
const LIVE: ReservationLifecycle[] = ["pending", "confirmed", "seated"];

const POLL_MS = 15000;
/** A booking is checked over hours, not seconds — back right off when hidden. */
const HIDDEN_POLL_MS = 60000;

/**
 * Watches one booking by its reference code.
 *
 * A guest who books has no account and no way back in, so before this the only
 * way to learn a booking had been approved was to ring the venue. Polls the
 * public lookup and reports the moment it changes.
 *
 * Slower than the order poller on purpose: a table booked for tonight does not
 * change every eight seconds, and this runs on a phone that may sit on the
 * page for a long time.
 */
export function useReservationStatus(reference: string | null) {
  const [reservation, setReservation] = useState<ReservationView | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [justChanged, setJustChanged] = useState<ReservationLifecycle | null>(null);
  const seen = useRef<ReservationLifecycle | null>(null);

  const load = useCallback(async () => {
    if (!reference) return;
    try {
      const next = await reservationApi.lookup(reference);
      setReservation(next);
      setError(null);

      if (seen.current && seen.current !== next.status) {
        setJustChanged(next.status);
        if (typeof navigator !== "undefined" && "vibrate" in navigator) {
          navigator.vibrate(next.status === "confirmed" ? [70, 50, 70] : [40]);
        }
      }
      seen.current = next.status;
    } catch (err) {
      // Only surface the failure before anything has loaded. Once a booking is
      // on screen, a blip on the way to the venue should not wipe it.
      if (!seen.current) {
        setError(err instanceof Error ? err.message : "We could not find that code.");
      }
    } finally {
      setLoading(false);
    }
  }, [reference]);

  useEffect(() => {
    if (!reference) {
      setReservation(null);
      setError(null);
      seen.current = null;
      return;
    }

    setLoading(true);
    let timer: number;
    let stopped = false;

    const tick = async () => {
      await load();
      if (stopped) return;
      if (seen.current && !LIVE.includes(seen.current)) return;
      timer = window.setTimeout(
        tick,
        document.visibilityState === "hidden" ? HIDDEN_POLL_MS : POLL_MS
      );
    };
    void tick();

    const onVisible = () => {
      if (document.visibilityState === "visible") void load();
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      stopped = true;
      window.clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [reference, load]);

  return {
    reservation,
    error,
    loading,
    justChanged,
    acknowledge: useCallback(() => setJustChanged(null), []),
    refresh: load,
  };
}

/** The journey a booking takes, and what to say at each point. */
export const RESERVATION_STEPS: {
  id: ReservationLifecycle;
  label: string;
  headline: string;
  blurb: string;
}[] = [
  {
    id: "pending",
    label: "Requested",
    headline: "We have your request",
    blurb: "Our floor team is finding you the right table. Hang tight.",
  },
  {
    id: "confirmed",
    label: "Confirmed",
    headline: "You are in",
    blurb: "Your table is booked and waiting. See you tonight.",
  },
  {
    id: "seated",
    label: "Seated",
    headline: "Welcome in",
    blurb: "You are at your table. Enjoy every minute of it.",
  },
  {
    id: "completed",
    label: "Done",
    headline: "Thanks for coming",
    blurb: "Hope it was a good one. The coals will be ready next time.",
  },
];

export const reservationStepIndex = (s: ReservationLifecycle | undefined) =>
  RESERVATION_STEPS.findIndex((x) => x.id === s);
