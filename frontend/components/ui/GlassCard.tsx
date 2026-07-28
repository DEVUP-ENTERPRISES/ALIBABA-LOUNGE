"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  hover?: boolean;
}

export function GlassCard({
  children,
  className,
  delay = 0,
  hover = true,
}: GlassCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
      whileHover={
        hover
          ? {
              y: -6,
              boxShadow: "0 0 40px rgba(212, 175, 55, 0.15)",
            }
          : undefined
      }
      className={cn(
        "glass-luxury relative overflow-hidden rounded-2xl p-6 transition-colors duration-500",
        hover && "group hover:border-[#d4af37]/30",
        className
      )}
    >
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#d4af37]/[0.03] to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}
