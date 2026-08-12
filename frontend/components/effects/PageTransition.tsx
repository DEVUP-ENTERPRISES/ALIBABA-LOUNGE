"use client";

import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";

/**
 * Page transition on navigation.
 *
 * The page content is a plain keyed motion.div, deliberately NOT wrapped in
 * AnimatePresence. AnimatePresence keeps the outgoing child mounted until its
 * exit resolves, and since page content sits in normal document flow that put
 * two whole pages in the document at once — the old page's footer above the
 * new page's hero, so the site appeared to start again below itself.
 *
 * Changing the key lets React swap the tree atomically: exactly one page is
 * ever in the DOM. The fade-up still plays because the new element mounts with
 * its own initial state.
 *
 * The veil keeps AnimatePresence — it is fixed-position, so overlapping copies
 * cannot affect layout.
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <>
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.62, ease: [0.22, 1, 0.36, 1] }}
      >
        {children}
      </motion.div>

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
