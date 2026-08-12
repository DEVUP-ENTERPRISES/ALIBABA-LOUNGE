"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getCookie, setCookie } from "@/lib/cookies";

/**
 * Alerts a worker when a new order lands.
 *
 * A lounge is loud and dark, so a silent list is not enough — a table can sit
 * unnoticed for minutes. Three channels, because no single one is reliable:
 * vibration (phones), a short chime (tablets on a stand), and a system
 * notification (when the tab is in the background).
 *
 * Browsers only allow sound and notifications after a user gesture, so the
 * worker enables alerts explicitly. Nothing fires on first load — otherwise
 * every existing order would alert at once.
 */
const ALERT_KEY = "alibaba-order-alerts";
const ONE_YEAR = 365 * 24 * 60 * 60;

export function useOrderAlerts() {
  const [enabled, setEnabled] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission | "unsupported">("default");
  const seenIds = useRef<Set<string> | null>(null);
  const audioCtx = useRef<AudioContext | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    // Permission and the saved preference are only knowable in the browser.
    setPermission("Notification" in window ? Notification.permission : "unsupported");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setEnabled(getCookie(ALERT_KEY) === "true");
  }, []);

  const enable = useCallback(async () => {
    // Unlock audio inside the click, which is the only time browsers allow it.
    try {
      const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      audioCtx.current = new Ctx();
      await audioCtx.current.resume();
    } catch {
      /* no audio — vibration and notifications still work */
    }

    if ("Notification" in window && Notification.permission === "default") {
      const result = await Notification.requestPermission();
      setPermission(result);
    } else if ("Notification" in window) {
      setPermission(Notification.permission);
    }

    setEnabled(true);
    setCookie(ALERT_KEY, "true", { maxAgeSeconds: ONE_YEAR });
  }, []);

  const disable = useCallback(() => {
    setEnabled(false);
    setCookie(ALERT_KEY, "false", { maxAgeSeconds: ONE_YEAR });
  }, []);

  /** Two short rising tones — audible over music, not alarming. */
  const chime = useCallback(() => {
    const ctx = audioCtx.current;
    if (!ctx) return;
    [880, 1180].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      const start = ctx.currentTime + i * 0.16;
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(0.25, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.28);
      osc.connect(gain).connect(ctx.destination);
      osc.start(start);
      osc.stop(start + 0.3);
    });
  }, []);

  /**
   * Call on every poll with the current open orders.
   * Returns how many were new, so the caller can show a banner.
   */
  const check = useCallback(
    (orders: { id: string; tableCode: string; orderNumber: number }[]) => {
      // First run only records what already exists; it never alerts.
      if (seenIds.current === null) {
        seenIds.current = new Set(orders.map((o) => o.id));
        return 0;
      }

      const fresh = orders.filter((o) => !seenIds.current!.has(o.id));
      orders.forEach((o) => seenIds.current!.add(o.id));
      if (fresh.length === 0 || !enabled) return fresh.length;

      try {
        navigator.vibrate?.([120, 60, 120]);
      } catch {
        /* unsupported */
      }
      chime();

      if ("Notification" in window && Notification.permission === "granted") {
        const first = fresh[0];
        new Notification(
          fresh.length === 1 ? `New order · Table ${first.tableCode}` : `${fresh.length} new orders`,
          {
            body:
              fresh.length === 1
                ? `Order #${first.orderNumber} is waiting to be accepted.`
                : fresh.map((f) => `Table ${f.tableCode}`).join(", "),
            icon: "/alibaba-logo.png",
            tag: "alibaba-order",
          }
        );
      }

      return fresh.length;
    },
    [enabled, chime]
  );

  return { enabled, permission, enable, disable, check };
}
