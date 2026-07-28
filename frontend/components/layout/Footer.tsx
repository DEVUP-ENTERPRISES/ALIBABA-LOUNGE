"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Phone, MapPin, Clock } from "lucide-react";
import { useReservations } from "@/components/providers/ReservationProvider";

const footerNav = [
  { href: "/menu", label: "Our Menu" },
  { href: "/events", label: "Events" },
  { href: "/catering", label: "Catering" },
  { href: "/franchise", label: "Franchise" },
  { href: "/gallery", label: "Gallery" },
  { href: "/reservation", label: "Reserve" },
];

const hours = [
  { days: "Sun – Thu", time: "11 AM – 2 AM" },
  { days: "Fri – Sat", time: "11 AM – 3 AM" },
];

export function Footer() {
  const { openModal } = useReservations();

  return (
    <footer className="relative overflow-hidden border-t border-[#d4af37]/15 bg-[#050505]">
      {/* Decorations */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(212,175,55,0.08),transparent_55%)]" />
      <div className="absolute inset-0 film-grain opacity-60" />
      <div className="absolute top-0 left-1/2 h-px w-2/3 -translate-x-1/2 bg-gradient-to-r from-transparent via-[#d4af37]/50 to-transparent" />

      <div className="relative mx-auto max-w-7xl px-5 sm:px-8 pt-14 sm:pt-20 pb-8">
        <div className="grid gap-10 sm:gap-12 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-1"
          >
            <h3 className="font-[family-name:var(--font-display)] text-xl sm:text-2xl tracking-[0.12em] text-white uppercase">
              Sheesh Eatery<br className="hidden sm:block" /> & Lounge
            </h3>
            <p className="mt-4 font-[family-name:var(--font-body)] text-sm leading-relaxed text-white/45 max-w-xs">
              Dallas&apos;s premier hookah lounge & dining destination. Where luxury meets flavor.
            </p>

            {/* Social */}
            <div className="mt-6 flex items-center gap-3">
              <a
                href="https://instagram.com/Sheeshtx"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram @Sheeshtx"
                className="group flex size-10 items-center justify-center rounded-full border border-[#d4af37]/25 transition-all duration-500 hover:border-[#d4af37] hover:bg-[#d4af37]/10 hover:shadow-[0_0_24px_rgba(212,175,55,0.25)]"
              >
                <svg className="size-4 text-[#d4af37]/80 transition-colors group-hover:text-[#d4af37]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
                    <rect x="2" y="2" width="20" height="20" rx="5" />
                    <circle cx="12" cy="12" r="4" />
                    <circle cx="18" cy="6" r="1" fill="currentColor" stroke="none" />
                  </svg>
              </a>
              <p className="font-[family-name:var(--font-accent)] text-[10px] tracking-[0.2em] text-white/30 uppercase">
                @Sheeshtx
              </p>
            </div>

            {/* Reserve CTA */}
            <button
              type="button"
              onClick={openModal}
              className="mt-6 rounded-full border border-[#d4af37]/30 bg-[#d4af37]/8 px-5 py-2 font-[family-name:var(--font-accent)] text-[9px] tracking-[0.2em] text-[#d4af37] uppercase transition-all duration-300 hover:bg-[#d4af37]/15 hover:border-[#d4af37]/60"
            >
              Reserve a Table
            </button>
          </motion.div>

          {/* Navigate */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.08 }}
          >
            <p className="font-[family-name:var(--font-accent)] mb-5 text-[10px] tracking-[0.35em] text-[#d4af37]/80 uppercase">
              Navigate
            </p>
            <ul className="space-y-3">
              {footerNav.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    scroll={true}
                    className="group relative inline-block font-[family-name:var(--font-body)] text-sm text-white/45 transition-colors hover:text-[#f5e6c8]"
                  >
                    {link.label}
                    <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-[#d4af37] transition-all duration-500 group-hover:w-full" />
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Contact & Location */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.16 }}
          >
            <p className="font-[family-name:var(--font-accent)] mb-5 text-[10px] tracking-[0.35em] text-[#d4af37]/80 uppercase">
              Contact
            </p>
            <div className="space-y-3">
              <a
                href="tel:+12144077941"
                className="flex items-center gap-2.5 group"
              >
                <Phone className="size-4 text-[#d4af37]/50 shrink-0" />
                <span className="font-[family-name:var(--font-display)] text-lg text-[#d4af37] group-hover:text-[#f5e6c8] transition-colors">
                  (214) 407-7941
                </span>
              </a>
              <div className="flex items-start gap-2.5">
                <MapPin className="size-4 text-[#d4af37]/50 shrink-0 mt-0.5" />
                <span className="font-[family-name:var(--font-body)] text-sm text-white/50">
                  Dallas, TX
                </span>
              </div>
            </div>
          </motion.div>

          {/* Hours */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.24 }}
          >
            <p className="font-[family-name:var(--font-accent)] mb-5 text-[10px] tracking-[0.35em] text-[#d4af37]/80 uppercase">
              Hours
            </p>
            <div className="space-y-3">
              {hours.map((h) => (
                <div key={h.days} className="flex items-start gap-2.5">
                  <Clock className="size-4 text-[#d4af37]/50 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-[family-name:var(--font-accent)] text-[9px] tracking-[0.15em] text-white/35 uppercase">{h.days}</p>
                    <p className="mt-0.5 font-[family-name:var(--font-body)] text-sm text-white/55">{h.time}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Live badge */}
            <div className="mt-5 flex items-center gap-2">
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-[#d4af37] opacity-60" />
                <span className="relative inline-flex size-2 rounded-full bg-[#d4af37]" />
              </span>
              <p className="font-[family-name:var(--font-accent)] text-[9px] tracking-[0.2em] text-[#d4af37]/70 uppercase">
                Open Now · Dallas, TX
              </p>
            </div>
          </motion.div>
        </div>

        {/* Bottom bar */}
        <div className="mt-14 sm:mt-16 flex flex-col items-center justify-between gap-4 border-t border-white/[0.06] pt-8 sm:flex-row">
          <p className="font-[family-name:var(--font-body)] text-xs text-white/30 text-center sm:text-left">
            © 2026 Sheesh Eatery & Lounge. All rights reserved.
          </p>
          <p className="font-[family-name:var(--font-accent)] text-[10px] tracking-[0.28em] text-white/25 uppercase text-center">
            Designed with passion in Dallas, TX
          </p>
        </div>
      </div>
    </footer>
  );
}
