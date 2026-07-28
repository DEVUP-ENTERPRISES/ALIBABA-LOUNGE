import { cn } from "@/lib/utils";
import type { MenuTag } from "@/lib/menu/types";

const tagStyles: Record<MenuTag, string> = {
  Popular: "border-amber-400/40 bg-amber-400/10 text-amber-200",
  "Staff Pick": "border-[#d4af37]/50 bg-[#d4af37]/15 text-[#f5e6c8]",
  "Customer Fav": "border-rose-300/30 bg-rose-300/10 text-rose-100",
  New: "border-emerald-400/30 bg-emerald-400/10 text-emerald-200",
};

export function MenuTagBadge({ tag }: { tag: MenuTag }) {
  return (
    <span
      className={cn(
        "rounded-full border px-2.5 py-0.5 font-[family-name:var(--font-accent)] text-[8px] tracking-[0.12em] uppercase",
        tagStyles[tag]
      )}
    >
      {tag}
    </span>
  );
}
