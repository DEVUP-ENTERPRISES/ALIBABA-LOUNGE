"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { menuImages } from "@/lib/menu-images";

const highlights = [
  {
    title: "Immersive Atmosphere",
    desc: "Layered amber lighting, ambient soundscapes, and velvet shadows - an otherworldly lounge experience after dark.",
    image: menuImages.lounge,
    icon: "*",
  },
  {
    title: "Nightlife Energy",
    desc: "Live performances, curated playlists, and VIP corners for unforgettable Dallas evenings.",
    image: menuImages.events,
    icon: "o",
  },
  {
    title: "Hospitality First",
    desc: "White-glove service meets warm Texas hospitality - every guest treated like royalty.",
    image: menuImages.experience,
    icon: "+",
  },
];

export function ExperienceSection() {
  return (
    <section id="experience" className="relative section-padding bg-[#050505] overflow-hidden">
      <div className="bg-luxury-radial absolute inset-0" />
      <div className="film-grain absolute inset-0 opacity-80" />

      <div className="relative mx-auto max-w-7xl">
        <SectionHeading
          eyebrow="The Experience"
          title="A World Beyond Dining"
          subtitle="Step into a cinematic realm where every detail - from the first bite to the last cloud - is orchestrated for luxury."
        />

        <div className="mt-10 sm:mt-12 grid items-stretch gap-6 lg:grid-cols-2">
          {/* Large left image */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="group relative aspect-[4/5] overflow-hidden rounded-3xl border border-[#d4af37]/10 hover:border-[#d4af37]/30 hover:shadow-[0_12px_60px_rgba(212,175,55,0.1)] transition-all duration-700 lg:aspect-auto lg:min-h-[520px]"
          >
            <div className="absolute top-5 left-5 z-10 font-[family-name:var(--font-accent)] text-[8px] tracking-[0.25em] text-[#d4af37]/70 uppercase pointer-events-none">
              CAM · 01 AMBIENT
            </div>
            <div className="absolute bottom-5 right-5 z-10 font-[family-name:var(--font-accent)] text-[8px] tracking-[0.2em] text-white/30 uppercase pointer-events-none">
              SHEESH ARCHIVES
            </div>

            <Image
              src={menuImages.lounge}
              alt="Sheesh lounge interior"
              fill
              priority
              className="object-cover transition-transform duration-[2s] ease-out group-hover:scale-[1.07]"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/15 to-transparent" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(212,175,55,0.1),transparent_60%)]" />
            <div className="absolute inset-4 z-10 border border-white/[0.04] rounded-2xl pointer-events-none" />
          </motion.div>

          {/* Right highlights */}
          <div className="flex flex-col gap-4 sm:gap-5">
            {highlights.map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                className="group glass-luxury flex gap-4 overflow-hidden rounded-2xl p-4 transition-all duration-700 hover:-translate-y-1 hover:border-[#d4af37]/30 hover:shadow-[0_12px_48px_rgba(212,175,55,0.08)]"
              >
                <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl border border-white/[0.06]">
                  <Image
                    src={item.image}
                    alt=""
                    fill
                    className="object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-110"
                    sizes="96px"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                </div>

                <div className="flex flex-col justify-center py-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-[#d4af37] text-xs">{item.icon}</span>
                    <h3 className="font-[family-name:var(--font-display)] text-lg sm:text-xl text-white group-hover:text-gold-gradient transition-colors duration-500 leading-tight">
                      {item.title}
                    </h3>
                  </div>
                  <p className="font-[family-name:var(--font-body)] text-xs sm:text-sm leading-relaxed text-white/55">
                    {item.desc}
                  </p>
                </div>
              </motion.div>
            ))}

            {/* Stats bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="grid grid-cols-3 gap-3 mt-1"
            >
              {[
                { value: "7PM-3AM", label: "Hours" },
                { value: "VIP", label: "Seating" },
                { value: "Live", label: "Events" },
              ].map((s) => (
                <div key={s.label} className="glass-luxury rounded-xl p-3 text-center">
                  <p className="font-[family-name:var(--font-display)] text-base sm:text-lg text-[#d4af37]">{s.value}</p>
                  <p className="font-[family-name:var(--font-accent)] text-[8px] tracking-[0.18em] text-white/35 uppercase mt-0.5">{s.label}</p>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
