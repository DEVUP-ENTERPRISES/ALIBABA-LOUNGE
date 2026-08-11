"use client";

import { memo, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { MagneticButton } from "@/components/ui/MagneticButton";

import { heroSlides } from "@/lib/shop-images";

const SLIDE_MS = 6000;

/**
 * Rotating stills of the actual lounge.
 *
 * This replaced a 45 MB playlist of stock food videos — vegetables on a
 * chopping board, burgers, pizza — which was both wrong for a hookah lounge
 * and the heaviest thing on the page.
 */
const HeroBackdrop = memo(function HeroBackdrop() {
  const [index, setIndex] = useState(0);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    timerRef.current = window.setInterval(
      () => setIndex((i) => (i + 1) % heroSlides.length),
      SLIDE_MS
    );
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, []);

  return (
    <div className="absolute inset-0 z-10">
      {heroSlides.map((src, i) => (
        <motion.div
          key={src}
          initial={false}
          animate={{ opacity: i === index ? 0.55 : 0, scale: i === index ? 1.06 : 1 }}
          transition={{
            opacity: { duration: 1.4, ease: "easeInOut" },
            scale: { duration: SLIDE_MS / 1000 + 1.4, ease: "linear" },
          }}
          className="absolute inset-0"
        >
          <Image
            src={src}
            alt=""
            fill
            priority={i === 0}
            quality={82}
            sizes="100vw"
            className="object-cover"
            style={{ filter: "contrast(1.05) saturate(1.08) brightness(0.9)" }}
          />
        </motion.div>
      ))}
    </div>
  );
});

export function HeroSection() {
  return (
    <section className="relative flex min-h-[92dvh] w-full flex-col items-center justify-center overflow-hidden bg-[#050505] sm:min-h-[100dvh]">
      {/* Lounge backdrop */}
      <div className="absolute inset-0 z-0 bg-black">
        <HeroBackdrop />
        <div className="absolute inset-0 z-20 bg-gradient-to-b from-black/72 via-black/12 to-[#050505] pointer-events-none" />
        <div className="absolute inset-0 z-20 bg-gradient-to-r from-[#050505]/55 via-transparent to-[#050505]/55 pointer-events-none" />
        <div className="absolute inset-0 z-20 bg-[radial-gradient(ellipse_at_center,transparent_25%,rgba(0,0,0,0.55)_100%)] pointer-events-none" />
        <div className="absolute inset-x-0 bottom-0 z-20 h-40 bg-[linear-gradient(to_top,#050505,transparent)] pointer-events-none" />
      </div>

      {/* Gold bottom glow */}
      <div className="absolute inset-x-0 bottom-0 z-20 h-44 bg-[radial-gradient(60%_85%_at_50%_100%,rgba(212,175,55,0.14),transparent_70%)] pointer-events-none" />

      {/* Main content */}
      <div className="relative z-30 flex w-full max-w-[1400px] flex-col items-center px-5 sm:px-8 mt-14 lg:mt-20">

        {/* Live badge */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.7 }}
          className="mb-5 md:mb-7 flex items-center gap-2 rounded-full border border-[#d4af37]/25 bg-[#d4af37]/8 px-4 py-1.5 backdrop-blur-sm"
        >
          <span className="relative flex size-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#d4af37] opacity-70" />
            <span className="relative inline-flex size-1.5 rounded-full bg-[#d4af37]" />
          </span>
          <span className="font-[family-name:var(--font-accent)] text-[9px] tracking-[0.45em] text-[#d4af37] uppercase">
            Now Open / Dallas, TX
          </span>
        </motion.div>

        {/* Brand logo — cinematic reveal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.86, filter: "blur(18px)" }}
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
          className="group relative w-full max-w-[min(92vw,880px)]"
        >
          {/* Gold bloom behind the mark */}
          <motion.div
            aria-hidden
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.85, 0.55] }}
            transition={{ duration: 2.6, times: [0, 0.55, 1], ease: "easeOut" }}
            className="pointer-events-none absolute -inset-x-16 -inset-y-24 -z-10 bg-[radial-gradient(ellipse_at_center,rgba(212,175,55,0.28),transparent_65%)] blur-2xl"
          />

          <Image
            src="/alibaba-logo.png"
            alt="Alibaba Hookah Lounge"
            width={979}
            height={324}
            priority
            sizes="(max-width: 768px) 92vw, 880px"
            className="relative h-auto w-full drop-shadow-[0_18px_60px_rgba(0,0,0,0.65)]"
          />

          {/* Light sweep across the mark. The mask belongs on this static
              wrapper; on the moving child it drags along and renders a
              ghost copy of the logo sliding across the hero. */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 overflow-hidden"
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
          >
            <motion.div
              initial={{ x: "-110%" }}
              animate={{ x: "110%" }}
              transition={{ delay: 1.15, duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
              className="h-full w-full bg-gradient-to-r from-transparent via-white/25 to-transparent"
            />
          </div>
        </motion.div>

        {/* Desc + CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1, duration: 0.8 }}
          className="mt-8 flex max-w-lg flex-col items-center gap-6 text-center sm:mt-12 sm:gap-8"
        >
          <p className="font-[family-name:var(--font-body)] text-sm sm:text-[15px] text-white/70 leading-relaxed tracking-wide px-2">
            Six tobacco brands, our own house mixes, fresh fruit heads, and a full drinks list. Open late, every night.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            <MagneticButton href="/menu" variant="gold" className="w-full sm:w-auto sm:min-w-[176px]">
              Explore Menu
            </MagneticButton>
            <MagneticButton href="/reservation" variant="outline" className="w-full sm:w-auto sm:min-w-[176px]">
              Reserve Table
            </MagneticButton>
          </div>

        </motion.div>
      </div>

    </section>
  );
}
