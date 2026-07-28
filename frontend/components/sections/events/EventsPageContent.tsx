"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { CountdownTimer } from "@/components/sections/events/CountdownTimer";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { menuImages } from "@/lib/menu-images";
import { SmokeOverlay } from "@/components/effects/SmokeOverlay";
import { eventApi } from "@/lib/admin/data-api";
import type { AdminEvent } from "@/lib/admin/types";
import { resolveImageUrl } from "@/lib/image-url";
import { Calendar, MapPin, Clock, Mic } from "lucide-react";

export function EventsPageContent() {
  const [events, setEvents] = useState<AdminEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    eventApi
      .list("?status=Published&limit=20")
      .then((items) => mounted && setEvents(items))
      .catch(() => mounted && setEvents([]))
      .finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, []);

  return (
    <div className="relative min-h-screen">
      {/* Hero */}
      <section className="relative flex min-h-[90vh] items-center overflow-hidden pt-24">
        <div className="absolute inset-0">
          <Image
            src={menuImages.events}
            alt="Voice of Sheesh"
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-[#050505]/60 via-[#050505]/85 to-[#050505]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(212,175,55,0.12),transparent_60%)]" />
        <SmokeOverlay />
        <div className="absolute inset-0 film-grain" />

        {/* Corner annotations */}
        <div className="absolute top-8 left-6 sm:left-10 font-[family-name:var(--font-accent)] text-[8px] tracking-[0.25em] text-[#d4af37]/60 uppercase pointer-events-none">
          CAM · 03 STAGE
        </div>
        <div className="absolute top-8 right-6 sm:right-10 font-[family-name:var(--font-accent)] text-[8px] tracking-[0.25em] text-white/30 uppercase pointer-events-none">
          LIVE BROADCAST
        </div>

        <div className="relative mx-auto w-full max-w-5xl px-5 sm:px-8 py-24 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 rounded-full border border-[#d4af37]/30 bg-[#d4af37]/10 px-4 py-1.5 mb-6"
          >
            <Mic className="size-3 text-[#d4af37]" />
            <span className="font-[family-name:var(--font-accent)] text-[8px] tracking-[0.2em] text-[#d4af37] uppercase">
              Featured Event
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-[family-name:var(--font-display)] text-4xl sm:text-6xl lg:text-7xl leading-tight tracking-wide text-white uppercase"
          >
            Voice of Sheesh
            <span className="mt-2 block text-gold-gradient">Season 1 · Coming Soon</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25 }}
            className="mx-auto mt-6 max-w-2xl font-[family-name:var(--font-body)] text-sm sm:text-base text-white/55 leading-relaxed"
          >
            A groundbreaking vocal competition set in our cinematic lounge. Dallas talent. Luxury production. Unforgettable nights.
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap items-center justify-center gap-4 mt-5"
          >
            <div className="flex items-center gap-1.5">
              <MapPin className="size-3.5 text-[#d4af37]/60" />
              <span className="font-[family-name:var(--font-accent)] text-[9px] tracking-[0.2em] text-white/50 uppercase">Dallas, TX</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar className="size-3.5 text-[#d4af37]/60" />
              <span className="font-[family-name:var(--font-accent)] text-[9px] tracking-[0.2em] text-white/50 uppercase">Season 1 · 2026</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-12"
          >
            <CountdownTimer />
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.55 }}
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3"
          >
            <MagneticButton href="tel:+12144077941" variant="gold">
              Call to Register
            </MagneticButton>
            <MagneticButton href="#events-calendar" variant="outline">
              View All Events
            </MagneticButton>
          </motion.div>
        </div>
      </section>

      {/* Events calendar */}
      <section id="events-calendar" className="section-padding relative bg-[#0c0c0e] overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(212,175,55,0.05),transparent_55%)]" />
        <div className="film-grain absolute inset-0" />

        <div className="relative mx-auto max-w-7xl">
          <SectionHeading
            eyebrow="Calendar"
            title="Recurring Experiences"
            subtitle="Beyond the main stage — discover the rhythm of Sheesh throughout the week."
          />

          {loading && (
            <div className="mt-16 flex justify-center">
              <div className="flex gap-1.5">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="size-2 rounded-full bg-[#d4af37]/50 animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>
            </div>
          )}

          {!loading && events.length > 0 && (
            <div className="mt-12 grid gap-5 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
              {events.map((event, i) => (
                <motion.div
                  key={event.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.8 }}
                  className="group overflow-hidden rounded-2xl border border-[#d4af37]/10 bg-[#0a0a0c] transition-all duration-700 hover:border-[#d4af37]/30 hover:shadow-[0_12px_40px_rgba(212,175,55,0.08)] card-lift"
                >
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <Image
                      src={resolveImageUrl(event.image)}
                      alt={event.title}
                      fill
                      className="object-cover transition-transform duration-[2s] group-hover:scale-108"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0c] via-transparent to-transparent" />
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(212,175,55,0.08),transparent_60%)] opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                    {/* Status badge */}
                    <div className="absolute top-4 left-4 rounded-full border border-[#d4af37]/30 bg-[#050505]/70 backdrop-blur-sm px-3 py-1">
                      <p className="font-[family-name:var(--font-accent)] text-[8px] tracking-[0.2em] text-[#d4af37] uppercase">
                        {event.status}
                      </p>
                    </div>
                  </div>

                  <div className="p-5 sm:p-6">
                    <div className="flex flex-wrap items-center gap-3 mb-3">
                      {event.date && (
                        <div className="flex items-center gap-1.5">
                          <Calendar className="size-3 text-[#d4af37]/60" />
                          <span className="font-[family-name:var(--font-accent)] text-[8px] tracking-[0.2em] text-[#d4af37]/70 uppercase">
                            {event.date}
                          </span>
                        </div>
                      )}
                      {event.time && (
                        <div className="flex items-center gap-1.5">
                          <Clock className="size-3 text-white/30" />
                          <span className="font-[family-name:var(--font-accent)] text-[8px] tracking-[0.2em] text-white/40 uppercase">
                            {event.time}
                          </span>
                        </div>
                      )}
                    </div>
                    <h3 className="font-[family-name:var(--font-display)] text-xl sm:text-2xl text-white group-hover:text-gold-gradient transition-colors duration-500">
                      {event.title}
                    </h3>
                    <p className="mt-2 font-[family-name:var(--font-body)] text-sm text-white/45 line-clamp-2">
                      {event.description || event.location}
                    </p>
                    {event.location && (
                      <div className="mt-3 flex items-center gap-1.5">
                        <MapPin className="size-3 text-[#d4af37]/40" />
                        <span className="font-[family-name:var(--font-body)] text-xs text-white/35">{event.location}</span>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {!loading && events.length === 0 && (
            <div className="mt-16 text-center">
              <p className="font-[family-name:var(--font-body)] text-white/35">
                No events published yet — check back soon.
              </p>
            </div>
          )}

          <div className="mt-14 sm:mt-16 text-center">
            <MagneticButton href="/" variant="outline">
              Back to Home
            </MagneticButton>
          </div>
        </div>
      </section>
    </div>
  );
}
