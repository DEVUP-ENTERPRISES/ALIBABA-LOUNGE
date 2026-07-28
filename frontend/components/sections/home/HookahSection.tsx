"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { MenuTagBadge } from "@/components/ui/MenuTagBadge";
import { menuImages } from "@/lib/menu-images";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { SmokeOverlay } from "@/components/effects/SmokeOverlay";

const blends = [
  { name: "Sheesh Mix", note: "House Signature · Floral · Citrus", image: menuImages.hookahLounge, tag: "Staff Pick" as const },
  { name: "Desert Mirage", note: "Oud · Amber · Saffron", image: menuImages.hookahPremium, tag: "Popular" as const },
  { name: "Gully Boy", note: "Bold · Spiced · Smooth Finish", image: menuImages.hookah, tag: "Customer Fav" as const },
];

export function HookahSection() {
  return (
    <section id="hookah" className="relative overflow-hidden bg-[#050505] section-padding">
      <SmokeOverlay className="opacity-50" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(212,175,55,0.06),transparent_65%)]" />
      <div className="film-grain absolute inset-0" />

      <div className="relative mx-auto max-w-7xl">
        <SectionHeading
          eyebrow="Premium Hookah"
          title="Clouds of Opulence"
          subtitle="House mixes, premium hookahs, expert heat management — hookah elevated to an art form."
        />

        <div className="mt-10 sm:mt-12 grid gap-5 sm:gap-6 md:grid-cols-3">
          {blends.map((blend, i) => (
            <motion.div
              key={blend.name}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="group relative overflow-hidden rounded-2xl border border-[#d4af37]/10 bg-[#0c0c0e]/40 card-lift"
            >
              <div className="relative aspect-[3/4] sm:aspect-[3/4] overflow-hidden">
                {/* Tag */}
                <div className="absolute top-4 left-4 z-20">
                  <MenuTagBadge tag={blend.tag} />
                </div>

                {/* Index */}
                <div className="absolute top-4 right-4 z-20 font-[family-name:var(--font-accent)] text-[8px] tracking-[0.25em] text-white/30 uppercase">
                  BLEND {String(i + 1).padStart(2, "0")}
                </div>

                <Image
                  src={blend.image}
                  alt={blend.name}
                  fill
                  className="object-cover transition-transform duration-[2s] ease-out group-hover:scale-108"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/50 to-transparent transition-opacity duration-700 group-hover:opacity-95" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(212,175,55,0.08),transparent_60%)] opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                {/* Inner hairline */}
                <div className="absolute inset-3 z-10 border border-white/[0.04] rounded-xl pointer-events-none group-hover:border-[#d4af37]/12 transition-colors duration-700" />

                <div className="absolute right-0 bottom-0 left-0 z-10 p-5 sm:p-6">
                  <h3 className="font-[family-name:var(--font-display)] text-2xl text-white group-hover:text-gold-gradient transition-colors duration-500">
                    {blend.name}
                  </h3>
                  <p className="mt-2 font-[family-name:var(--font-accent)] text-[9px] tracking-[0.28em] text-[#d4af37]/70 uppercase">
                    {blend.note}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-10 sm:mt-12 text-center">
          <MagneticButton href="/menu" variant="outline">View Hookah Menu</MagneticButton>
        </div>
      </div>
    </section>
  );
}
