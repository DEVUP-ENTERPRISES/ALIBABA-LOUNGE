"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const LOADER_SEEN_KEY = "sheesh-loader-seen";
const letters = ["S", "H", "E", "E", "S", "H"];

export function LoadingScreen() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let shouldSkip = false;

    try {
      shouldSkip = window.sessionStorage.getItem(LOADER_SEEN_KEY) === "true";
      window.sessionStorage.setItem(LOADER_SEEN_KEY, "true");
    } catch {
      shouldSkip = false;
    }

    if (shouldSkip) {
      const skipTimer = window.setTimeout(() => setLoading(false), 120);
      return () => window.clearTimeout(skipTimer);
    }

    const t = window.setTimeout(() => setLoading(false), 1900);
    return () => clearTimeout(t);
  }, []);

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          key="loader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.03, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } }}
          className="loader-screen fixed inset-0 z-[10000] flex flex-col items-center justify-center overflow-hidden bg-[#030303]"
        >
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_50%,rgba(212,175,55,0.07),transparent_70%)]" />

          {/* Pulsing orb - CSS not framer */}
          <div className="loader-orb absolute h-[480px] w-[480px] rounded-full opacity-10"
            style={{ background: "radial-gradient(circle, rgba(212,175,55,0.4), transparent 70%)", filter: "blur(100px)" }}
          />

          <div className="relative flex flex-col items-center gap-4">
            <motion.p
              initial={{ opacity: 0, letterSpacing: "0.2em" }}
              animate={{ opacity: 1, letterSpacing: "0.6em" }}
              transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
              className="font-[family-name:var(--font-accent)] text-[10px] text-[#d4af37]/60 uppercase"
            >
              Est. 2024 / Dallas, TX
            </motion.p>

            <div className="flex items-baseline gap-1 sm:gap-2">
              {letters.map((letter, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0, y: 36, filter: "blur(8px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  transition={{ delay: 0.12 + i * 0.07, duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
                  className="font-[family-name:var(--font-display)] text-5xl text-white tracking-[0.15em] uppercase sm:text-7xl md:text-8xl"
                  style={{ textShadow: "0 0 40px rgba(212,175,55,0.2)" }}
                >
                  {letter}
                </motion.span>
              ))}
            </div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.65, duration: 0.7 }}
              className="font-[family-name:var(--font-accent)] text-xs tracking-[0.45em] text-[#f5e6c8]/50 uppercase"
            >
              Eatery & Lounge
            </motion.p>
          </div>

          {/* CSS progress bar - no rAF loop */}
          <div className="absolute bottom-12 left-1/2 flex w-64 -translate-x-1/2 flex-col items-center gap-3">
            <div className="h-px w-full overflow-hidden bg-white/[0.07] rounded-full">
              <div className="loader-bar h-full rounded-full bg-gradient-to-r from-[#8b6914] via-[#d4af37] to-[#f5e6c8]" />
            </div>
            <p className="font-[family-name:var(--font-body)] text-[9px] tracking-[0.25em] text-white/20 uppercase">
              Loading
            </p>
          </div>

          <style>{`
            @keyframes loader-orb-pulse { 0%,100%{transform:scale(1);opacity:.06} 50%{transform:scale(1.3);opacity:.14} }
            @keyframes loader-bar-fill { from{width:0%} to{width:100%} }
            @keyframes loader-screen-dismiss { 0%,82%{opacity:1;visibility:visible} 100%{opacity:0;visibility:hidden;pointer-events:none} }
            .loader-orb { animation: loader-orb-pulse 3s ease-in-out infinite; }
            .loader-bar { animation: loader-bar-fill 1.7s cubic-bezier(0.16,1,0.3,1) forwards; }
            .loader-screen { animation: loader-screen-dismiss 2.35s cubic-bezier(0.22,1,0.36,1) forwards; }
          `}</style>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
