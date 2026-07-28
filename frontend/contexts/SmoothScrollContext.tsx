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

type ScrollTarget = string | number | HTMLElement;

interface SmoothScrollContextValue {
  scrollTo: (target: ScrollTarget, options?: { offset?: number }) => void;
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

    const tick = (time: number) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    // Refresh after fonts/images settle so ScrollTrigger positions are accurate
    const r1 = window.setTimeout(() => ScrollTrigger.refresh(), 400);
    const r2 = window.setTimeout(() => ScrollTrigger.refresh(), 1200);

    return () => {
      window.clearTimeout(r1);
      window.clearTimeout(r2);
      gsap.ticker.remove(tick);
      lenis.destroy();
      lenisRef.current = null;
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  useEffect(() => {
    const hash = window.location.hash;
    if (!hash) return;

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

  return (
    <SmoothScrollContext.Provider value={{ scrollTo }}>
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
    }
  );
}
