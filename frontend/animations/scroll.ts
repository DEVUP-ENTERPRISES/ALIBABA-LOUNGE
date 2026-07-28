import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

let registered = false;

export function registerScrollTrigger() {
  if (typeof window === "undefined" || registered) return;
  gsap.registerPlugin(ScrollTrigger);
  registered = true;
}

export function fadeUpReveal(
  selector: string | Element | Element[] | NodeListOf<Element>,
  options?: {
    y?: number;
    stagger?: number;
    start?: string;
    delay?: number;
  }
) {
  registerScrollTrigger();
  const { y = 48, stagger = 0.1, start = "top 90%", delay = 0 } = options ?? {};
  const targets =
    selector instanceof NodeList ? Array.from(selector) : Array.isArray(selector) ? selector : [selector];

  if (targets.length === 0) return;

  // Set explicit start state — more reliable than gsap.from() which can race
  gsap.set(targets, { opacity: 0, y });

  gsap.to(targets, {
    y: 0,
    opacity: 1,
    duration: 0.9,
    stagger,
    delay,
    ease: "power3.out",
    scrollTrigger: {
      trigger: targets[0] as Element,
      start,
      toggleActions: "play none none none",   // never reverses — elements stay visible
      invalidateOnRefresh: true,              // recalculate positions after Lenis settles
      once: true,
    },
  });
}

export function parallaxElement(
  element: Element | string,
  speed = 0.3
) {
  registerScrollTrigger();
  gsap.to(element, {
    yPercent: speed * 100,
    ease: "none",
    scrollTrigger: {
      trigger: element,
      start: "top bottom",
      end: "bottom top",
      scrub: true,
    },
  });
}

export function scaleOnScroll(element: Element | string) {
  registerScrollTrigger();
  gsap.fromTo(
    element,
    { scale: 1.15 },
    {
      scale: 1,
      ease: "power2.out",
      scrollTrigger: {
        trigger: element,
        start: "top bottom",
        end: "center center",
        scrub: 1.2,
      },
    }
  );
}

export function refreshScrollTrigger() {
  if (typeof window === "undefined") return;
  registerScrollTrigger();
  ScrollTrigger.refresh();
}
