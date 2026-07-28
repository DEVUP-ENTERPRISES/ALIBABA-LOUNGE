"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { AdminModal } from "@/components/admin/ui/AdminModal";
import { StatusChip } from "@/components/admin/ui/StatusChip";
import { EventForm } from "@/components/admin/events/EventForm";
import { ImageUploadField } from "@/components/admin/ui/ImageUploadField";
import { menuImages } from "@/lib/menu-images";
import type { AdminEvent } from "@/lib/admin/types";
import { eventApi } from "@/lib/admin/data-api";

export default function AdminEventsPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<AdminEvent | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [events, setEvents] = useState<AdminEvent[]>([]);

  const loadEvents = async () => setEvents(await eventApi.list("?limit=100"));

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- loads server-backed admin table data on mount.
    void loadEvents();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (event: AdminEvent) => {
    setEditing(event);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditing(null);
  };

  const saveEvent = async (payload: Parameters<typeof eventApi.create>[0]) => {
    if (editing) await eventApi.update(editing.id, payload);
    else await eventApi.create(payload);
    closeModal();
    await loadEvents();
  };

  const deleteEvent = async () => {
    if (!deleteId) return;
    await eventApi.remove(deleteId);
    setDeleteId(null);
    await loadEvents();
  };

  return (
    <div className="space-y-8">
      <section className="glass-luxury rounded-2xl p-6">
        <h2 className="font-[family-name:var(--font-display)] text-lg text-white">
          Global Event Banner
        </h2>
        <p className="mt-1 text-sm text-white/40">
          Featured banner for the public events page hero
        </p>
        <div className="mt-4">
          <ImageUploadField
            label="Events Page Banner"
            initialPreview={menuImages.events}
            aspect="wide"
          />
        </div>
      </section>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#8b6914] via-[#d4af37] to-[#8b6914] px-5 py-2.5 text-sm font-medium text-[#050505]"
        >
          <Plus className="size-4" />
          Create Event
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {events.map((event) => (
          <div
            key={event.id}
            className="glass-luxury group overflow-hidden rounded-2xl transition-shadow hover:shadow-[0_0_32px_rgba(212,175,55,0.08)]"
          >
            <div className="relative aspect-video">
              <Image
                src={event.image}
                alt=""
                fill
                className="object-cover"
                sizes="400px"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0c0c0e] to-transparent" />
              <div className="absolute top-3 left-3">
                <StatusChip status={event.status} />
              </div>
            </div>
            <div className="p-5">
              <h3 className="font-[family-name:var(--font-display)] text-xl text-white">
                {event.title}
              </h3>
              <p className="mt-1 text-sm text-white/45">
                {event.date} · {event.time}
              </p>
              <p className="text-xs text-white/35">{event.location}</p>
              <div className="mt-4 flex gap-2">
                <button
                  type="button"
                  className="flex flex-1 items-center justify-center gap-1 rounded-lg border border-white/10 py-2 text-xs text-white/50 hover:text-[#d4af37]"
                  onClick={() => openEdit(event)}
                >
                  <Pencil className="size-3.5" /> Edit
                </button>
                <button
                  type="button"
                  className="rounded-lg border border-white/10 px-3 py-2 text-white/50 hover:text-rose-400"
                  onClick={() => setDeleteId(event.id)}
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="glass-luxury overflow-x-auto rounded-2xl">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-white/[0.06] text-[10px] tracking-[0.2em] text-white/40 uppercase">
              <th className="px-4 py-3">Event</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {events.map((e) => (
              <tr key={e.id} className="border-b border-white/[0.04]">
                <td className="px-4 py-3 text-white">{e.title}</td>
                <td className="px-4 py-3 text-white/50">{e.date}</td>
                <td className="px-4 py-3">
                  <StatusChip status={e.status} />
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    type="button"
                    className="text-xs text-[#d4af37]"
                    onClick={() => openEdit(e)}
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AdminModal
        open={modalOpen}
        onClose={closeModal}
        title={editing ? "Edit Event" : "Create Event"}
        wide
      >
        <EventForm
          key={editing?.id ?? "new"}
          event={editing}
          onCancel={closeModal}
          onSave={(payload) => void saveEvent(payload)}
        />
      </AdminModal>

      <AdminModal
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        title="Delete Event"
      >
        <p className="text-sm text-white/55">This will permanently delete the event and its image. Are you sure?</p>
        <button
          type="button"
          className="mt-4 rounded-full bg-rose-600/80 px-5 py-2 text-sm text-white"
          onClick={() => void deleteEvent()}
        >
          Delete
        </button>
      </AdminModal>
    </div>
  );
}
