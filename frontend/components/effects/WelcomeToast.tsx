"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, Phone } from "lucide-react";
import Link from "next/link";

const TOAST_KEY = "sheesh-welcome-toast";

export function WelcomeToast() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem(TOAST_KEY)) return;
    const timer = setTimeout(() => {
      setVisible(true);
      sessionStorage.setItem(TOAST_KEY, "1");
    }, 2800);
    return () => clearTimeout(timer);
  }, []);

  const dismiss = () => setVisible(false);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 80, opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 80, opacity: 0, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 280, damping: 28 }}
          className="fixed bottom-28 right-4 z-[9000] max-w-[calc(100vw-2rem)] w-[340px] lg:bottom-8 lg:right-8"
        >
          <div className="glass-ultra rounded-2xl overflow-hidden border-gold-gradient">
            {/* Gold top strip */}
            <div className="h-[2px] w-full bg-gradient-to-r from-[#8b6914] via-[#d4af37] to-[#8b6914]" />

            <div className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#d4af37]/10 border border-[#d4af37]/20">
                    <Sparkles className="size-4 text-[#d4af37]" />
                  </div>
                  <div>
                    <p className="font-[family-name:var(--font-display)] text-sm text-white">
                      Welcome to Sheesh Dallas
                    </p>
                    <p className="mt-0.5 font-[family-name:var(--font-body)] text-xs text-white/45 leading-snug">
                      Luxury dining · Hookah · Private events
                    </p>
                  </div>
                </div>
                <button
                  onClick={dismiss}
                  className="shrink-0 rounded-full p-1.5 text-white/30 hover:text-white/70 transition-colors"
                  aria-label="Dismiss"
                >
                  <X className="size-3.5" />
                </button>
              </div>

              <div className="mt-4 flex gap-2">
                <Link
                  href="/reservation"
                  onClick={dismiss}
                  className="flex-1 rounded-xl bg-gradient-to-r from-[#8b6914] via-[#d4af37] to-[#8b6914] py-2.5 text-center font-[family-name:var(--font-accent)] text-[10px] font-medium tracking-[0.15em] text-[#050505] uppercase transition-shadow hover:shadow-[0_0_20px_rgba(212,175,55,0.4)]"
                >
                  Reserve Table
                </Link>
                <a
                  href="tel:+12144077941"
                  onClick={dismiss}
                  className="flex items-center gap-1.5 rounded-xl border border-white/10 px-4 py-2.5 font-[family-name:var(--font-body)] text-xs text-white/60 hover:text-white hover:border-white/25 transition-colors"
                >
                  <Phone className="size-3.5" />
                  <span>Call Us</span>
                </a>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
