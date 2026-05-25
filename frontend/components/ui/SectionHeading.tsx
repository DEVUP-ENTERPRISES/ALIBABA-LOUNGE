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
        <div
          className={cn(
            "mb-4 flex items-center gap-3",
            align === "center" ? "justify-center" : "justify-start"
          )}
        >
          <span className="hidden h-px w-8 bg-[#d4af37]/45 sm:block" />
          <p className="font-[family-name:var(--font-accent)] text-[10px] tracking-[0.32em] text-[#d4af37]/80 uppercase sm:text-xs">
            {eyebrow}
          </p>
          <span className="hidden h-px w-8 bg-[#d4af37]/45 sm:block" />
        </div>
      )}
      <h2 className="font-[family-name:var(--font-display)] text-4xl leading-[0.98] tracking-normal text-white sm:text-5xl lg:text-6xl">
        <span className="text-gold-gradient">{title}</span>
      </h2>
      {subtitle && (
        <p
          className={cn(
            "mt-5 max-w-2xl font-[family-name:var(--font-body)] text-sm leading-relaxed text-white/58 sm:text-base md:text-lg",
            align === "center" && "mx-auto"
          )}
        >
          {subtitle}
        </p>
      )}
      <div className={cn("mt-7 h-px w-24 line-gold", align === "center" && "mx-auto")} />
    </motion.div>
  );
}
