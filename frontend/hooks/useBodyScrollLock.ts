"use client";

import { useEffect } from "react";

/**
 * One owner of body scroll, however many overlays want it locked.
 *
 * The navbar drawer, the cart sheet, the booking modal and the admin modal
 * each used to write document.body.style.overflow directly. With two of them
 * open at once — a drawer over the order page, say — whichever closed first
 * cleared the lock the other still needed, and whichever unmounted last could
 * leave a lock behind with nothing on screen to explain it. A page that will
 * not scroll while taps still work is the result, and it is invisible in code
 * review because each component looks correct on its own.
 *
 * Counting fixes both directions: the lock goes on at the first claim and
 * comes off only when the last one lets go.
 */
let locks = 0;
let previousOverflow = "";

function apply() {
  if (typeof document === "undefined") return;
  if (locks > 0) {
    document.body.style.overflow = "hidden";
  } else {
    // Restore rather than blank it, in case a stylesheet set it deliberately.
    document.body.style.overflow = previousOverflow;
  }
}

export function useBodyScrollLock(locked: boolean) {
  useEffect(() => {
    if (!locked) return;

    if (locks === 0) previousOverflow = document.body.style.overflow || "";
    locks += 1;
    apply();

    return () => {
      locks = Math.max(0, locks - 1);
      apply();
    };
  }, [locked]);
}

/**
 * Release every lock.
 *
 * A last resort for the case this hook cannot see: a component that unmounted
 * without its cleanup running would leave the count above zero and the page
 * unscrollable for the rest of the session. Called on navigation, where no
 * overlay should legitimately still be holding the page.
 */
export function releaseAllScrollLocks() {
  locks = 0;
  apply();
}
