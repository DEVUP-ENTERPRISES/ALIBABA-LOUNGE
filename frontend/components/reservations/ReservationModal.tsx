"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check, Copy, Search, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { TablePicker } from "@/components/reservations/TablePicker";

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
    table?: string;
  }) => Promise<{ reference?: string; tableCode?: string } | void> | void;
}

const defaultFormState = {
  guestName: "",
  email: "",
  phone: "",
  partySize: 2,
  date: "",
  time: "20:00",
  notes: "",
  table: "",
  tableCode: "",
};

export function ReservationModal({ open, onClose, onConfirm }: ReservationModalProps) {
  const [form, setForm] = useState(defaultFormState);
  const [submitted, setSubmitted] = useState(false);
  const [reference, setReference] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);


  // Reset whenever the modal is reopened — otherwise the success screen from a
  // previous booking sticks around and the guest can never book a second time.
  useEffect(() => {
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setForm(defaultFormState);
      setSubmitted(false);
      setReference(null);
      setCopied(false);
      setError(null);
    }
  }, [open]);

  // Local calendar date, not UTC. toISOString() would roll over to tomorrow
  // during the evening in US timezones — exactly when guests book a table.
  // Computed every render so it stays correct across a midnight rollover.
  const now = new Date();
  const minDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(now.getDate()).padStart(2, "0")}`;

  const handleChange = (field: keyof typeof form, value: string) => {
    setError(null);
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

    // The whole point of showing the floor is that the guest chooses. Without
    // a table there is nothing to hold, and the booking is just a request into
    // the void again.
    if (!form.table) {
      setError("Pick a table from the floor above.");
      return;
    }

    setSubmitting(true);
    try {
      const created = await onConfirm(form);
      setReference(created?.reference ?? null);
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
          {/* Scrollable and capped to the screen. The floor picker made this
              panel tall enough to push the submit button off a phone, where
              overflow-hidden left it unreachable with no way to scroll to it. */}
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.98 }}
            transition={{ duration: 0.25 }}
            data-lenis-prevent
            className="hide-scrollbar relative z-10 max-h-[90dvh] w-full max-w-3xl overflow-y-auto overscroll-contain rounded-[2rem] border border-white/10 bg-[#070707]/95 p-6 shadow-[0_0_80px_rgba(0,0,0,0.55)] backdrop-blur-xl sm:p-10"
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
                  Book a table
                </h2>
                <p className="font-[family-name:var(--font-body)] text-sm leading-7 text-white/60">
                  Tell us when you are coming and how many, then pick your own table
                  from what is free. We hold it the moment you book.
                </p>
                <div className="space-y-3 rounded-3xl border border-white/10 bg-white/5 p-5 text-sm text-white/70">
                  <p className="font-semibold text-white">What to expect</p>
                  <ul className="space-y-2">
                    <li>• See the real floor and choose your own seat</li>
                    <li>• Your table is held for two hours</li>
                    <li>• Track it any time with your booking code</li>
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
                      {/* Not "Confirmed" — it is a request until someone on the
                          floor gives it a table. Saying otherwise sets the guest
                          up to turn up to nothing. */}
                      <p className="text-sm uppercase tracking-[0.35em] text-[#d4af37]">Request sent</p>
                      <h3 className="mt-3 text-2xl font-[family-name:var(--font-display)] text-white">
                        We have your table request
                      </h3>
                      <p className="mt-2 text-sm text-white/60">
                        {form.tableCode
                          ? `Table ${form.tableCode} is held for you. We will confirm shortly.`
                          : "Our floor team will confirm shortly."}
                      </p>
                    </div>

                    {reference && (
                      <div className="w-full rounded-2xl border border-[#d4af37]/30 bg-[#d4af37]/[0.06] p-4">
                        <p className="font-[family-name:var(--font-accent)] text-[10px] tracking-[0.22em] text-[#d4af37] uppercase">
                          Your reservation code
                        </p>
                        <p className="mt-1.5 font-[family-name:var(--font-display)] text-3xl tracking-[0.12em] text-white">
                          {reference}
                        </p>
                        <p className="mt-1.5 text-xs text-white/45">
                          Keep this. It is how you check your booking and how we find
                          you at the door.
                        </p>
                        <div className="mt-3 flex flex-wrap justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              void navigator.clipboard?.writeText(reference).then(
                                () => setCopied(true),
                                () => setCopied(false)
                              );
                            }}
                            className="flex items-center gap-1.5 rounded-full border border-white/12 px-3.5 py-2 text-xs text-white/65 transition-colors hover:border-[#d4af37]/50 hover:text-white"
                          >
                            <Copy className="size-3.5" />
                            {copied ? "Copied" : "Copy code"}
                          </button>
                          <a
                            href={`/reservation/status?code=${reference}`}
                            className="flex items-center gap-1.5 rounded-full border border-white/12 px-3.5 py-2 text-xs text-white/65 transition-colors hover:border-[#d4af37]/50 hover:text-white"
                          >
                            <Search className="size-3.5" /> Track it
                          </a>
                        </div>
                      </div>
                    )}

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

                    {/* Guests choose their own seat from the live floor rather
                        than being assigned one afterwards, so they can see what
                        is actually free before committing. */}
                    <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4">
                      <TablePicker
                        date={form.date}
                        time={form.time}
                        guests={Number(form.partySize) || 1}
                        value={form.table || null}
                        onChange={(id, table) => {
                          setError(null);
                          setForm((state) => ({ ...state, table: id, tableCode: table.code }));
                        }}
                        compact
                      />
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
                      {submitting
                        ? "Sending..."
                        : form.tableCode
                          ? `Request table ${form.tableCode}`
                          : "Request reservation"}
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
