"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

const LOADER_SEEN_KEY = "sheesh-loader-seen";

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

    // Reveal completes at ~1.75s (rule settles at 0.85s + 0.9s). Hold just
    // past it — an intro that outstays the content it is hiding reads as lag.
    const t = window.setTimeout(() => setLoading(false), 2000);
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

            <div className="relative w-[min(80vw,540px)]">
              {/* Restrained bloom. A strong gold glow behind a gold mark
                  flattens it — this only lifts it off the black. */}
              <motion.div
                aria-hidden
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: [0, 0.5, 0.3], scale: [0.7, 1.15, 1.05] }}
                transition={{ duration: 1.6, times: [0, 0.55, 1], ease: "easeOut" }}
                className="pointer-events-none absolute -inset-x-10 -inset-y-16 bg-[radial-gradient(ellipse_at_center,rgba(212,175,55,0.16),transparent_70%)] blur-2xl"
              />

              <motion.div
                initial={{ opacity: 0, scale: 0.94, filter: "blur(12px)" }}
                animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                transition={{ duration: 0.95, ease: [0.16, 1, 0.3, 1] }}
                className="relative"
              >
                <Image
                  src="/alibaba-logo.png"
                  alt="Alibaba Hookah Lounge"
                  width={979}
                  height={324}
                  priority
                  sizes="(max-width: 640px) 80vw, 540px"
                  className="h-auto w-full"
                />

                {/* Shine travelling through the letterforms themselves */}
                <motion.div
                  aria-hidden
                  initial={{ x: "-120%" }}
                  animate={{ x: "120%" }}
                  transition={{ delay: 0.55, duration: 1.0, ease: [0.4, 0, 0.2, 1] }}
                  className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/70 to-transparent"
                  style={{
                    WebkitMaskImage: "url(/alibaba-logo.png)",
                    maskImage: "url(/alibaba-logo.png)",
                    WebkitMaskSize: "contain",
                    maskSize: "contain",
                    WebkitMaskRepeat: "no-repeat",
                    maskRepeat: "no-repeat",
                    WebkitMaskPosition: "center",
                    maskPosition: "center",
                  }}
                />
              </motion.div>

              {/* Hairline drawing outward beneath the mark */}
              <motion.div
                aria-hidden
                initial={{ scaleX: 0, opacity: 0 }}
                animate={{ scaleX: 1, opacity: 1 }}
                transition={{ delay: 0.85, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                className="mx-auto mt-5 h-px w-3/5 bg-gradient-to-r from-transparent via-[#d4af37]/70 to-transparent"
              />
            </div>
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
            @keyframes loader-screen-dismiss { 0%,85%{opacity:1;visibility:visible} 100%{opacity:0;visibility:hidden;pointer-events:none} }
            .loader-orb { animation: loader-orb-pulse 3s ease-in-out infinite; }
            .loader-bar { animation: loader-bar-fill 1.85s cubic-bezier(0.16,1,0.3,1) forwards; }
            .loader-screen { animation: loader-screen-dismiss 2.4s cubic-bezier(0.22,1,0.36,1) forwards; }
          `}</style>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
