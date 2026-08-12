"use client";

import { useCallback, useEffect, useState } from "react";
import { deleteCookie, getJsonCookie, setJsonCookie } from "@/lib/cookies";

const KEY = "alibaba-open-tab";
/** A tab older than this is almost certainly finished and paid. */
const TAB_TTL_MS = 4 * 60 * 60 * 1000;
/** How long before we suggest another round. */
export const NUDGE_AFTER_MS = 30 * 60 * 1000;

export interface OpenTab {
  tableId: string;
  tableCode: string;
  orderNumber: number;
  lastOrderAt: number;
}

/**
 * Remembers the table a guest is sitting at.
 *
 * A guest orders, puts their phone away, and comes back later wanting another
 * round. Without this they would pick a table again — and their own table now
 * shows as locked, which reads as a fault. Instead we drop them straight back
 * onto their tab, and after half an hour offer a refill rather than waiting to
 * be asked.
 */
export function useOpenTab() {
  const [tab, setTab] = useState<OpenTab | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Cookies are unreadable during render, so the tab resolves after mount.
    const parsed = getJsonCookie<OpenTab>(KEY);
    if (parsed) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (Date.now() - parsed.lastOrderAt < TAB_TTL_MS) setTab(parsed);
      else deleteCookie(KEY);
    }
    setReady(true);
  }, []);

  const remember = useCallback((next: Omit<OpenTab, "lastOrderAt">) => {
    const value: OpenTab = { ...next, lastOrderAt: Date.now() };
    setTab(value);
    setJsonCookie(KEY, value, TAB_TTL_MS / 1000);
  }, []);

  const clear = useCallback(() => {
    setTab(null);
    deleteCookie(KEY);
  }, []);

  return { tab, ready, remember, clear };
}

/** True once enough time has passed to offer another round. Re-checks itself. */
export function useNudgeDue(lastOrderAt: number | undefined) {
  const [due, setDue] = useState(false);

  useEffect(() => {
    if (!lastOrderAt) {
      setDue(false);
      return;
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    const evaluate = () => setDue(Date.now() - lastOrderAt >= NUDGE_AFTER_MS);
    evaluate();
    const id = window.setInterval(evaluate, 60000);
    return () => window.clearInterval(id);
  }, [lastOrderAt]);

  return due;
}
