"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: "left" | "center";
  className?: string;
}

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "center",
  className,
}: SectionHeadingProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        align === "center" ? "text-center" : "text-left",
        className
      )}
    >
      {eyebrow && (
        <p className="font-[family-name:var(--font-accent)] mb-4 text-xs tracking-[0.4em] text-[#d4af37]/80 uppercase">
          {eyebrow}
        </p>
      )}
      <h2 className="font-[family-name:var(--font-display)] text-4xl leading-tight tracking-wide text-white md:text-5xl lg:text-6xl">
        <span className="text-gold-gradient">{title}</span>
      </h2>
      {subtitle && (
        <p className="mx-auto mt-6 max-w-2xl font-[family-name:var(--font-body)] text-base leading-relaxed text-white/55 md:text-lg">
          {subtitle}
        </p>
      )}
      <div className="mx-auto mt-8 h-px w-24 line-gold" />
    </motion.div>
  );
}
