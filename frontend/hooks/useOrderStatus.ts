"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { orderApi } from "@/lib/admin/data-api";
import type { OrderStatus, OrderStatusView } from "@/lib/admin/types";

/** Statuses where the kitchen still has work to do. */
const LIVE: OrderStatus[] = ["placed", "accepted", "preparing", "served"];

const POLL_MS = 8000;
/** Back off once the phone is in a pocket; the screen is not being read. */
const HIDDEN_POLL_MS = 30000;

export interface OrderProgress {
  order: OrderStatusView | null;
  /** Set the moment the status changes, for the banner. Clear it when shown. */
  justChanged: OrderStatus | null;
  acknowledge: () => void;
  refresh: () => void;
}

/**
 * Watches one order and reports when it moves.
 *
 * The confirmation screen used to be a dead end: it said a server would
 * confirm shortly and then never mentioned it again, so a guest had no way to
 * tell whether anyone had picked the order up. This polls the public status
 * endpoint and surfaces each transition as it happens.
 *
 * Polling rather than sockets on purpose — the venue shares one connection,
 * the tab is open for minutes not hours, and a dropped socket fails silently
 * in a way a poll does not.
 */
export function useOrderStatus(orderId: string | null | undefined): OrderProgress {
  const [order, setOrder] = useState<OrderStatusView | null>(null);
  const [justChanged, setJustChanged] = useState<OrderStatus | null>(null);
  const seen = useRef<OrderStatus | null>(null);

  const load = useCallback(async () => {
    if (!orderId) return;
    try {
      const next = await orderApi.status(orderId);
      setOrder(next);
      if (seen.current && seen.current !== next.status) {
        setJustChanged(next.status);
        // A phone face-down on the table is the normal case, so the buzz
        // carries the news rather than the screen.
        if (typeof navigator !== "undefined" && "vibrate" in navigator) {
          navigator.vibrate(
            next.status === "accepted" ? [60, 40, 60] : next.status === "served" ? [90] : [40]
          );
        }
      }
      seen.current = next.status;
    } catch {
      // A blip on venue wifi is not worth surfacing; the next tick retries.
    }
  }, [orderId]);

  useEffect(() => {
    if (!orderId) {
      setOrder(null);
      seen.current = null;
      return;
    }

    let timer: number;
    let stopped = false;

    const tick = async () => {
      await load();
      if (stopped) return;
      const done = seen.current && !LIVE.includes(seen.current);
      if (done) return; // nothing more will happen; stop asking
      timer = window.setTimeout(
        tick,
        document.visibilityState === "hidden" ? HIDDEN_POLL_MS : POLL_MS
      );
    };
    void tick();

    // Coming back to the tab should feel instant, not up to eight seconds stale.
    const onVisible = () => {
      if (document.visibilityState === "visible") void load();
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      stopped = true;
      window.clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [orderId, load]);

  const acknowledge = useCallback(() => setJustChanged(null), []);

  return { order, justChanged, acknowledge, refresh: load };
}

/** Where an order sits on the journey, and what to say about it. */
export const STATUS_STEPS: {
  id: OrderStatus;
  label: string;
  headline: string;
  blurb: string;
}[] = [
  {
    id: "placed",
    label: "Sent",
    headline: "Order is in",
    blurb: "It just landed on the floor screen. Someone is about to grab it.",
  },
  {
    id: "accepted",
    label: "Accepted",
    headline: "You have been claimed",
    blurb: "A server has your order and it is officially their problem now.",
  },
  {
    id: "preparing",
    label: "Building",
    headline: "Coals are on",
    blurb: "Your hookah is being packed and lit. This is the good part.",
  },
  {
    id: "served",
    label: "At your table",
    headline: "It is on the table",
    blurb: "Everything is with you. Say the word if anything is missing.",
  },
  {
    id: "completed",
    label: "Closed",
    headline: "Tab settled",
    blurb: "All paid up. Thanks for hanging with us tonight.",
  },
];

export const statusIndex = (s: OrderStatus | undefined) =>
  STATUS_STEPS.findIndex((x) => x.id === s);
