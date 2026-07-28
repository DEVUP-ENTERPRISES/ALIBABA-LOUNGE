"use client";

import { useState } from "react";
import type { AdminReservation, ReservationStatus } from "@/lib/admin/types";
import { StatusChip } from "@/components/admin/ui/StatusChip";
import { AdminModal } from "@/components/admin/ui/AdminModal";
import { useReservations } from "@/components/providers/ReservationProvider";
import { cn } from "@/lib/utils";

export default function AdminReservationsPage() {
  const { reservations, updateReservationStatus } = useReservations();
  const [detail, setDetail] = useState<AdminReservation | null>(null);

  const updateStatus = (id: string, status: ReservationStatus) => {
    updateReservationStatus(id, status);
    if (detail?.id === id) setDetail({ ...detail, status });
  };

  return (
    <div className="space-y-6">
      <div className="glass-luxury overflow-x-auto rounded-2xl">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead>
            <tr className="border-b border-white/[0.06] text-[10px] tracking-[0.2em] text-white/40 uppercase">
              <th className="px-4 py-4">Guest</th>
              <th className="px-4 py-4">Contact</th>
              <th className="px-4 py-4">Date & Time</th>
              <th className="px-4 py-4">Party</th>
              <th className="px-4 py-4">Status</th>
              <th className="px-4 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {reservations.map((r) => (
              <tr
                key={r.id}
                className="border-b border-white/[0.04] hover:bg-white/[0.02]"
              >
                <td className="px-4 py-3">
                  <button
                    type="button"
                    className="font-medium text-white hover:text-[#d4af37]"
                    onClick={() => setDetail(r)}
                  >
                    {r.guestName}
                  </button>
                </td>
                <td className="px-4 py-3 text-white/50">
                  <p>{r.email}</p>
                  <p className="text-xs">{r.phone}</p>
                </td>
                <td className="px-4 py-3 text-white/60">
                  {r.date} · {r.time}
                </td>
                <td className="px-4 py-3 text-white/60">{r.partySize}</td>
                <td className="px-4 py-3">
                  <StatusChip status={r.status} />
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      className={cn(
                        "rounded-lg border px-3 py-1 text-xs transition-colors",
                        r.status === "Approved"
                          ? "border-emerald-500/30 text-emerald-300"
                          : "border-white/10 text-white/50 hover:border-emerald-500/30"
                      )}
                      onClick={() => updateStatus(r.id, "Approved")}
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      className="rounded-lg border border-white/10 px-3 py-1 text-xs text-white/50 hover:border-rose-500/30 hover:text-rose-300"
                      onClick={() => updateStatus(r.id, "Rejected")}
                    >
                      Reject
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AdminModal
        open={!!detail}
        onClose={() => setDetail(null)}
        title="Reservation Details"
        wide
      >
        {detail && (
          <div className="space-y-4 font-[family-name:var(--font-body)] text-sm">
            <div className="flex items-center justify-between">
              <p className="text-lg text-white">{detail.guestName}</p>
              <StatusChip status={detail.status} />
            </div>
            <p className="text-white/50">{detail.email} · {detail.phone}</p>
            <p>
              <span className="text-white/40">When: </span>
              {detail.date} at {detail.time}
            </p>
            <p>
              <span className="text-white/40">Party: </span>
              {detail.partySize} guests
            </p>
            {detail.notes && (
              <p className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 text-white/60">
                {detail.notes}
              </p>
            )}
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                className="rounded-full bg-emerald-600/80 px-5 py-2 text-xs text-white"
                onClick={() => updateStatus(detail.id, "Approved")}
              >
                Approve
              </button>
              <button
                type="button"
                className="rounded-full bg-rose-600/80 px-5 py-2 text-xs text-white"
                onClick={() => updateStatus(detail.id, "Rejected")}
              >
                Reject
              </button>
            </div>
          </div>
        )}
      </AdminModal>
    </div>
  );
}
