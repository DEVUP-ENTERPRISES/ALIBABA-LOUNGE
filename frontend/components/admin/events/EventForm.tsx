"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AdminSelect } from "@/components/admin/ui/AdminSelect";
import { ImageUploadField } from "@/components/admin/ui/ImageUploadField";
import { eventStatusOptions } from "@/lib/admin/form-options";
import type { AdminEvent } from "@/lib/admin/types";

interface EventFormProps {
  event?: AdminEvent | null;
  onCancel: () => void;
  onSave?: (payload: FormData | Record<string, unknown>) => void;
}

export function EventForm({ event, onCancel, onSave }: EventFormProps) {
  const [status, setStatus] = useState<string>(event?.status ?? "Draft");
  const [imageFile, setImageFile] = useState<File | null>(null);

  return (
    <form
      className="space-y-5"
      onSubmit={(e) => {
        e.preventDefault();
        const form = new FormData(e.currentTarget);
        const featured = form.get("featured") === "on";

        if (imageFile) {
          const fd = new FormData();
          fd.append("image", imageFile);
          fd.append("title", String(form.get("title") || ""));
          fd.append("date", String(form.get("date") || ""));
          fd.append("time", String(form.get("time") || ""));
          fd.append("location", String(form.get("location") || ""));
          fd.append("status", status);
          fd.append("featured", String(featured));
          onSave?.(fd);
        } else {
          onSave?.({
            title: String(form.get("title") || ""),
            date: String(form.get("date") || ""),
            time: String(form.get("time") || ""),
            location: String(form.get("location") || ""),
            status,
            image: event?.image || "",
            featured,
          });
        }
      }}
    >
      <ImageUploadField
        label="Event Banner"
        hint="Cinematic event imagery · 21:9 recommended"
        initialPreview={event?.image ?? null}
        aspect="wide"
        onFileChange={setImageFile}
      />

      <div className="space-y-2 sm:col-span-2">
        <Label htmlFor="event-title">Title</Label>
        <Input
          id="event-title"
          name="title"
          defaultValue={event?.title}
          placeholder="Event title"
          required
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="event-date">Date</Label>
          <Input
            id="event-date"
            name="date"
            type="date"
            defaultValue={event?.date}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="event-time">Time</Label>
          <Input
            id="event-time"
            name="time"
            defaultValue={event?.time}
            placeholder="8:00 PM"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="event-location">Location</Label>
        <Input
          id="event-location"
          name="location"
          defaultValue={event?.location}
          placeholder="Sheesh Main Lounge"
          required
        />
      </div>

      <AdminSelect
        label="Status"
        value={status}
        onChange={setStatus}
        options={eventStatusOptions}
        placeholder="Select status"
      />

      <label className="inline-flex items-center gap-3 text-sm text-white/55">
        <input
          type="checkbox"
          name="featured"
          defaultChecked={event?.featured}
          className="size-4 accent-[#d4af37]"
        />
        Featured event
      </label>

      <div className="flex flex-wrap gap-3 border-t border-white/[0.06] pt-4">
        <button
          type="submit"
          className="rounded-full bg-[#d4af37] px-6 py-2.5 text-sm font-medium text-[#050505]"
        >
          Save Event
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-full border border-white/15 px-6 py-2.5 text-sm text-white/60"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
