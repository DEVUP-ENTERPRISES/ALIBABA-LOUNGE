import { cn } from "@/lib/utils";

const styles: Record<string, string> = {
  Pending: "bg-amber-500/15 text-amber-200 border-amber-400/30",
  Approved: "bg-emerald-500/15 text-emerald-200 border-emerald-400/30",
  Rejected: "bg-rose-500/15 text-rose-200 border-rose-400/30",
  New: "bg-sky-500/15 text-sky-200 border-sky-400/30",
  "In Review": "bg-[#d4af37]/15 text-[#f5e6c8] border-[#d4af37]/30",
  Contacted: "bg-violet-500/15 text-violet-200 border-violet-400/30",
  Closed: "bg-white/5 text-white/40 border-white/10",
  Draft: "bg-white/5 text-white/50 border-white/10",
  Published: "bg-emerald-500/15 text-emerald-200 border-emerald-400/30",
  Archived: "bg-white/5 text-white/35 border-white/10",
};

export function StatusChip({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full border px-2.5 py-0.5 font-[family-name:var(--font-accent)] text-[9px] tracking-[0.12em] uppercase",
        styles[status] ?? styles.Closed
      )}
    >
      {status}
    </span>
  );
}
