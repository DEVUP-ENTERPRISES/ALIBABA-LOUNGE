"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { LogIn } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { menuImages } from "@/lib/menu-images";
import { inquiryApi } from "@/lib/admin/data-api";
import { useAuth } from "@/contexts/AuthContext";

export function CateringPageContent() {
  const [submitted, setSubmitted] = useState(false);
  const { user, loading } = useAuth();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    await inquiryApi.createCatering({
      name: form.get("name"),
      email: form.get("email"),
      phone: form.get("phone"),
      guests: Number(form.get("guests") || 0) || undefined,
      eventDate: form.get("date"),
      details: form.get("details"),
    });
    setSubmitted(true);
  };

  return (
    <div className="cinematic-backdrop relative min-h-screen overflow-hidden pt-24 pb-20 pb-mobile-cta">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_40%_at_50%_10%,rgba(212,175,55,0.06),transparent_65%)]" />
      <div className="film-grain absolute inset-0" />
      <div className="section-padding relative mx-auto grid max-w-7xl items-start gap-10 lg:grid-cols-2 lg:gap-16">
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1 }}
        >
          <SectionHeading
            align="left"
            eyebrow="Catering"
            title="Events Elevated"
            subtitle="From intimate gatherings to grand celebrations - our culinary team and lounge specialists craft bespoke Sheesh experiences at your venue."
          />
          <div className="cinematic-frame group relative mt-10 aspect-[4/3] overflow-hidden rounded-3xl transition-all duration-700 hover:border-[#d4af37]/30 hover:shadow-[0_16px_50px_rgba(212,175,55,0.1)]">
            <div className="absolute top-5 left-5 z-10 font-[family-name:var(--font-accent)] text-[8px] tracking-[0.25em] text-[#d4af37]/75 uppercase pointer-events-none">
              CAM / 02 CATERING
            </div>
            <Image
              src={menuImages.catering}
              alt="Sheesh catering"
              fill
              className="object-cover image-cinematic transition-transform duration-[2s] group-hover:scale-105"
              sizes="50vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#050505]/90 via-[#050505]/20 to-transparent" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(212,175,55,0.1),transparent_55%)]" />
            <div className="absolute inset-4 z-10 border border-white/[0.04] rounded-2xl pointer-events-none group-hover:border-[#d4af37]/12 transition-colors duration-700" />
          </div>
          <ul className="mt-8 space-y-3 font-[family-name:var(--font-body)] text-sm text-white/55">
            <li>- Full-service catering & premium hookah stations</li>
            <li>- Custom menus & dietary accommodations</li>
            <li>- On-site chefs and dedicated event hosts</li>
            <li>- Corporate, wedding, and private celebrations</li>
          </ul>
          <p className="mt-6 font-[family-name:var(--font-body)] text-sm text-white/40">
            Questions? Call <span className="text-[#d4af37]">(214) 407-7941</span>
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="cinematic-frame glass-luxury glow-gold luxury-shadow rounded-3xl p-6 sm:p-8 md:p-10"
        >
          {!loading && !user ? (
            <div className="py-16 text-center">
              <LogIn className="mx-auto h-10 w-10 text-[#d4af37]/50" />
              <p className="mt-5 font-[family-name:var(--font-display)] text-2xl text-white">
                Sign In to Inquire
              </p>
              <p className="mt-3 font-[family-name:var(--font-body)] text-sm text-white/50">
                Please sign in or create an account to submit a catering inquiry.
              </p>
              <div className="mt-8 flex flex-col items-center gap-3">
                <Link
                  href="/login?next=/catering"
                  className="rounded-full bg-[#d4af37] px-8 py-3 font-[family-name:var(--font-accent)] text-xs tracking-[0.2em] text-[#050505] uppercase transition-shadow hover:shadow-[0_0_24px_rgba(212,175,55,0.35)]"
                >
                  Sign In
                </Link>
                <Link href="/signup?next=/catering" className="font-[family-name:var(--font-body)] text-sm text-white/40 hover:text-white transition-colors">
                  Create account
                </Link>
              </div>
            </div>
          ) : submitted ? (
            <div className="py-16 text-center">
              <p className="font-[family-name:var(--font-display)] text-3xl text-gold-gradient">
                Thank You
              </p>
              <p className="mt-4 font-[family-name:var(--font-body)] text-white/55">
                Our events team will reach out within 48 hours.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="border-b border-white/[0.06] pb-5">
                <p className="font-[family-name:var(--font-accent)] text-[9px] tracking-[0.28em] text-[#d4af37]/80 uppercase">
                  Private Event Concierge
                </p>
                <h2 className="mt-2 font-[family-name:var(--font-display)] text-2xl text-white">
                  Plan a Bespoke Event
                </h2>
              </div>
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" name="name" required placeholder="Your name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    required
                    placeholder="you@email.com"
                  />
                </div>
              </div>
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="(214) 407-7941"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="guests">Guest Count</Label>
                  <Input id="guests" name="guests" type="number" min={1} placeholder="50" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">Event Date</Label>
                <Input id="date" name="date" type="date" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="details">Event Details</Label>
                <Textarea
                  id="details"
                  name="details"
                  required
                  placeholder="Tell us about your vision, venue, and preferences..."
                  rows={5}
                />
              </div>
              <MagneticButton type="submit" variant="gold" className="w-full sm:w-auto">
                Submit Inquiry
              </MagneticButton>
            </form>
          ) }
        </motion.div>
      </div>
    </div>
  );
}
