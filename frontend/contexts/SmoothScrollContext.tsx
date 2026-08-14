"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
} from "react";
import { usePathname } from "next/navigation";
import Lenis from "@studio-freight/lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { registerScrollTrigger } from "@/animations/scroll";
import { NAVBAR_OFFSET } from "@/lib/navigation";
import { releaseAllScrollLocks } from "@/hooks/useBodyScrollLock";

type ScrollTarget = string | number | HTMLElement;

interface SmoothScrollContextValue {
  scrollTo: (target: ScrollTarget, options?: { offset?: number }) => void;
  /**
   * Pause smooth scrolling while an overlay is open.
   *
   * Lenis takes over wheel and touch for the whole document, so a panel with
   * its own overflow cannot scroll while it is running. This version has no
   * `prevent` option — that arrived in Lenis 1.1 — so the overlay pauses it
   * and resumes on close.
   */
  setPaused: (paused: boolean) => void;
}

const SmoothScrollContext = createContext<SmoothScrollContextValue | null>(
  null
);

export function SmoothScrollProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const lenisRef = useRef<Lenis | null>(null);
  const pathname = usePathname();

  const scrollTo = useCallback(
    (target: ScrollTarget, options?: { offset?: number }) => {
      const offset = options?.offset ?? NAVBAR_OFFSET;
      const lenis = lenisRef.current;

      if (typeof target === "string" && target.startsWith("#")) {
        const el = document.querySelector(target);
        if (!el) return;
        if (lenis) {
          lenis.scrollTo(el as HTMLElement, { offset, duration: 1.2 });
        } else {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
        }
        return;
      }

      if (lenis) {
        lenis.scrollTo(target, { offset, duration: 1.2 });
      } else if (typeof target === "number") {
        window.scrollTo({ top: target, behavior: "smooth" });
      }
    },
    []
  );

  useEffect(() => {
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    const isCoarse = window.matchMedia("(pointer: coarse)").matches;
    if (prefersReduced) return;

    registerScrollTrigger();

    const lenis = new Lenis({
      duration: isCoarse ? 0.55 : 0.72,
      // cubic ease-out: snaps immediately, then floats to a stop — no sluggish lead-in
      easing: (t: number) => 1 - Math.pow(1 - t, 3),
      orientation: "vertical",
      smoothWheel: !isCoarse,
      touchMultiplier: 1.8,
    });

    lenisRef.current = lenis;
    lenis.on("scroll", ScrollTrigger.update);

    let rafId: number;
    const raf = (time: number) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);

    // Refresh after fonts/images settle so ScrollTrigger positions are accurate
    const r1 = window.setTimeout(() => ScrollTrigger.refresh(), 400);
    const r2 = window.setTimeout(() => ScrollTrigger.refresh(), 1200);

    return () => {
      window.clearTimeout(r1);
      window.clearTimeout(r2);
      cancelAnimationFrame(rafId);
      lenis.destroy();
      lenisRef.current = null;
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  useEffect(() => {
    const hash = window.location.hash;

    // Arriving on a new page, nothing should still be holding the old one.
    //
    // Both of these are belt and braces for the failure that is hardest to
    // spot from the outside: a page that will not scroll while taps and
    // navigation carry on working, with nothing on screen to explain it. An
    // overlay that unmounted without its cleanup, or a paused Lenis that was
    // never resumed, would otherwise stay that way for the rest of the
    // session — and a guest cannot fix it without knowing to force-quit.
    releaseAllScrollLocks();
    lenisRef.current?.start();

    // No hash means a plain page change. Lenis keeps its own scroll offset
    // across route changes, so without this you land on the new page at
    // whatever position you left the previous one at.
    if (!hash) {
      const lenis = lenisRef.current;
      if (lenis) {
        lenis.scrollTo(0, { immediate: true });
      } else {
        window.scrollTo(0, 0);
      }
      return;
    }

    const timer = window.setTimeout(() => {
      scrollTo(hash, { offset: NAVBAR_OFFSET });
    }, 200);

    return () => window.clearTimeout(timer);
  }, [pathname, scrollTo]);

  useEffect(() => {
    const onHashChange = () => {
      const hash = window.location.hash;
      if (hash) scrollTo(hash, { offset: NAVBAR_OFFSET });
    };
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, [scrollTo]);

  const setPaused = useCallback((paused: boolean) => {
    const lenis = lenisRef.current;
    if (!lenis) return;
    if (paused) lenis.stop();
    else lenis.start();
  }, []);

  return (
    <SmoothScrollContext.Provider value={{ scrollTo, setPaused }}>
      {children}
    </SmoothScrollContext.Provider>
  );
}

export function useSmoothScroll() {
  const ctx = useContext(SmoothScrollContext);
  return (
    ctx ?? {
      scrollTo: (target: ScrollTarget) => {
        if (typeof target === "string" && target.startsWith("#")) {
          document.querySelector(target)?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }
      },
      // No provider (or reduced motion): nothing to pause, native scroll wins.
      setPaused: () => {},
    }
  );
}
