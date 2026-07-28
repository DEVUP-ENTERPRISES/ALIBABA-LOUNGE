"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

function Label({ className, ...props }: React.ComponentProps<"label">) {
  return (
    <label
      data-slot="label"
      className={cn(
        "font-[family-name:var(--font-accent)] text-xs tracking-[0.2em] text-[#d4af37]/70 uppercase",
        className
      )}
      {...props}
    />
  );
}

export { Label };
