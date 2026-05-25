"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { User, Mail, Calendar, Clock, Users, LogOut, Edit3, Check, X, Crown, Sparkles } from "lucide-react";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

interface Booking {
  id: string;
  date: string;
  time: string;
  partySize: number;
  status: string;
  notes?: string;
  createdAt: string;
}

const STATUS_STYLES: Record<string, string> = {
  pending:   "bg-amber-500/10 text-amber-400 border-amber-500/20",
  confirmed: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  cancelled: "bg-red-500/10 text-red-400 border-red-500/20",
};

export default function AccountPage() {
  const { user, loading, isAuthenticated } = useRequireAuth();
  const { signOut, getIdToken } = useAuth();
  const router = useRouter();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [bLoading, setBLoading] = useState(true);
  const [editName, setEditName] = useState(false);
  const [nameVal, setNameVal] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchBookings = useCallback(async () => {
    setBLoading(true);
    try {
      const token = await getIdToken();
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/reservations/mine`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setBookings(data.reservations ?? []);
      }
    } catch {
      setBookings([]);
    } finally {
      setBLoading(false);
    }
  }, [getIdToken]);

  useEffect(() => {
    if (!user) return;
    queueMicrotask(() => setNameVal(user.displayName ?? ""));
    queueMicrotask(() => void fetchBookings());
  }, [fetchBookings, user]);

  const saveName = async () => {
    if (!nameVal.trim()) return;
    setSaving(true);
    try {
      const token = await getIdToken();
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/me`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ displayName: nameVal.trim() }),
      });
      setEditName(false);
    } catch {
      /* silent */
    } finally {
      setSaving(false);
    }
  };

  if (loading || !isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#050505]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#d4af37]/30 border-t-[#d4af37]" />
      </div>
    );
  }

  const initials = (user!.displayName ?? user!.email ?? "U")
    .split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();

  return (
    <div className="cinematic-backdrop min-h-screen pt-28 pb-24">
      <div className="mx-auto max-w-6xl px-5 sm:px-6">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <p className="font-[family-name:var(--font-accent)] text-[10px] tracking-[0.35em] text-[#d4af37] uppercase">
              Member
            </p>
            <h1 className="mt-1 font-[family-name:var(--font-display)] text-4xl tracking-normal text-white uppercase sm:text-5xl">
              VIP Member Suite
            </h1>
          </div>
          <button
            onClick={async () => { await signOut(); router.push("/"); }}
            className="flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 font-[family-name:var(--font-body)] text-xs text-white/40 transition-colors hover:border-red-500/30 hover:text-red-300"
          >
            <LogOut size={13} />
            Sign Out
          </button>
        </motion.div>

        <div className="mb-6 grid gap-3 sm:grid-cols-3">
          {[
            { label: "Reservations", value: bookings.length, icon: Calendar },
            { label: "Member Status", value: "VIP", icon: Crown },
            { label: "Concierge", value: "Ready", icon: Sparkles },
          ].map((item) => (
            <div key={item.label} className="glass-luxury rounded-2xl p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-[family-name:var(--font-accent)] text-[8px] tracking-[0.22em] text-white/35 uppercase">
                    {item.label}
                  </p>
                  <p className="mt-1 font-[family-name:var(--font-display)] text-2xl text-gold-gradient">
                    {item.value}
                  </p>
                </div>
                <item.icon className="size-5 text-[#d4af37]/60" />
              </div>
            </div>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Profile Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="cinematic-frame glass-luxury rounded-2xl p-6"
          >
            {/* Avatar */}
            <div className="flex flex-col items-center text-center">
              <div className="flex h-24 w-24 items-center justify-center rounded-full border-2 border-[#d4af37]/40 bg-[#d4af37]/10 shadow-[0_0_35px_rgba(212,175,55,0.16)]">
                {user!.photoURL ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={user!.photoURL} alt="" className="h-24 w-24 rounded-full object-cover" />
                ) : (
                  <span className="font-[family-name:var(--font-display)] text-2xl text-[#d4af37]">
                    {initials}
                  </span>
                )}
              </div>

              {/* Name */}
              <div className="mt-4 w-full">
                {editName ? (
                  <div className="flex items-center gap-2">
                    <input
                      value={nameVal}
                      onChange={(e) => setNameVal(e.target.value)}
                      className="flex-1 rounded-lg border border-[#d4af37]/30 bg-white/[0.03] px-3 py-1.5 text-center font-[family-name:var(--font-body)] text-sm text-white outline-none focus:border-[#d4af37]/60"
                      autoFocus
                    />
                    <button onClick={saveName} disabled={saving} className="text-[#d4af37] hover:text-[#f0cc58]">
                      <Check size={15} />
                    </button>
                    <button onClick={() => { setEditName(false); setNameVal(user!.displayName ?? ""); }} className="text-white/30 hover:text-white/60">
                      <X size={15} />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <p className="font-[family-name:var(--font-display)] text-lg text-white">
                      {user!.displayName ?? "No name set"}
                    </p>
                    <button onClick={() => setEditName(true)} className="text-white/20 hover:text-[#d4af37] transition-colors">
                      <Edit3 size={12} />
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 space-y-3 border-t border-white/[0.06] pt-5">
              <div className="flex items-center gap-3">
                <Mail size={13} className="shrink-0 text-[#d4af37]/60" />
                <p className="font-[family-name:var(--font-body)] text-xs text-white/60 truncate">
                  {user!.email}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <User size={13} className="shrink-0 text-[#d4af37]/60" />
                <p className="font-[family-name:var(--font-body)] text-xs text-white/40">
                  {user!.providerData[0]?.providerId === "google.com" ? "Google Account" : "Email Account"}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Reservations */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="lg:col-span-2"
          >
              <div className="cinematic-frame glass-luxury overflow-hidden rounded-2xl">
              <div className="flex items-center justify-between border-b border-white/[0.06] px-6 py-4">
                <h2 className="font-[family-name:var(--font-display)] text-xl text-white">
                  Reservation History
                </h2>
                <span className="font-[family-name:var(--font-accent)] text-[9px] tracking-[0.2em] text-white/30 uppercase">
                  {bookings.length} total
                </span>
              </div>

              {bLoading ? (
                <div className="flex items-center justify-center py-16">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#d4af37]/30 border-t-[#d4af37]" />
                </div>
              ) : bookings.length === 0 ? (
                <div className="py-16 text-center">
                  <Calendar className="mx-auto h-10 w-10 text-white/10" />
                  <p className="mt-4 font-[family-name:var(--font-body)] text-sm text-white/30">
                    No reservations yet.
                  </p>
                  <button
                    onClick={() => router.push("/reservation")}
                    className="mt-5 rounded-full bg-[#d4af37] px-6 py-2.5 font-[family-name:var(--font-accent)] text-[10px] tracking-[0.2em] text-[#050505] uppercase transition-shadow hover:shadow-[0_0_20px_rgba(212,175,55,0.3)]"
                  >
                    Book a Table
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-white/[0.04]">
                  {bookings.map((b) => (
                    <div key={b.id} className="flex flex-col gap-3 px-5 py-5 transition-colors hover:bg-white/[0.025] sm:flex-row sm:items-center sm:justify-between sm:px-6">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-3">
                          <div className="flex items-center gap-1.5 font-[family-name:var(--font-body)] text-sm text-white">
                            <Calendar size={12} className="text-[#d4af37]/60" />
                            {b.date}
                          </div>
                          <div className="flex items-center gap-1.5 font-[family-name:var(--font-body)] text-xs text-white/50">
                            <Clock size={11} className="text-[#d4af37]/40" />
                            {b.time}
                          </div>
                          <div className="flex items-center gap-1.5 font-[family-name:var(--font-body)] text-xs text-white/50">
                            <Users size={11} className="text-[#d4af37]/40" />
                            {b.partySize} guests
                          </div>
                        </div>
                        {b.notes && (
                          <p className="font-[family-name:var(--font-body)] text-xs text-white/30 italic">
                            &ldquo;{b.notes}&rdquo;
                          </p>
                        )}
                      </div>
                      <span className={`w-fit rounded-full border px-3 py-1 font-[family-name:var(--font-accent)] text-[9px] tracking-[0.15em] uppercase ${STATUS_STYLES[b.status] ?? STATUS_STYLES.pending}`}>
                        {b.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
