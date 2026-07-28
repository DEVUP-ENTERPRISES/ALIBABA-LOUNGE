"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface AdminStatCardProps {
  label: string;
  value: string | number;
  change?: string;
  accent?: boolean;
  className?: string;
}

export function AdminStatCard({
  label,
  value,
  change,
  accent,
  className,
}: AdminStatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "group glass-luxury relative min-h-[148px] overflow-hidden rounded-2xl bg-[#111114]/72 p-5 shadow-[0_16px_48px_rgba(0,0,0,0.22)] transition-all duration-700 ease-out hover:-translate-y-1 hover:border-[#d4af37]/35 hover:bg-[#151518]/82 hover:shadow-[0_18px_54px_rgba(212,175,55,0.08)] md:p-6",
        accent && "border-[#d4af37]/25 glow-gold bg-[#1a160d]/48",
        className
      )}
    >
      <div className="absolute -right-10 -top-10 size-28 rounded-full bg-[#d4af37]/[0.055] blur-2xl transition-opacity duration-700 group-hover:opacity-100" />
      {/* Inner hairline */}
      <div className="absolute inset-3 border border-white/5 pointer-events-none rounded-xl transition-colors duration-700 group-hover:border-[#d4af37]/15" />
      
      <p className="font-[family-name:var(--font-accent)] text-[10px] tracking-[0.25em] text-white/45 uppercase relative z-10">
        {label}
      </p>
      <p
        className={cn(
          "mt-3 font-[family-name:var(--font-display)] text-3xl md:text-4xl relative z-10",
          accent ? "text-gold-gradient font-semibold" : "text-white"
        )}
      >
        {value}
      </p>
      {change && (
        <p className="mt-2 font-[family-name:var(--font-body)] text-xs text-[#d4af37]/80 relative z-10 flex items-center gap-1.5">
          <span className="inline-block size-1.5 rounded-full bg-[#d4af37] animate-pulse" />
          {change}
        </p>
      )}
    </motion.div>
  );
}
