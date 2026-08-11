"use client";

import { useEffect, useState } from "react";

const LOADER_SEEN_KEY = "sheesh-loader-seen";
const HOLD_MS = 3000;

/**
 * Intro reveal.
 *
 * Deliberately CSS-driven, not framer-motion. A JS animation cannot start
 * until React has hydrated, and on a cold load that lands well after first
 * paint — which showed the visitor an empty black screen for the first
 * second, then a jump. CSS keyframes run from the first painted frame, so
 * the reveal is identical no matter how long hydration takes.
 *
 * A plain <img> is used rather than next/image for the same reason: it
 * skips the /_next/image round trip and paints immediately.
 */
export function LoadingScreen() {
  const [loading, setLoading] = useState(true);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    let seen = false;
    try {
      seen = window.sessionStorage.getItem(LOADER_SEEN_KEY) === "true";
    } catch {
      seen = false;
    }

    if (seen) {
      setLoading(false);
      return;
    }

    // The "seen" flag is written only once the intro has actually finished.
    // Writing it on mount meant any remount — React Strict Mode in dev, a
    // fast refresh — read it back as already-seen and skipped the intro.
    const fade = window.setTimeout(() => setLeaving(true), HOLD_MS);
    const done = window.setTimeout(() => {
      try {
        window.sessionStorage.setItem(LOADER_SEEN_KEY, "true");
      } catch {
        /* storage unavailable — intro simply replays */
      }
      setLoading(false);
    }, HOLD_MS + 750);

    return () => {
      window.clearTimeout(fade);
      window.clearTimeout(done);
    };
  }, []);

  if (!loading) return null;

  return (
    <div className={`ab-loader${leaving ? " is-leaving" : ""}`} aria-hidden>
      <div className="ab-loader__glow" />

      <div className="ab-loader__stage">
        <div className="ab-loader__rule" />

        <div className="ab-loader__markwrap">
          <img
            src="/alibaba-logo.png"
            alt=""
            width={979}
            height={324}
            className="ab-loader__mark"
            fetchPriority="high"
          />
          <div className="ab-loader__shinemask">
            <div className="ab-loader__shine" />
          </div>
        </div>

        <p className="ab-loader__tag">Dallas, TX</p>
      </div>

      <div className="ab-loader__bar">
        <span />
      </div>
    </div>
  );
}
