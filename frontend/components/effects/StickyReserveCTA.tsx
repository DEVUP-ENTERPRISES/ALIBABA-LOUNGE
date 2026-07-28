"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UtensilsCrossed, Phone } from "lucide-react";
import Link from "next/link";

export function StickyReserveCTA() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 420);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 32 }}
          className="fixed bottom-0 left-0 right-0 z-[8000] lg:hidden"
        >
          {/* Top gold line */}
          <div className="h-px bg-gradient-to-r from-transparent via-[#d4af37]/40 to-transparent" />

          <div className="glass-ultra flex items-center gap-3 px-4 py-3">
            <Link
              href="/reservation"
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#8b6914] via-[#d4af37] to-[#8b6914] py-3.5 font-[family-name:var(--font-accent)] text-[11px] font-medium tracking-[0.15em] text-[#050505] uppercase shadow-[0_0_20px_rgba(212,175,55,0.3)] active:scale-[0.97] transition-transform"
            >
              <UtensilsCrossed className="size-4" />
              Reserve a Table
            </Link>
            <a
              href="tel:+12144077941"
              className="flex size-[50px] shrink-0 items-center justify-center rounded-xl border border-white/10 text-white/60 active:scale-95 transition-transform"
              aria-label="Call us"
            >
              <Phone className="size-5" />
            </a>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
