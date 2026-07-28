"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { menuImages } from "@/lib/menu-images";

const plates = [
  { src: menuImages.desi, alt: "Desi cuisine", span: "col-span-2 row-span-2", minH: "min-h-[220px] sm:min-h-[300px]" },
  { src: menuImages.bbq, alt: "BBQ platter" },
  { src: menuImages.biryani, alt: "Biryani" },
  { src: menuImages.burger, alt: "Sheesh burger" },
  { src: menuImages.karahi, alt: "Chicken karahi" },
];

const tags = ["Desi Heritage", "BBQ Masters", "Biryani Royale", "Craft Burgers", "Fusion Karahi"];

export function CuisineSection() {
  return (
    <section className="relative section-padding overflow-hidden bg-[#0c0c0e]">
      <div className="absolute top-0 right-0 h-[28rem] w-[28rem] rounded-full bg-[#d4af37]/[0.04] blur-[120px] pointer-events-none" />
      <div className="film-grain absolute inset-0" />

      <div className="relative mx-auto max-w-7xl">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          {/* Text */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          >
            <SectionHeading
              align="left"
              eyebrow="Elevated Cuisine"
              title="Flavors Worthy of the Night"
              subtitle="From slow-braised nihari to charcoal-kissed BBQ platters — our kitchen fuses Desi heritage with modern luxury plating."
            />

            {/* Tag pills */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, duration: 0.7 }}
              className="mt-8 flex flex-wrap gap-2"
            >
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-[#d4af37]/20 bg-[#d4af37]/8 px-3 py-1 font-[family-name:var(--font-accent)] text-[8px] tracking-[0.2em] text-[#d4af37]/80 uppercase"
                >
                  {tag}
                </span>
              ))}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4, duration: 0.7 }}
              className="mt-6 border-l-2 border-[#d4af37]/30 pl-4"
            >
              <p className="font-[family-name:var(--font-body)] text-sm leading-relaxed text-white/50">
                Every plate is a conversation between tradition and elevation. Fresh ingredients, bold spices, and techniques refined over years in Dallas&apos;s most vibrant kitchen.
              </p>
            </motion.div>

            <MagneticButton href="/menu" variant="gold" className="mt-8">
              Explore Full Menu
            </MagneticButton>
          </motion.div>

          {/* Image grid */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="grid grid-cols-2 gap-3 sm:gap-4"
          >
            {plates.map((plate, i) => (
              <motion.div
                key={plate.alt}
                initial={{ opacity: 0, scale: 0.96 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.15 + i * 0.08, duration: 0.8 }}
                className={`group relative overflow-hidden rounded-2xl border border-white/[0.05] transition-all duration-700 hover:border-[#d4af37]/25 hover:shadow-[0_12px_48px_rgba(212,175,55,0.07)] ${plate.span ?? "aspect-square"} ${plate.minH ?? ""}`}
              >
                <div className="absolute top-3 left-3 z-10 font-[family-name:var(--font-accent)] text-[7px] tracking-[0.2em] text-[#d4af37]/80 uppercase pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  PLATE 0{i + 1}
                </div>

                <Image
                  src={plate.src}
                  alt={plate.alt}
                  fill
                  className="object-cover transition-transform duration-[2s] ease-out group-hover:scale-108"
                  sizes="(max-width: 768px) 50vw, 25vw"
                  priority={i === 0}
                />

                <div className="absolute inset-0 bg-gradient-to-t from-[#0c0c0e]/90 via-[#0c0c0e]/25 to-transparent opacity-80 group-hover:opacity-95 transition-opacity duration-700" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(212,175,55,0.08),transparent_60%)] opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                <div className="absolute inset-3 z-10 border border-white/[0.04] pointer-events-none rounded-xl group-hover:border-[#d4af37]/12 transition-colors duration-700" />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
