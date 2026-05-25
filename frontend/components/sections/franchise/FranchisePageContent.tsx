"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { GlassCard } from "@/components/ui/GlassCard";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { inquiryApi } from "@/lib/admin/data-api";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import { LogIn } from "lucide-react";

const stats = [
  { value: "$2.4M", label: "Avg Unit Revenue" },
  { value: "18 mo", label: "ROI Timeline" },
  { value: "94%", label: "Guest Satisfaction" },
  { value: "3", label: "Markets Opening 2026" },
];

const pillars = [
  {
    title: "Proven Concept",
    desc: "A dual-revenue model combining elevated dining and premium hookah lounge culture.",
  },
  {
    title: "Operational Playbook",
    desc: "Training, sourcing, marketing, and design systems built for scalable luxury.",
  },
  {
    title: "Brand Power",
    desc: "Cinematic identity and event programming that commands attention in any market.",
  },
];

export function FranchisePageContent() {
  const [submitted, setSubmitted] = useState(false);
  const { user, loading } = useAuth();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    await inquiryApi.createFranchise({
      name: `${form.get("firstName")} ${form.get("lastName")}`.trim(),
      email: form.get("email"),
      market: form.get("market"),
      investment:
        form.get("investment") ||
        e.currentTarget.querySelector<HTMLInputElement>("#capital")?.value,
      background:
        form.get("background") ||
        e.currentTarget.querySelector<HTMLTextAreaElement>("#experience")?.value,
    });
    setSubmitted(true);
  };

  return (
    <div className="cinematic-backdrop relative min-h-screen overflow-hidden pt-24 pb-20 pb-mobile-cta">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_40%_at_50%_0%,rgba(212,175,55,0.07),transparent_65%)]" />
      <div className="film-grain absolute inset-0" />
      <section className="section-padding relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(212,175,55,0.1),transparent_50%)]" />
        <div className="relative mx-auto max-w-7xl">
          <SectionHeading
            eyebrow="Franchise"
            title="Build the Empire"
            subtitle="Partner with Sheesh and bring Dallas's most coveted lounge experience to new cities."
          />
          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, i) => (
              <GlassCard key={stat.label} delay={i * 0.08} className="text-center">
                <p className="font-[family-name:var(--font-display)] text-3xl text-gold-gradient md:text-4xl">
                  {stat.value}
                </p>
                <p className="mt-2 font-[family-name:var(--font-accent)] text-[9px] tracking-[0.2em] text-white/45 uppercase">
                  {stat.label}
                </p>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      <section className="section-padding bg-[#0c0c0e]/85">
        <div className="mx-auto grid max-w-7xl gap-6 md:grid-cols-3">
          {pillars.map((p, i) => (
            <GlassCard key={p.title} delay={i * 0.1}>
              <h3 className="font-[family-name:var(--font-display)] text-xl text-white">
                {p.title}
              </h3>
              <p className="mt-3 font-[family-name:var(--font-body)] text-sm text-white/50">
                {p.desc}
              </p>
            </GlassCard>
          ))}
        </div>
      </section>

      <section className="section-padding">
        <div className="mx-auto max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="cinematic-frame glass-luxury glow-gold rounded-3xl p-6 sm:p-8 md:p-12"
          >
            <h3 className="text-center font-[family-name:var(--font-display)] text-3xl text-white">
              Application
            </h3>
            <p className="mt-2 text-center font-[family-name:var(--font-body)] text-sm text-white/50">
              Tell us about your background and target market.
            </p>
            {!loading && !user ? (
              <div className="mt-10 py-8 text-center">
                <LogIn className="mx-auto h-10 w-10 text-[#d4af37]/50" />
                <p className="mt-4 font-[family-name:var(--font-display)] text-xl text-white">
                  Sign In to Apply
                </p>
                <p className="mt-3 font-[family-name:var(--font-body)] text-sm text-white/50">
                  Please sign in to submit a franchise application.
                </p>
                <div className="mt-6 flex flex-col items-center gap-3">
                  <Link href="/login?next=/franchise" className="rounded-full bg-[#d4af37] px-8 py-3 font-[family-name:var(--font-accent)] text-xs tracking-[0.2em] text-[#050505] uppercase transition-shadow hover:shadow-[0_0_24px_rgba(212,175,55,0.35)]">
                    Sign In
                  </Link>
                  <Link href="/signup?next=/franchise" className="font-[family-name:var(--font-body)] text-sm text-white/40 hover:text-white">
                    Create account
                  </Link>
                </div>
              </div>
            ) : submitted ? (
              <p className="mt-10 text-center font-[family-name:var(--font-body)] text-[#d4af37]">
                Application received. Our team will be in touch.
              </p>
            ) : (
              <form onSubmit={handleSubmit} className="mt-10 space-y-6">
                <div className="rounded-2xl border border-[#d4af37]/12 bg-[#d4af37]/[0.04] p-4">
                  <p className="font-[family-name:var(--font-body)] text-sm leading-relaxed text-white/50">
                    Applications are reviewed by the Sheesh leadership team for market fit, hospitality background, and capital readiness.
                  </p>
                </div>
                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="fname">First Name</Label>
                    <Input id="fname" name="firstName" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lname">Last Name</Label>
                    <Input id="lname" name="lastName" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="femail">Email</Label>
                  <Input id="femail" name="email" type="email" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="market">Target Market</Label>
                  <Input id="market" name="market" placeholder="City, State" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="capital">Investment Range</Label>
                  <Input id="capital" placeholder="$500K — $1M+" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="experience">Background</Label>
                  <Textarea
                    id="experience"
                    rows={4}
                    placeholder="Hospitality, business, or franchise experience..."
                    required
                  />
                </div>
                <div className="text-center">
                  <MagneticButton type="submit" variant="gold">
                    Submit Application
                  </MagneticButton>
                </div>
              </form>
            )}
          </motion.div>
        </div>
      </section>
    </div>
  );
}
