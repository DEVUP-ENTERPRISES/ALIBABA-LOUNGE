"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Armchair,
  Ban,
  Calendar,
  Check,
  Loader2,
  Users,
  UserX,
} from "lucide-react";
import type {
  AdminReservation,
  ReservationLifecycle,
  ReservationStatus,
  TableOption,
} from "@/lib/admin/types";
import { StatusChip } from "@/components/admin/ui/StatusChip";
import { AdminModal } from "@/components/admin/ui/AdminModal";
import { useReservations } from "@/components/providers/ReservationProvider";
import { reservationApi } from "@/lib/admin/data-api";
import { cn } from "@/lib/utils";
import { formatUsDate, formatUsDateTime, formatUsTime } from "@/lib/format";

/** Today in Dallas — the venue's day, not the browser's. */
const dallasDay = (offset = 0) =>
  new Intl.DateTimeFormat("en-CA", { timeZone: "America/Chicago" }).format(
    new Date(Date.now() + offset * 864e5)
  );

const DAY_FILTERS = [
  { id: "today", label: "Tonight" },
  { id: "tomorrow", label: "Tomorrow" },
  { id: "all", label: "All upcoming" },
] as const;

const STATE_FILTERS = [
  { id: "live", label: "Needs action" },
  { id: "pending", label: "Requested" },
  { id: "confirmed", label: "Confirmed" },
  { id: "seated", label: "Seated" },
  { id: "all", label: "Everything" },
] as const;

type DayFilter = (typeof DAY_FILTERS)[number]["id"];
type StateFilter = (typeof STATE_FILTERS)[number]["id"];

export default function AdminReservationsPage() {
  const { reservations, updateReservationStatus, refreshReservations } =
    useReservations();
  const [detail, setDetail] = useState<AdminReservation | null>(null);
  const [day, setDay] = useState<DayFilter>("today");
  const [state, setState] = useState<StateFilter>("live");

  const visible = useMemo(() => {
    const today = dallasDay();
    return reservations.filter((r) => {
      if (day === "today" && r.date !== today) return false;
      if (day === "tomorrow" && r.date !== dallasDay(1)) return false;
      if (day === "all" && r.date < today) return false;

      const s = r.rawStatus;
      if (state === "live") return ["pending", "confirmed", "seated"].includes(s);
      if (state !== "all") return s === state;
      return true;
    });
  }, [reservations, day, state]);

  const counts = useMemo(() => {
    const today = dallasDay();
    const tonight = reservations.filter((r) => r.date === today);
    return {
      pending: tonight.filter((r) => r.rawStatus === "pending").length,
      covers: tonight
        .filter((r) => ["confirmed", "seated"].includes(r.rawStatus))
        .reduce((n, r) => n + r.partySize, 0),
      unseated: tonight.filter((r) => r.rawStatus === "confirmed").length,
    };
  }, [reservations]);

  return (
    <div className="space-y-6">
      {/* What the person running the door actually needs at a glance. */}
      <div className="grid gap-3 sm:grid-cols-3">
        <Stat label="Awaiting a table" value={counts.pending} accent={counts.pending > 0} />
        <Stat label="Covers booked tonight" value={counts.covers} />
        <Stat label="Confirmed, not yet in" value={counts.unseated} />
      </div>

      <div className="flex flex-wrap gap-2">
        <Segmented options={DAY_FILTERS} value={day} onChange={setDay} />
        <Segmented options={STATE_FILTERS} value={state} onChange={setState} />
      </div>

      <div className="glass-luxury overflow-x-auto rounded-2xl">
        <table className="w-full min-w-[980px] text-left text-sm">
          <thead>
            <tr className="border-b border-white/[0.06] text-[10px] tracking-[0.2em] text-white/40 uppercase">
              <th className="px-4 py-4">Guest</th>
              <th className="px-4 py-4">Code</th>
              <th className="px-4 py-4">When</th>
              <th className="px-4 py-4">Party</th>
              <th className="px-4 py-4">Table</th>
              <th className="px-4 py-4">Status</th>
              <th className="px-4 py-4 text-right">Next step</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((r) => (
              <tr key={r.id} className="border-b border-white/[0.04] hover:bg-white/[0.02]">
                <td className="px-4 py-3">
                  <button
                    type="button"
                    className="font-medium text-white hover:text-[#d4af37]"
                    onClick={() => setDetail(r)}
                  >
                    {r.guestName}
                  </button>
                  <p className="text-xs text-white/35">{r.phone}</p>
                </td>
                <td className="px-4 py-3">
                  <span className="font-mono text-xs tracking-wider text-white/50">
                    {r.reference}
                  </span>
                </td>
                <td className="px-4 py-3 text-white/60">
                  {formatUsDate(r.date)}
                  <span className="ml-1 text-white/40">{formatUsTime(r.time)}</span>
                </td>
                <td className="px-4 py-3 text-white/60">{r.partySize}</td>
                <td className="px-4 py-3">
                  {r.tableCode ? (
                    <span className="rounded-lg border border-[#d4af37]/30 bg-[#d4af37]/[0.07] px-2 py-1 text-xs text-[#f5e6c8]">
                      {r.tableCode}
                    </span>
                  ) : (
                    <span className="text-xs text-white/25">—</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <LifecycleChip reservation={r} />
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end">
                    <RowAction reservation={r} onOpen={() => setDetail(r)} />
                  </div>
                </td>
              </tr>
            ))}
            {visible.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-14 text-center text-sm text-white/35">
                  Nothing here. Try another day or filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <AdminModal
        open={!!detail}
        onClose={() => setDetail(null)}
        title="Reservation"
        wide
      >
        {detail && (
          <ReservationDetail
            reservation={detail}
            onChanged={(next) => {
              setDetail(next);
              void refreshReservations();
            }}
            updateStatus={updateReservationStatus}
          />
        )}
      </AdminModal>
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: number; accent?: boolean }) {
  return (
    <div
      className={cn(
        "rounded-xl border p-4",
        accent ? "border-[#d4af37]/35 bg-[#d4af37]/[0.06]" : "border-zinc-800 bg-zinc-900/50"
      )}
    >
      <p className="text-[10px] tracking-[0.18em] text-white/40 uppercase">{label}</p>
      <p
        className={cn(
          "mt-1 font-[family-name:var(--font-display)] text-2xl",
          accent ? "text-[#d4af37]" : "text-white"
        )}
      >
        {value}
      </p>
    </div>
  );
}

function Segmented<T extends string>({
  options,
  value,
  onChange,
}: {
  options: readonly { id: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex rounded-xl border border-zinc-800 bg-zinc-900/50 p-1">
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          onClick={() => onChange(o.id)}
          className={cn(
            "rounded-lg px-3 py-1.5 text-xs transition-colors",
            value === o.id ? "bg-[#d4af37] text-[#050505]" : "text-white/50 hover:text-white"
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

/** The legacy chip covers three states; these are the rest. */
function LifecycleChip({ reservation }: { reservation: AdminReservation }) {
  const s = reservation.rawStatus;
  if (s === "seated") {
    return (
      <span className="rounded-full border border-sky-400/30 bg-sky-400/10 px-2.5 py-1 text-[11px] text-sky-300">
        Seated
      </span>
    );
  }
  if (s === "completed") {
    return (
      <span className="rounded-full border border-white/10 px-2.5 py-1 text-[11px] text-white/40">
        Done
      </span>
    );
  }
  if (s === "no-show") {
    return (
      <span className="rounded-full border border-amber-400/30 bg-amber-400/10 px-2.5 py-1 text-[11px] text-amber-300">
        No-show
      </span>
    );
  }
  return <StatusChip status={reservation.status} />;
}

/** One button per row: whatever the booking needs next, and nothing else. */
function RowAction({
  reservation,
  onOpen,
}: {
  reservation: AdminReservation;
  onOpen: () => void;
}) {
  const s = reservation.rawStatus;

  if (s === "pending") {
    return (
      <button
        type="button"
        onClick={onOpen}
        className="rounded-lg border border-[#d4af37]/40 bg-[#d4af37]/[0.08] px-3 py-1.5 text-xs text-[#f5e6c8] transition-colors hover:bg-[#d4af37]/15"
      >
        Assign a table
      </button>
    );
  }
  if (s === "confirmed" || s === "seated") {
    return (
      <button
        type="button"
        onClick={onOpen}
        className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-white/60 transition-colors hover:border-[#d4af37]/40 hover:text-white"
      >
        {s === "confirmed" ? "Seat them" : "Close out"}
      </button>
    );
  }
  return (
    <button
      type="button"
      onClick={onOpen}
      className="rounded-lg px-3 py-1.5 text-xs text-white/30 transition-colors hover:text-white/60"
    >
      View
    </button>
  );
}

/**
 * The working panel for one booking.
 *
 * Approving is deliberately fused with picking a table: an approval the floor
 * cannot act on is just a nicer-looking pending, and it is the table number
 * that the guest is actually told.
 */
function ReservationDetail({
  reservation,
  onChanged,
  updateStatus,
}: {
  reservation: AdminReservation;
  onChanged: (r: AdminReservation) => void;
  updateStatus: (
    id: string,
    status: ReservationStatus | ReservationLifecycle,
    extra?: { table?: string; statusNote?: string }
  ) => Promise<AdminReservation>;
}) {
  const [tables, setTables] = useState<TableOption[] | null>(null);
  const [recommended, setRecommended] = useState<string[]>([]);
  const [picked, setPicked] = useState<string | null>(reservation.table);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState("");

  const open = ["pending", "confirmed", "seated"].includes(reservation.rawStatus);

  useEffect(() => {
    if (!open) return;
    let alive = true;
    reservationApi
      .availability({
        date: reservation.date,
        time: reservation.time,
        guests: reservation.partySize,
        reservation: reservation.id,
      })
      .then((res) => {
        if (!alive) return;
        setTables(res.tables);
        setRecommended(res.recommended);
      })
      .catch(() => alive && setTables([]));
    return () => {
      alive = false;
    };
  }, [reservation.id, reservation.date, reservation.time, reservation.partySize, open]);

  const act = async (
    status: ReservationLifecycle,
    extra: { table?: string; statusNote?: string } = {}
  ) => {
    setBusy(true);
    setError(null);
    try {
      onChanged(await updateStatus(reservation.id, status, extra));
    } catch (err) {
      setError(err instanceof Error ? err.message : "That did not work.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-5 font-[family-name:var(--font-body)] text-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-lg text-white">{reservation.guestName}</p>
          <p className="mt-0.5 font-mono text-xs tracking-wider text-[#d4af37]">
            {reservation.reference}
          </p>
        </div>
        <LifecycleChip reservation={reservation} />
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        <p className="flex items-center gap-2 text-white/60">
          <Calendar className="size-4 shrink-0 text-white/30" />
          {formatUsDateTime(reservation.date, reservation.time)}
        </p>
        <p className="flex items-center gap-2 text-white/60">
          <Users className="size-4 shrink-0 text-white/30" />
          {reservation.partySize} guests
        </p>
      </div>

      <p className="text-white/50">
        {reservation.email} · {reservation.phone}
      </p>

      {reservation.notes && (
        <p className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 text-white/60">
          {reservation.notes}
        </p>
      )}

      {error && (
        <p
          role="alert"
          className="flex items-start gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2.5 text-rose-300"
        >
          <AlertTriangle className="mt-0.5 size-4 shrink-0" />
          {error}
        </p>
      )}

      {open && (
        <div>
          <p className="text-[10px] tracking-[0.18em] text-white/40 uppercase">
            Table {reservation.tableCode && `· currently ${reservation.tableCode}`}
          </p>

          {tables === null ? (
            <p className="mt-3 flex items-center gap-2 text-white/35">
              <Loader2 className="size-3.5 animate-spin" /> Checking the floor…
            </p>
          ) : (
            <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-5">
              {tables.map((t) => {
                const usable = t.fits && t.free;
                const isPicked = picked === t.id;
                const suggested = recommended.includes(t.id);
                return (
                  <button
                    key={t.id}
                    type="button"
                    disabled={!usable}
                    title={
                      !t.fits
                        ? `Seats ${t.seats} — party of ${reservation.partySize}`
                        : t.heldBy
                          ? `Held at ${t.heldBy.time} for ${t.heldBy.reference}`
                          : undefined
                    }
                    onClick={() => setPicked(t.id)}
                    className={cn(
                      "rounded-xl border p-2.5 text-center transition-all",
                      isPicked
                        ? "border-[#d4af37] bg-[#d4af37]/15"
                        : usable
                          ? "border-white/10 hover:border-[#d4af37]/50"
                          : "cursor-not-allowed border-white/[0.05] opacity-35",
                      suggested && !isPicked && "border-[#d4af37]/35"
                    )}
                  >
                    <span className="block text-sm text-white">{t.code}</span>
                    <span className="mt-0.5 block text-[10px] text-white/40">
                      {t.seats} seats
                    </span>
                    {!t.free && (
                      <span className="mt-0.5 block text-[9px] text-amber-400/80">held</span>
                    )}
                    {t.free && !t.fits && (
                      <span className="mt-0.5 block text-[9px] text-white/30">too small</span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      <div className="flex flex-wrap gap-2 pt-1">
        {reservation.rawStatus === "pending" && (
          <button
            type="button"
            disabled={busy || !picked}
            onClick={() => act("confirmed", { table: picked! })}
            className="flex items-center gap-2 rounded-full bg-emerald-600/85 px-5 py-2 text-xs text-white disabled:opacity-40"
          >
            <Check className="size-3.5" />
            {picked ? "Confirm with this table" : "Pick a table first"}
          </button>
        )}

        {reservation.rawStatus === "confirmed" && (
          <>
            <button
              type="button"
              disabled={busy}
              onClick={() => act("seated", picked ? { table: picked } : {})}
              className="flex items-center gap-2 rounded-full bg-sky-600/85 px-5 py-2 text-xs text-white disabled:opacity-40"
            >
              <Armchair className="size-3.5" /> They have arrived
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => act("no-show", { statusNote: note })}
              className="flex items-center gap-2 rounded-full border border-amber-400/30 px-4 py-2 text-xs text-amber-300 disabled:opacity-40"
            >
              <UserX className="size-3.5" /> No-show
            </button>
          </>
        )}

        {reservation.rawStatus === "seated" && (
          <button
            type="button"
            disabled={busy}
            onClick={() => act("completed")}
            className="flex items-center gap-2 rounded-full bg-emerald-600/85 px-5 py-2 text-xs text-white disabled:opacity-40"
          >
            <Check className="size-3.5" /> Close the table
          </button>
        )}

        {open && (
          <button
            type="button"
            disabled={busy}
            onClick={() => act("cancelled", { statusNote: note })}
            className="flex items-center gap-2 rounded-full border border-rose-500/30 px-4 py-2 text-xs text-rose-300 disabled:opacity-40"
          >
            <Ban className="size-3.5" /> Cancel
          </button>
        )}
      </div>

      {open && (
        <div>
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Reason, if you are cancelling — the guest sees this"
            className="w-full rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2.5 text-sm text-white/80 placeholder:text-white/25 focus:border-[#d4af37]/40 focus:outline-none"
          />
        </div>
      )}

      {reservation.statusNote && !open && (
        <p className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 text-white/50">
          {reservation.statusNote}
        </p>
      )}
    </div>
  );
}
