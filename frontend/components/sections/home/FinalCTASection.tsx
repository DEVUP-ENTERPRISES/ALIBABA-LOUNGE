"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { FloatingParticles } from "@/components/effects/FloatingParticles";
import { menuImages } from "@/lib/menu-images";
import { useReservations } from "@/components/providers/ReservationProvider";
import { Phone } from "lucide-react";

export function FinalCTASection() {
  const { openModal } = useReservations();

  return (
    <section id="reserve" className="relative overflow-hidden py-28 sm:py-36 md:py-44 pb-mobile-cta">
      {/* Background */}
      <div className="absolute inset-0">
        <Image src={menuImages.lounge} alt="" fill priority className="object-cover opacity-20" sizes="100vw" />
        <div className="absolute inset-0 bg-[#050505]/88" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_50%_50%,rgba(212,175,55,0.12),#050505_70%)]" />
        <div className="absolute inset-0 film-grain" />
      </div>

      <FloatingParticles count={14} />

      {/* Rotating ring decoration */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
        <div className="animate-spin-slow h-[600px] w-[600px] rounded-full border border-[#d4af37]/[0.04]" />
        <div className="absolute inset-8 animate-spin-slow h-[calc(100%-4rem)] w-[calc(100%-4rem)] rounded-full border border-[#d4af37]/[0.03]" style={{ animationDirection: "reverse" }} />
      </div>

      <div className="relative mx-auto max-w-3xl px-5 sm:px-8 text-center">
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="font-[family-name:var(--font-accent)] text-[10px] tracking-[0.55em] text-[#d4af37] uppercase"
        >
          Reserve Your Night
        </motion.p>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="mt-5 font-[family-name:var(--font-display)] text-4xl sm:text-5xl md:text-6xl tracking-wide text-white uppercase"
        >
          The Table Awaits
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.25, duration: 0.7 }}
          className="mx-auto mt-6 max-w-md font-[family-name:var(--font-body)] text-sm sm:text-base text-white/50 leading-relaxed"
        >
          Dallas&apos;s premier hookah lounge & dining destination. Book online or call us directly - luxury awaits.
        </motion.p>

        {/* Phone number */}
        <motion.a
          href="tel:+12144077941"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.35, duration: 0.6 }}
          className="inline-flex items-center gap-2 mt-5 font-[family-name:var(--font-display)] text-[#d4af37] hover:text-[#f5e6c8] transition-colors text-lg sm:text-xl"
        >
          <Phone className="size-4" />
          (214) 407-7941
        </motion.a>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.45, duration: 0.7 }}
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4"
        >
          <MagneticButton onClick={openModal} variant="gold" className="w-full sm:w-auto sm:min-w-[180px]">
            Reserve Now
          </MagneticButton>
          <MagneticButton href="/menu" variant="outline" className="w-full sm:w-auto sm:min-w-[150px]">
            View Menu
          </MagneticButton>
          <MagneticButton href="/events" variant="ghost" className="w-full sm:w-auto sm:min-w-[150px]">
            Events
          </MagneticButton>
        </motion.div>

        {/* Trust badges */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6, duration: 0.7 }}
          className="mt-10 flex flex-wrap items-center justify-center gap-4 sm:gap-8"
        >
          {[
            "Private Dining",
            "Hookah Lounge",
            "Live Events",
            "VIP Service",
          ].map((tag) => (
            <span key={tag} className="font-[family-name:var(--font-accent)] text-[8px] sm:text-[9px] tracking-[0.2em] text-white/25 uppercase">
              {tag}
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
