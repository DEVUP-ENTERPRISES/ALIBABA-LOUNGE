"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { menuImages } from "@/lib/menu-images";
import { TrendingUp, Globe2, Handshake, BarChart3 } from "lucide-react";

const stats = [
  { value: "12+", label: "Years Vision", icon: TrendingUp },
  { value: "50K+", label: "Guests Served", icon: Globe2 },
  { value: "4", label: "Revenue Streams", icon: BarChart3 },
];

const perks = [
  "Proven brand & playbook",
  "Full training & support",
  "Exclusive territory rights",
  "Marketing & digital assets",
];

export function FranchisePreviewSection() {
  return (
    <section id="franchise" className="relative section-padding overflow-hidden bg-[#050505]">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(212,175,55,0.07),transparent_50%)]" />
      <div className="film-grain absolute inset-0" />

      <div className="relative mx-auto max-w-7xl">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: -35 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          >
            <SectionHeading
              align="left"
              eyebrow="Franchise"
              title="Own the Night"
              subtitle="Partner with Dallas's premier hookah lounge & dining brand. Scale the Sheesh experience across markets with full support."
            />

            {/* Stats */}
            <div className="mt-8 grid grid-cols-3 gap-3">
              {stats.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.15 + i * 0.08, duration: 0.7 }}
                  className="glass-luxury rounded-2xl p-4 text-center card-lift"
                >
                  <stat.icon className="mx-auto size-4 text-[#d4af37]/60 mb-2" />
                  <p className="font-[family-name:var(--font-display)] text-2xl sm:text-3xl text-gold-gradient">
                    {stat.value}
                  </p>
                  <p className="mt-1.5 font-[family-name:var(--font-accent)] text-[8px] tracking-[0.18em] text-white/40 uppercase">
                    {stat.label}
                  </p>
                </motion.div>
              ))}
            </div>

            {/* Perks list */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.35, duration: 0.7 }}
              className="mt-6 grid grid-cols-1 gap-2 sm:grid-cols-2"
            >
              {perks.map((perk) => (
                <div key={perk} className="flex items-center gap-2.5">
                  <Handshake className="size-3.5 shrink-0 text-[#d4af37]/70" />
                  <p className="font-[family-name:var(--font-body)] text-sm text-white/60">{perk}</p>
                </div>
              ))}
            </motion.div>

            <MagneticButton href="/franchise" variant="gold" className="mt-8">
              Franchise Opportunities
            </MagneticButton>
          </motion.div>

          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: 35 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="group relative aspect-[4/5] overflow-hidden rounded-3xl border border-[#d4af37]/10 transition-all duration-700 hover:border-[#d4af37]/35 hover:shadow-[0_20px_60px_rgba(212,175,55,0.1)]"
          >
            <div className="absolute top-5 left-5 z-10 font-[family-name:var(--font-accent)] text-[8px] tracking-[0.25em] text-[#d4af37]/75 uppercase pointer-events-none">
              CAM · 04 GLOBAL SCALE
            </div>
            <div className="absolute bottom-5 right-5 z-10 font-[family-name:var(--font-accent)] text-[8px] tracking-[0.25em] text-white/35 uppercase pointer-events-none">
              BRAND GROWTH
            </div>

            <Image
              src={menuImages.lounge}
              alt="Sheesh franchise"
              fill
              className="object-cover transition-transform duration-[2s] ease-out group-hover:scale-105"
              sizes="50vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/30 to-transparent" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(212,175,55,0.12),transparent_55%)]" />
            <div className="absolute inset-4 z-10 border border-white/[0.04] pointer-events-none rounded-2xl group-hover:border-[#d4af37]/12 transition-colors duration-700" />

            {/* Floating stat */}
            <div className="absolute bottom-8 left-8 z-20 glass-luxury rounded-2xl p-4">
              <p className="font-[family-name:var(--font-display)] text-2xl text-gold-gradient">$0</p>
              <p className="mt-1 font-[family-name:var(--font-accent)] text-[8px] tracking-[0.18em] text-white/50 uppercase">Franchise Fee · Limited Time</p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
