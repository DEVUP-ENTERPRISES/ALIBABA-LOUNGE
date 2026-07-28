"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { menuImages } from "@/lib/menu-images";
import { ChefHat, Flame, Sparkles, Users } from "lucide-react";

const features = [
  { icon: ChefHat, label: "On-Site Chefs", desc: "Full culinary team, your venue" },
  { icon: Flame, label: "Live Hookah Stations", desc: "Premium blends, expert hosts" },
  { icon: Users, label: "Any Scale", desc: "Intimate to 500+ guests" },
  { icon: Sparkles, label: "White-Glove Setup", desc: "Full decor & service team" },
];

export function CateringPreviewSection() {
  return (
    <section id="catering" className="relative section-padding bg-[#0c0c0e] overflow-hidden">
      <div className="absolute top-0 right-0 h-[30rem] w-[30rem] rounded-full bg-[#d4af37]/[0.035] blur-[130px] pointer-events-none" />
      <div className="film-grain absolute inset-0" />

      <div className="relative mx-auto max-w-7xl">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: -35 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="group relative aspect-[4/3] overflow-hidden rounded-3xl border border-[#d4af37]/10 lg:aspect-[5/4] transition-all duration-700 hover:border-[#d4af37]/35 hover:shadow-[0_20px_60px_rgba(212,175,55,0.1)]"
          >
            <div className="absolute top-5 left-5 z-10 font-[family-name:var(--font-accent)] text-[8px] tracking-[0.25em] text-[#d4af37]/75 uppercase pointer-events-none">
              CAM · 02 CATERING
            </div>
            <div className="absolute bottom-5 right-5 z-10 font-[family-name:var(--font-accent)] text-[8px] tracking-[0.25em] text-white/35 uppercase pointer-events-none">
              PRIVATE CULINARY
            </div>

            <Image
              src={menuImages.catering}
              alt="Sheesh catering"
              fill
              className="object-cover transition-transform duration-[2s] ease-out group-hover:scale-105"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-[#0c0c0e]/90 via-[#0c0c0e]/20 to-transparent" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(212,175,55,0.14),transparent_55%)]" />
            <div className="absolute inset-4 z-10 border border-white/[0.04] pointer-events-none rounded-2xl group-hover:border-[#d4af37]/12 transition-colors duration-700" />

            {/* Floating badge */}
            <div className="absolute top-5 right-5 z-20 rounded-full border border-[#d4af37]/30 bg-[#050505]/80 backdrop-blur-sm px-3 py-1.5">
              <p className="font-[family-name:var(--font-accent)] text-[8px] tracking-[0.2em] text-[#d4af37] uppercase">
                Available Now
              </p>
            </div>
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: 35 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          >
            <SectionHeading
              align="left"
              eyebrow="Catering"
              title="Luxury Beyond Our Doors"
              subtitle="Private events, corporate galas, and celebrations — we bring the full Sheesh experience to your venue with on-site chefs and hookah stations."
            />

            <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {features.map((feat, i) => (
                <motion.div
                  key={feat.label}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 + i * 0.08, duration: 0.7 }}
                  className="flex items-start gap-3 rounded-xl border border-white/[0.06] bg-[#141418]/60 p-3.5 transition-all duration-500 hover:border-[#d4af37]/25 hover:bg-[#141418]/90"
                >
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[#d4af37]/10">
                    <feat.icon className="size-4 text-[#d4af37]" />
                  </div>
                  <div>
                    <p className="font-[family-name:var(--font-display)] text-sm text-white">{feat.label}</p>
                    <p className="mt-0.5 font-[family-name:var(--font-body)] text-[11px] text-white/45">{feat.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <MagneticButton href="/catering" variant="gold">
                Inquire Now
              </MagneticButton>
              <p className="font-[family-name:var(--font-accent)] text-[9px] tracking-[0.2em] text-white/35 uppercase sm:ml-2">
                Response within 24 hrs
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
