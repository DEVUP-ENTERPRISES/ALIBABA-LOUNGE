"use client";

import Image from "next/image";
import { CalendarCheck, Clock, Users, Phone, Star } from "lucide-react";
import { motion } from "framer-motion";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { useReservations } from "@/components/providers/ReservationProvider";
import { menuImages } from "@/lib/menu-images";
import { FloatingParticles } from "@/components/effects/FloatingParticles";

const highlights = [
  {
    icon: CalendarCheck,
    title: "Priority Seating",
    text: "Request your preferred date and our team will confirm within hours.",
  },
  {
    icon: Users,
    title: "Groups Welcome",
    text: "Intimate tables, birthday celebrations, and late-night lounge gatherings.",
  },
  {
    icon: Clock,
    title: "Fast Follow-Up",
    text: "Requests go straight to our team — expect a response the same day.",
  },
];

const hours = [
  { days: "Sun – Thu", time: "11 AM – 2 AM" },
  { days: "Fri – Sat", time: "11 AM – 3 AM" },
];

export function ReservationPageContent() {
  const { openModal } = useReservations();

  return (
    <div className="relative min-h-screen overflow-hidden pt-24 pb-20 pb-mobile-cta">
      <FloatingParticles count={10} />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_20%,rgba(212,175,55,0.07),transparent_65%)]" />
      <div className="film-grain absolute inset-0" />

      {/* Hero image strip */}
      <div className="relative mx-auto mb-14 max-w-7xl px-5 sm:px-8">
        <div className="relative aspect-[2/1] min-h-[160px] sm:min-h-[220px] overflow-hidden rounded-2xl sm:rounded-3xl border border-[#d4af37]/10">
          <Image
            src={menuImages.lounge}
            alt="Sheesh lounge"
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#050505]/90 via-[#050505]/60 to-[#050505]/20" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_left,rgba(212,175,55,0.12),transparent_55%)]" />
          <div className="absolute inset-0 film-grain" />

          <div className="absolute inset-0 flex items-center px-6 sm:px-12">
            <div>
              <p className="font-[family-name:var(--font-accent)] text-[9px] sm:text-[10px] tracking-[0.4em] text-[#d4af37] uppercase mb-3">
                Dallas&apos;s Premier Lounge
              </p>
              <h1 className="font-[family-name:var(--font-display)] text-3xl sm:text-5xl text-white uppercase leading-tight">
                Reserve the<br />
                <span className="text-gold-gradient">Night</span>
              </h1>
            </div>
          </div>

          <div className="absolute top-4 right-4 font-[family-name:var(--font-accent)] text-[8px] tracking-[0.25em] text-white/30 uppercase pointer-events-none">
            CAM · 01 AMBIENT
          </div>
        </div>
      </div>

      <div className="relative mx-auto max-w-6xl px-5 sm:px-8">
        <SectionHeading
          eyebrow="Reservations"
          title="Your Table Awaits"
          subtitle="Tell us when you're coming, how many guests, and any details that help us make the evening feel effortless."
        />

        {/* Highlight cards */}
        <div className="mt-12 grid gap-4 sm:gap-5 md:grid-cols-3">
          {highlights.map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.8 }}
              className="glass-luxury rounded-2xl p-6 text-center card-lift"
            >
              <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full border border-[#d4af37]/20 bg-[#d4af37]/8">
                <item.icon className="size-5 text-[#d4af37]" />
              </div>
              <h2 className="font-[family-name:var(--font-display)] text-xl text-white">{item.title}</h2>
              <p className="mt-3 font-[family-name:var(--font-body)] text-sm leading-relaxed text-white/50">{item.text}</p>
            </motion.div>
          ))}
        </div>

        {/* Main CTA card */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.9 }}
          className="mx-auto mt-10 max-w-xl rounded-3xl border border-[#d4af37]/15 bg-[#0c0c0e]/80 backdrop-blur-sm p-8 sm:p-10 text-center shadow-[0_0_50px_rgba(212,175,55,0.08)]"
        >
          <div className="flex justify-center gap-0.5 mb-5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="size-4 fill-[#d4af37] text-[#d4af37]" />
            ))}
          </div>
          <p className="font-[family-name:var(--font-display)] text-2xl sm:text-3xl text-white">
            Ready when you are.
          </p>
          <p className="mt-3 font-[family-name:var(--font-body)] text-sm leading-relaxed text-white/45">
            Open the reservation form — your request goes directly to our team for fast confirmation.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <MagneticButton onClick={openModal} variant="gold" className="w-full sm:w-auto">
              Request Reservation
            </MagneticButton>
            <MagneticButton href="tel:+12144077941" variant="outline" className="w-full sm:w-auto">
              <Phone className="size-3.5 mr-1.5" />
              (214) 407-7941
            </MagneticButton>
          </div>
        </motion.div>

        {/* Hours */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.45, duration: 0.8 }}
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-12"
        >
          {hours.map((h) => (
            <div key={h.days} className="text-center">
              <p className="font-[family-name:var(--font-accent)] text-[9px] tracking-[0.25em] text-[#d4af37]/60 uppercase mb-1">
                {h.days}
              </p>
              <p className="font-[family-name:var(--font-display)] text-lg text-white">{h.time}</p>
            </div>
          ))}
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.55, duration: 0.6 }}
          className="mt-6 text-center font-[family-name:var(--font-body)] text-sm text-white/30"
        >
          Located in Dallas, TX · Sheesh Eatery & Lounge
        </motion.p>
      </div>
    </div>
  );
}
