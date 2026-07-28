"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check, X } from "lucide-react";
import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface ReservationModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (payload: {
    guestName: string;
    email: string;
    phone: string;
    partySize: number;
    date: string;
    time: string;
    notes?: string;
  }) => void | Promise<void>;
}

const defaultFormState = {
  guestName: "",
  email: "",
  phone: "",
  partySize: 2,
  date: "",
  time: "20:00",
  notes: "",
};

export function ReservationModal({ open, onClose, onConfirm }: ReservationModalProps) {
  const [form, setForm] = useState(defaultFormState);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);


  const minDate = useMemo(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  }, []);

  const handleChange = (field: keyof typeof form, value: string) => {
    setForm((state) => ({
      ...state,
      [field]: field === "partySize" ? Number(value) : value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const { guestName, email, phone, partySize, date, time } = form;

    if (!guestName || !email || !phone || !partySize || !date || !time) {
      setError("Please complete all reservation details.");
      return;
    }

    setSubmitting(true);
    try {
      await onConfirm(form);
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to submit reservation.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          <div className="absolute inset-0 bg-black/75 backdrop-blur-xl" onClick={onClose} />
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.98 }}
            transition={{ duration: 0.25 }}
            className="relative z-10 w-full max-w-3xl overflow-hidden rounded-[2rem] border border-white/10 bg-[#070707]/95 p-6 shadow-[0_0_80px_rgba(0,0,0,0.55)] backdrop-blur-xl sm:p-10"
          >
            <button
              type="button"
              onClick={onClose}
              className="absolute right-4 top-4 inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white transition hover:border-[#d4af37]/50 hover:bg-[#d4af37]/10"
              aria-label="Close reservation form"
            >
              <X size={18} />
            </button>

            <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr] lg:gap-10">
              <div className="space-y-4 border-r border-white/5 pr-0 sm:pr-4 lg:pr-8 lg:border-r">
                <p className="font-[family-name:var(--font-accent)] text-xs tracking-[0.35em] text-[#d4af37] uppercase">
                  Table Booking
                </p>
                <h2 className="font-[family-name:var(--font-display)] text-3xl tracking-[0.05em] text-white sm:text-4xl">
                  Luxury reservation experience
                </h2>
                <p className="font-[family-name:var(--font-body)] text-sm leading-7 text-white/60">
                  Reserve your evening with a cinematic luxury booking flow. We will hold your preferred table and confirm the experience instantly.
                </p>
                <div className="space-y-3 rounded-3xl border border-white/10 bg-white/5 p-5 text-sm text-white/70">
                  <p className="font-semibold text-white">What to expect</p>
                  <ul className="space-y-2">
                    <li>• Private luxury seating when available</li>
                    <li>• Exclusive date and time selection</li>
                    <li>• Smooth confirmation flow in the dashboard</li>
                  </ul>
                </div>
              </div>

              <div className="rounded-[1.75rem] bg-[#101010]/90 p-6 shadow-[inset_0_0_30px_rgba(255,255,255,0.04)]">
                {submitted ? (
                  <div className="flex flex-col items-center justify-center gap-5 text-center">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-200 ring-1 ring-emerald-500/20">
                      <Check className="h-10 w-10" />
                    </div>
                    <div>
                      <p className="text-sm uppercase tracking-[0.35em] text-[#d4af37]">Confirmed</p>
                      <h3 className="mt-3 text-2xl font-[family-name:var(--font-display)] text-white">
                        Reservation sent
                      </h3>
                      <p className="mt-2 text-sm text-white/60">
                        Your booking request has been successfully stored. Admin can approve or reject it from the dashboard.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={onClose}
                      className="inline-flex rounded-full bg-[#d4af37] px-6 py-3 text-sm font-medium uppercase tracking-[0.15em] text-[#050505] transition hover:brightness-95"
                    >
                      Return to site
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <label className="space-y-2 text-sm text-white/70">
                        <span>Name</span>
                        <Input
                          value={form.guestName}
                          onChange={(event) => handleChange("guestName", event.target.value)}
                          placeholder="Your full name"
                          required
                        />
                      </label>
                      <label className="space-y-2 text-sm text-white/70">
                        <span>Email</span>
                        <Input
                          type="email"
                          value={form.email}
                          onChange={(event) => handleChange("email", event.target.value)}
                          placeholder="you@example.com"
                          required
                        />
                      </label>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <label className="space-y-2 text-sm text-white/70">
                        <span>Phone</span>
                        <Input
                          type="tel"
                          value={form.phone}
                          onChange={(event) => handleChange("phone", event.target.value)}
                          placeholder="(214) 555-0123"
                          required
                        />
                      </label>
                      <label className="space-y-2 text-sm text-white/70">
                        <span>Guest count</span>
                        <Input
                          type="number"
                          min={1}
                          max={20}
                          value={form.partySize}
                          onChange={(event) => handleChange("partySize", event.target.value)}
                          required
                        />
                      </label>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <label className="space-y-2 text-sm text-white/70">
                        <span>Date</span>
                        <Input
                          type="date"
                          value={form.date}
                          onChange={(event) => handleChange("date", event.target.value)}
                          min={minDate}
                          required
                        />
                      </label>
                      <label className="space-y-2 text-sm text-white/70">
                        <span>Time</span>
                        <Input
                          type="time"
                          value={form.time}
                          onChange={(event) => handleChange("time", event.target.value)}
                          required
                        />
                      </label>
                    </div>

                    <label className="space-y-2 text-sm text-white/70">
                      <span>Special request</span>
                      <Textarea
                        value={form.notes}
                        onChange={(event) => handleChange("notes", event.target.value)}
                        rows={4}
                        placeholder="Let us know if you prefer a private corner, hookah, or celebration details."
                      />
                    </label>

                    {error && (
                      <p className="rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                        {error}
                      </p>
                    )}

                    <button
                      type="submit"
                      disabled={submitting}
                      className="inline-flex w-full items-center justify-center rounded-full bg-gradient-to-r from-[#8b6914] via-[#d4af37] to-[#8b6914] px-6 py-3 text-sm font-semibold uppercase tracking-[0.15em] text-[#050505] transition hover:brightness-95"
                    >
                      {submitting ? "Sending..." : "Request reservation"}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
