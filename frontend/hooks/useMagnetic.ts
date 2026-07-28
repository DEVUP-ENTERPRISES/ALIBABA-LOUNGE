"use client";

import { useEffect, useRef } from "react";
import { applyMagnetic } from "@/utils/magnetic";

export function useMagnetic<T extends HTMLElement>(strength = 0.35) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    return applyMagnetic(el, strength);
  }, [strength]);

  return ref;
}
