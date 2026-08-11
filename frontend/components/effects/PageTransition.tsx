"use client";

import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";

/**
 * Cross-fades page content on navigation.
 *
 * Without a key tied to the pathname this mounts once and never animates
 * again, so every nav click swapped the page in with no transition at all.
 * `mode="wait"` is deliberately avoided — holding the new page back until
 * the old one finishes exiting reads as a stall on a fast connection.
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <AnimatePresence initial={false}>
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
