"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { menuImages } from "@/lib/menu-images";
import { Calendar, Mic } from "lucide-react";

export function EventsPreviewSection() {
  return (
    <section id="events" className="relative section-padding overflow-hidden bg-[#050505]">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_left,rgba(212,175,55,0.07),transparent_55%)]" />

      <div className="relative mx-auto max-w-7xl">
        <SectionHeading eyebrow="Upcoming Events" title="Nights You Won't Forget" />

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="group relative mt-10 sm:mt-12 overflow-hidden rounded-3xl border border-[#d4af37]/15 hover:border-[#d4af37]/35 hover:shadow-[0_16px_50px_rgba(212,175,55,0.1)] transition-all duration-700"
        >
          {/* Image */}
          <div className="relative aspect-[16/9] sm:aspect-[21/9] min-h-[260px] sm:min-h-[340px] overflow-hidden">
            <div className="absolute top-4 left-4 z-20 font-[family-name:var(--font-accent)] text-[8px] tracking-[0.25em] text-[#d4af37]/70 uppercase pointer-events-none">
              CAM · 03 STAGE
            </div>
            <div className="absolute bottom-4 right-4 z-20 font-[family-name:var(--font-accent)] text-[8px] tracking-[0.2em] text-white/30 uppercase pointer-events-none">
              LIVE BROADCAST
            </div>

            <Image
              src={menuImages.events}
              alt="Voice of Sheesh"
              fill
              className="object-cover transition-transform duration-[2s] ease-out group-hover:scale-105"
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-[#050505]/75 to-[#050505]/10 group-hover:opacity-95 transition-opacity duration-700" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_left,rgba(212,175,55,0.12),transparent_55%)]" />
            <div className="absolute inset-0 film-grain" />
            <div className="absolute inset-4 z-10 border border-white/[0.04] rounded-2xl pointer-events-none group-hover:border-[#d4af37]/12 transition-colors duration-700" />
          </div>

          {/* Overlay content */}
          <div className="absolute inset-0 flex items-center px-6 sm:px-10 md:px-14">
            <div className="max-w-xl">
              <div className="flex items-center gap-2 mb-4">
                <span className="flex items-center gap-1.5 rounded-full border border-[#d4af37]/30 bg-[#d4af37]/10 px-3 py-1 font-[family-name:var(--font-accent)] text-[8px] tracking-[0.2em] text-[#d4af37] uppercase">
                  <Mic className="size-2.5" />
                  Featured Event
                </span>
              </div>

              <h3 className="font-[family-name:var(--font-display)] text-2xl sm:text-4xl md:text-5xl leading-tight tracking-wide text-white uppercase">
                Voice of Sheesh<br />
                <span className="text-gold-gradient">Season 1</span>
              </h3>

              <div className="flex items-center gap-2 mt-3 mb-4">
                <Calendar className="size-3.5 text-[#d4af37]/60" />
                <span className="font-[family-name:var(--font-accent)] text-[9px] tracking-[0.25em] text-[#d4af37]/70 uppercase">
                  Coming Soon · Dallas, TX
                </span>
              </div>

              <p className="hidden sm:block font-[family-name:var(--font-body)] text-sm leading-relaxed text-white/55 max-w-md">
                A cinematic showcase of Dallas talent. Live vocals, luxury production, and the signature Sheesh atmosphere.
              </p>

              <MagneticButton href="/events" variant="gold" className="mt-6 sm:mt-8">
                View All Events
              </MagneticButton>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
