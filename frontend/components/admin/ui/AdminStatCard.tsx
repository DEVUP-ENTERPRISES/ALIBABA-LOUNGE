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
        "relative min-h-[148px] overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 shadow-sm transition-all duration-300 ease-out hover:border-zinc-700 hover:bg-zinc-800/50 md:p-6",
        accent && "border-blue-900/50 bg-blue-950/20",
        className
      )}
    >
      <p className="text-[11px] font-medium tracking-wider text-zinc-500 uppercase relative z-10">
        {label}
      </p>
      <p
        className={cn(
          "mt-3 text-3xl font-bold tracking-tight md:text-4xl relative z-10",
          accent ? "text-blue-400" : "text-zinc-100"
        )}
      >
        {value}
      </p>
      {change && (
        <p className="mt-2 text-xs font-medium text-zinc-400 relative z-10 flex items-center gap-1.5">
          {accent ? (
             <span className="inline-block size-1.5 rounded-full bg-blue-500 animate-pulse" />
          ) : (
             <span className="inline-block size-1.5 rounded-full bg-zinc-600" />
          )}
          {change}
        </p>
      )}
    </motion.div>
  );
}
