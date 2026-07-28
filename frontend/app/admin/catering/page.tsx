"use client";

import { useEffect, useState } from "react";
import type { AdminInquiry } from "@/lib/admin/types";
import { StatusChip } from "@/components/admin/ui/StatusChip";
import { AdminModal } from "@/components/admin/ui/AdminModal";
import { ImageUploadField } from "@/components/admin/ui/ImageUploadField";
import { menuImages } from "@/lib/menu-images";
import { inquiryApi } from "@/lib/admin/data-api";

export default function AdminCateringPage() {
  const [selected, setSelected] = useState<AdminInquiry | null>(null);
  const [inquiries, setInquiries] = useState<AdminInquiry[]>([]);

  const loadInquiries = async () => setInquiries(await inquiryApi.listCatering());

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- loads server-backed admin table data on mount.
    void loadInquiries();
  }, []);

  return (
    <div className="space-y-8">
      <section className="glass-luxury rounded-2xl p-6">
        <h2 className="font-[family-name:var(--font-display)] text-lg text-white">
          Catering Page Banner
        </h2>
        <p className="mt-1 text-sm text-white/40">
          Hero imagery for the public catering experience
        </p>
        <div className="mt-4">
          <ImageUploadField
            label="Catering Banner"
            initialPreview={menuImages.catering}
            aspect="wide"
          />
        </div>
      </section>

      <div className="glass-luxury overflow-x-auto rounded-2xl">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b border-white/[0.06] text-[10px] tracking-[0.2em] text-white/40 uppercase">
              <th className="px-4 py-4">Client</th>
              <th className="px-4 py-4">Event Date</th>
              <th className="px-4 py-4">Status</th>
              <th className="px-4 py-4">Submitted</th>
              <th className="px-4 py-4 text-right">View</th>
            </tr>
          </thead>
          <tbody>
            {inquiries.map((row) => (
              <tr key={row.id} className="border-b border-white/[0.04]">
                <td className="px-4 py-3 text-white">{row.name}</td>
                <td className="px-4 py-3 text-white/50">
                  {row.eventDate ?? "—"}
                </td>
                <td className="px-4 py-3">
                  <StatusChip status={row.status} />
                </td>
                <td className="px-4 py-3 text-white/40">{row.createdAt}</td>
                <td className="px-4 py-3 text-right">
                  <button
                    type="button"
                    className="text-xs text-[#d4af37] hover:underline"
                    onClick={() => setSelected(row)}
                  >
                    Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AdminModal
        open={!!selected}
        onClose={() => setSelected(null)}
        title="Catering Inquiry"
        wide
      >
        {selected && (
          <div className="space-y-3 text-sm text-white/70">
            <p className="text-lg text-white">{selected.name}</p>
            <p>
              {selected.email} · {selected.phone}
            </p>
            <p className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
              {selected.details}
            </p>
            <StatusChip status={selected.status} />
            <div className="flex gap-2 pt-4">
              <button
                type="button"
                className="rounded-full bg-[#d4af37] px-5 py-2 text-xs text-[#050505]"
                onClick={() => selected && void inquiryApi.updateCatering(selected.id, { status: "Contacted" }).then(loadInquiries)}
              >
                Mark Contacted
              </button>
              <button
                type="button"
                className="rounded-full border border-white/15 px-5 py-2 text-xs text-white/50"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </AdminModal>
    </div>
  );
}
