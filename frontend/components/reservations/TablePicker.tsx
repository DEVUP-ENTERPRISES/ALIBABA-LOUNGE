"use client";

import { useEffect, useState } from "react";
import { Check, Loader2, Lock, Users } from "lucide-react";
import { reservationApi } from "@/lib/admin/data-api";
import type { TableOption } from "@/lib/admin/types";
import { cn } from "@/lib/utils";

const SECTION_LABELS: Record<string, string> = {
  "main-dining": "Main Room",
  backyard: "Backyard",
  patio: "Patio",
  bar: "Bar",
};

interface TablePickerProps {
  date: string;
  time: string;
  guests: number;
  value: string | null;
  onChange: (tableId: string, table: TableOption) => void;
  /** Exclude this booking's own hold, so moving does not clash with itself. */
  exceptReservation?: string;
  compact?: boolean;
}

/**
 * The live floor, for a guest to choose from.
 *
 * Guests pick their own seat rather than being assigned one, so this has to
 * be honest about what is gone: a table someone else holds for that hour is
 * shown locked, not hidden, because a guest who cannot see the busy tables
 * cannot tell a full night from a small venue.
 *
 * Availability depends on the party size as much as the time — a table that
 * seats four is not an option for six — so it reloads whenever any of the
 * three change.
 */
export function TablePicker({
  date,
  time,
  guests,
  value,
  onChange,
  exceptReservation,
  compact,
}: TablePickerProps) {
  const [tables, setTables] = useState<TableOption[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!date || !time) {
      setTables(null);
      return;
    }

    let alive = true;
    setTables(null);
    setError(null);

    reservationApi
      .openAvailability({ date, time, guests, reservation: exceptReservation })
      .then((res) => {
        if (alive) setTables(res.tables);
      })
      .catch((err) => {
        if (alive) {
          setError(err instanceof Error ? err.message : "Could not load the floor.");
          setTables([]);
        }
      });

    return () => {
      alive = false;
    };
  }, [date, time, guests, exceptReservation]);

  if (!date || !time) {
    return (
      <p className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-6 text-center text-xs text-white/35">
        Pick a date and time to see which tables are free.
      </p>
    );
  }

  if (tables === null) {
    return (
      <p className="flex items-center justify-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-6 text-xs text-white/40">
        <Loader2 className="size-3.5 animate-spin" /> Checking the floor…
      </p>
    );
  }

  if (error) {
    return (
      <p className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-center text-xs text-rose-300">
        {error}
      </p>
    );
  }

  const usable = tables.filter((t) => t.fits && t.free);

  // Grouped by room, because "M14" means nothing to someone who has not been
  // before but "Backyard" does.
  const sections = tables.reduce<Record<string, TableOption[]>>((acc, t) => {
    (acc[t.section] ||= []).push(t);
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[10px] tracking-[0.2em] text-white/40 uppercase">Pick your table</p>
        <p className={cn("text-[11px]", usable.length ? "text-white/40" : "text-amber-300/80")}>
          {usable.length
            ? `${usable.length} free for ${guests}`
            : "Nothing free — try another time"}
        </p>
      </div>

      {Object.entries(sections).map(([section, list]) => (
        <div key={section}>
          <p className="mb-2 text-[10px] tracking-[0.16em] text-white/30 uppercase">
            {SECTION_LABELS[section] ?? section}
          </p>
          <div
            className={cn(
              "grid gap-2",
              compact ? "grid-cols-4 sm:grid-cols-5" : "grid-cols-3 sm:grid-cols-5"
            )}
          >
            {list.map((t) => {
              const open = t.fits && t.free;
              const picked = value === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  disabled={!open}
                  aria-pressed={picked}
                  title={
                    !t.free
                      ? "Already booked for this time"
                      : !t.fits
                        ? `Seats ${t.seats}, your party is ${guests}`
                        : `${t.code} — seats ${t.seats}`
                  }
                  onClick={() => onChange(t.id, t)}
                  className={cn(
                    "relative rounded-xl border p-2.5 text-center transition-all",
                    picked
                      ? "border-[#d4af37] bg-[#d4af37]/15"
                      : open
                        ? "border-[#d4af37]/25 bg-[#d4af37]/[0.04] hover:border-[#d4af37]/70"
                        : "cursor-not-allowed border-white/[0.05] bg-white/[0.01] opacity-40"
                  )}
                >
                  {picked && (
                    <span className="absolute -top-1.5 -right-1.5 flex size-5 items-center justify-center rounded-full bg-[#d4af37] text-[#050505]">
                      <Check className="size-3" />
                    </span>
                  )}
                  <span className="block font-[family-name:var(--font-display)] text-base text-white">
                    {t.code}
                  </span>
                  <span className="mt-0.5 flex items-center justify-center gap-1 text-[10px] text-white/40">
                    <Users className="size-2.5" />
                    {t.seats}
                  </span>
                  {!t.free ? (
                    <span className="mt-0.5 flex items-center justify-center gap-1 text-[9px] tracking-[0.1em] text-amber-400/80 uppercase">
                      <Lock className="size-2.5" /> Booked
                    </span>
                  ) : !t.fits ? (
                    <span className="mt-0.5 block text-[9px] tracking-[0.1em] text-white/30 uppercase">
                      Too small
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      <p className="text-[11px] text-white/30">
        Tables are held for two hours. Anything marked booked is taken for the time
        you chose — pick a different hour and the floor changes.
      </p>
    </div>
  );
}
