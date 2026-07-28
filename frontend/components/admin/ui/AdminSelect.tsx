"use client";

import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SelectOption {
  value: string;
  label: string;
}

interface AdminSelectProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  id?: string;
}

export function AdminSelect({
  label,
  value,
  onChange,
  options,
  placeholder = "Select...",
  disabled,
  className,
  id,
}: AdminSelectProps) {
  const selectId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <label
          htmlFor={selectId}
          className="font-[family-name:var(--font-accent)] text-xs tracking-[0.2em] text-[#d4af37]/70 uppercase"
        >
          {label}
        </label>
      )}
      <div className="relative">
        <select
          id={selectId}
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          className={cn(
            "h-12 w-full appearance-none rounded-xl border border-[#d4af37]/20 bg-white/[0.03] px-4 pr-10 font-[family-name:var(--font-body)] text-sm text-white transition-all outline-none",
            "focus:border-[#d4af37]/50 focus:bg-white/[0.05] focus:ring-2 focus:ring-[#d4af37]/20",
            "disabled:cursor-not-allowed disabled:opacity-50",
            !value && "text-white/35"
          )}
        >
          <option value="" disabled className="bg-[#0c0c0e] text-white/50">
            {placeholder}
          </option>
          {options.map((opt) => (
            <option
              key={opt.value}
              value={opt.value}
              className="bg-[#0c0c0e] text-white"
            >
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown
          className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-[#d4af37]/60"
          aria-hidden
        />
      </div>
    </div>
  );
}
