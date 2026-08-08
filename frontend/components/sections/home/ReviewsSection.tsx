"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Star, Quote } from "lucide-react";
import { reviewApi } from "@/lib/admin/data-api";
import type { AdminReview } from "@/lib/admin/types";

const DEFAULT_REVIEWS: AdminReview[] = [
  {
    id: "r1",
    quote: "Alibaba is Dallas's premier hookah lounge — the food, the clouds, the vibe. Nothing else comes close.",
    author: "Amir K.",
    role: "Regular Guest",
    stars: 5,
    initial: "AK",
    isFeatured: true,
    isApproved: true,
  },
  {
    id: "r2",
    quote: "Voice of Alibaba had production quality you'd expect at a major venue. Season 1 can't come soon enough.",
    author: "Sarah M.",
    role: "Event Attendee",
    stars: 5,
    initial: "SM",
    isFeatured: true,
    isApproved: true,
  },
  {
    id: "r3",
    quote: "The BBQ platter and Alibaba Mix are why we keep coming back. True luxury hospitality in Dallas.",
    author: "James T.",
    role: "Dallas Foodie",
    stars: 5,
    initial: "JT",
    isFeatured: true,
    isApproved: true,
  },
  {
    id: "r4",
    quote: "Brought my whole crew for a birthday — flawless service, fire hookah, and the vibes were immaculate.",
    author: "Layla R.",
    role: "Private Event Host",
    stars: 5,
    initial: "LR",
    isFeatured: true,
    isApproved: true,
  },
  {
    id: "r5",
    quote: "The Mediterranean spread is unlike anything else in the city. Feels like you're dining in another world.",
    author: "Marcus D.",
    role: "Food Critic",
    stars: 5,
    initial: "MD",
    isFeatured: true,
    isApproved: true,
  },
  {
    id: "r6",
    quote: "Premium shisha experience — smooth clouds, exotic flavors, beautiful space. A must-visit in Dallas.",
    author: "Priya N.",
    role: "Hookah Enthusiast",
    stars: 5,
    initial: "PN",
    isFeatured: true,
    isApproved: true,
  },
];

function ReviewCard({ review }: { review: AdminReview }) {
  return (
    <div className="relative w-[300px] sm:w-[340px] shrink-0 rounded-2xl border border-white/[0.07] bg-[#0c0c0e]/70 backdrop-blur-md p-6 mx-3 card-lift group overflow-hidden">
      {/* Gold corner accent */}
      <div
        className="absolute top-0 left-0 h-12 w-12 opacity-40"
        style={{ background: "linear-gradient(135deg, rgba(212,175,55,0.3), transparent 60%)" }}
      />

      {/* Quote icon */}
      <div className="absolute top-5 right-5 opacity-10">
        <Quote className="size-8 text-[#d4af37]" />
      </div>

      {/* Stars */}
      <div className="flex gap-0.5 mb-4">
        {Array.from({ length: review.stars }).map((_, i) => (
          <Star key={i} className="size-3 fill-[#d4af37] text-[#d4af37]" />
        ))}
      </div>

      {/* Quote text */}
      <p className="font-[family-name:var(--font-body)] text-sm leading-relaxed text-white/65 italic mb-5">
        &ldquo;{review.quote}&rdquo;
      </p>

      {/* Author */}
      <div className="flex items-center gap-3 border-t border-white/[0.06] pt-4">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#8b6914] to-[#d4af37] text-[#050505] font-[family-name:var(--font-display)] text-xs font-medium">
          {review.initial || review.author.slice(0, 2).toUpperCase()}
        </div>
        <div>
          <p className="font-[family-name:var(--font-display)] text-sm text-[#d4af37]">{review.author}</p>
          <p className="font-[family-name:var(--font-accent)] text-[8px] tracking-[0.18em] text-white/35 uppercase">{review.role}</p>
        </div>
      </div>

      {/* Hover glow */}
      <div
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
        style={{ boxShadow: "inset 0 0 0 1px rgba(212,175,55,0.15)" }}
      />
    </div>
  );
}

export function ReviewsSection() {
  const [reviews, setReviews] = useState<AdminReview[]>(DEFAULT_REVIEWS);

  useEffect(() => {
    let mounted = true;
    reviewApi
      .list("?featured=true&approved=true")
      .then((items) => {
        if (mounted && items && items.length > 0) setReviews(items);
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  const doubled = [...reviews, ...reviews];

  return (
    <section id="reviews" className="relative overflow-hidden bg-[#080808] py-20 sm:py-28">
      {/* Background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_100%,rgba(212,175,55,0.04),transparent)]" />

      <div className="mx-auto max-w-7xl px-5 sm:px-8 mb-12 sm:mb-16">
        <SectionHeading
          eyebrow="Guest Reviews"
          title="Whispers of Excellence"
          subtitle="Thousands of guests, one shared sentiment — Alibaba is unlike anything else."
        />
      </div>

      {/* Marquee row 1 */}
      <div className="relative overflow-hidden mask-fade-sides pause-on-hover mb-5">
        <div className="flex animate-marquee w-max">
          {doubled.map((r, i) => (
            <ReviewCard key={`${r.id}-${i}`} review={r} />
          ))}
        </div>
      </div>

      {/* Marquee row 2 — reverse */}
      <div className="relative overflow-hidden mask-fade-sides pause-on-hover">
        <div className="flex animate-marquee-fast w-max" style={{ animationDirection: "reverse" }}>
          {doubled.map((r, i) => (
            <ReviewCard key={`rev-${r.id}-${i}`} review={r} />
          ))}
        </div>
      </div>

      {/* Bottom CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="mt-14 sm:mt-18 flex flex-col items-center gap-3 px-5"
      >
        <div className="flex items-center gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} className="size-4 fill-[#d4af37] text-[#d4af37]" />
          ))}
        </div>
        <p className="font-[family-name:var(--font-body)] text-sm text-white/45 text-center">
          Rated 4.9 / 5 across hundreds of verified guest reviews
        </p>
      </motion.div>
    </section>
  );
}
