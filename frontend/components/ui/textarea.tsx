import * as React from "react";
import { cn } from "@/lib/utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex min-h-28 w-full rounded-xl border border-[#d4af37]/20 bg-white/[0.03] px-4 py-3 font-[family-name:var(--font-body)] text-sm text-white transition-all outline-none placeholder:text-white/30 focus:border-[#d4af37]/50 focus:bg-white/[0.05] focus:ring-2 focus:ring-[#d4af37]/20 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
}

export { Textarea };
