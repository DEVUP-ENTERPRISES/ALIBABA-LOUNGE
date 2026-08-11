"use client";

import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";

/**
 * Page transition on navigation.
 *
 * Keyed on pathname — without that this mounts once and never animates
 * again, so nav clicks swapped pages with no transition at all.
 *
 * `mode="wait"` is avoided: holding the incoming page until the outgoing
 * one finishes doubles the perceived wait. Instead the new page fades up
 * while a brief gold veil passes over the top, which reads as a deliberate
 * transition rather than a flicker.
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <>
      <AnimatePresence initial={false}>
        <motion.div
          key={pathname}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.62, ease: [0.22, 1, 0.36, 1] }}
        >
          {children}
        </motion.div>
      </AnimatePresence>

      {/* Gold veil sweeping over the swap. Pointer-events off so it never
          blocks a click landing on the page underneath. */}
      <AnimatePresence initial={false}>
        <motion.div
          key={`veil-${pathname}`}
          aria-hidden
          initial={{ opacity: 0.55 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
          className="pointer-events-none fixed inset-0 z-[9500] bg-[radial-gradient(ellipse_70%_50%_at_50%_50%,rgba(212,175,55,0.12),transparent_70%)] backdrop-blur-[2px]"
          style={{ backgroundColor: "rgba(5,5,5,0.85)" }}
        />
      </AnimatePresence>
    </>
  );
}
