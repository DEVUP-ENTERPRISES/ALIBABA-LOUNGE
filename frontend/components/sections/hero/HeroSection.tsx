"use client";

import { memo, useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { homeHash } from "@/lib/navigation";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { ChevronDown } from "lucide-react";

const HERO_PLAYLIST = [
  "/videos/hero.mp4",
  "/videos/burger.mp4",
  "/videos/grill.mp4",
  "/videos/pizza.mp4",
] as const;

const LETTERS = "SHEESH".split("");

const HeroBackgroundVideo = memo(function HeroBackgroundVideo() {
  const timerRef = useRef<number | null>(null);
  const [videoIndex, setVideoIndex] = useState(0);
  const [ready, setReady] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  const showVideo = useCallback(() => { setReady(true); setVisible(true); }, []);

  const playNext = useCallback(() => {
    setVisible(false);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => {
      setReady(false);
      setVideoIndex((i) => (i + 1) % HERO_PLAYLIST.length);
    }, 500);
  }, []);

  return (
    <video
      src={HERO_PLAYLIST[videoIndex]}
      autoPlay muted loop={false} playsInline preload="metadata"
      onCanPlay={showVideo}
      onEnded={playNext}
      className={`absolute inset-0 z-10 h-full w-full object-cover transition-opacity duration-700 ease-in-out ${ready && visible ? "opacity-60" : "opacity-0"}`}
      style={{ filter: "contrast(1.06) saturate(1.15) brightness(0.88)" }}
    />
  );
});

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.35 } },
};

const letterVariants = {
  hidden: { opacity: 0, y: 60, rotateX: -50, filter: "blur(8px)" },
  show: {
    opacity: 1, y: 0, rotateX: 0, filter: "blur(0px)",
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as any },
  },
};

export function HeroSection() {
  return (
    <section className="relative flex min-h-[92dvh] w-full flex-col items-center justify-center overflow-hidden bg-[#050505] sm:min-h-[100dvh]">
      {/* Video bg */}
      <div className="absolute inset-0 z-0 bg-black">
        <HeroBackgroundVideo />
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

        {/* SHEESH letters */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="flex"
          style={{ perspective: "800px" }}
          aria-label="SHEESH"
        >
          {LETTERS.map((l, i) => (
            <motion.span
              key={i}
              variants={letterVariants}
              className="inline-block select-none font-[family-name:var(--font-display)] text-6xl font-light uppercase leading-none tracking-normal text-white sm:text-8xl md:text-9xl lg:text-[10rem] xl:text-[11.5rem]"
              style={{
                textShadow: "0 0 60px rgba(212,175,55,0.12), 0 8px 40px rgba(0,0,0,0.6)",
              }}
              whileHover={{
                color: "#d4af37",
                textShadow: "0 0 30px rgba(212,175,55,0.7), 0 0 80px rgba(212,175,55,0.35)",
                transition: { duration: 0.18 },
              }}
            >
              {l}
            </motion.span>
          ))}
        </motion.div>

        {/* Eatery & Lounge */}
        <motion.p
          initial={{ opacity: 0, letterSpacing: "0.15em" }}
          animate={{ opacity: 1, letterSpacing: "0.55em" }}
          transition={{ delay: 0.9, duration: 1.3, ease: [0.16, 1, 0.3, 1] }}
          className="mt-2 mb-7 font-[family-name:var(--font-accent)] text-[10px] tracking-[0.26em] text-[#f5e6c8]/75 uppercase sm:mt-4 sm:mb-10 sm:text-sm sm:tracking-[0.42em] md:mb-12 md:text-base"
        >
          Eatery & Lounge
        </motion.p>

        {/* Desc + CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1, duration: 0.8 }}
          className="flex flex-col items-center gap-6 sm:gap-8 max-w-lg text-center"
        >
          <p className="font-[family-name:var(--font-body)] text-sm sm:text-[15px] text-white/70 leading-relaxed tracking-wide px-2">
            Dallas&apos;s premier culinary destination - gourmet Mediterranean-desi cuisine, signature private shisha blends, and absolute sensory luxury.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            <MagneticButton href="/menu" variant="gold" className="w-full sm:w-auto sm:min-w-[176px]">
              Explore Menu
            </MagneticButton>
            <MagneticButton href="/reservation" variant="outline" className="w-full sm:w-auto sm:min-w-[176px]">
              Reserve Table
            </MagneticButton>
          </div>

          {/* Quick stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.45, duration: 0.7 }}
            className="flex items-center gap-8 sm:gap-12 pt-1"
          >
            {[
              { value: "50K+", label: "Guests" },
              { value: "100+", label: "Hookah Blends" },
              { value: "4.9", label: "Rated" },
            ].map((s, i) => (
              <div key={i} className="flex flex-col items-center gap-0.5">
                <span className="font-[family-name:var(--font-display)] text-base sm:text-xl text-[#d4af37]">{s.value}</span>
                <span className="font-[family-name:var(--font-accent)] text-[8px] sm:text-[9px] tracking-[0.18em] text-white/30 uppercase">{s.label}</span>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.9, duration: 0.8 }}
        className="absolute bottom-6 sm:bottom-10 left-1/2 z-30 -translate-x-1/2"
      >
        <Link href={homeHash("experience")} scroll={false} className="flex flex-col items-center gap-1.5 group">
          <span className="font-[family-name:var(--font-accent)] text-[8px] tracking-[0.4em] text-[#d4af37]/45 uppercase group-hover:text-[#d4af37]/75 transition-colors">
            Scroll
          </span>
          <motion.div animate={{ y: [0, 5, 0] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}>
            <ChevronDown className="size-4 text-[#d4af37]/45 group-hover:text-[#d4af37]/80 transition-colors" />
          </motion.div>
        </Link>
      </motion.div>
    </section>
  );
}
