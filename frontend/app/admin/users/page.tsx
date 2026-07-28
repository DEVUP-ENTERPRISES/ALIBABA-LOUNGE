"use client";

import { useEffect, useState } from "react";
import { Users, Mail, Shield, Clock, Search } from "lucide-react";
import { userApi } from "@/lib/admin/data-api";

interface UserRecord {
  id: string;
  firebaseUid: string;
  email: string;
  displayName: string;
  photoURL: string;
  provider: "google" | "password" | "mixed";
  lastLoginAt: string;
  createdAt: string;
}

const PROVIDER_LABEL: Record<string, string> = {
  google:   "Google",
  password: "Email",
  mixed:    "Mixed",
};

const PROVIDER_COLOR: Record<string, string> = {
  google:   "text-blue-400 bg-blue-500/10 border-blue-500/20",
  password: "text-purple-400 bg-purple-500/10 border-purple-500/20",
  mixed:    "text-[#d4af37] bg-[#d4af37]/10 border-[#d4af37]/20",
};

function fmt(dateStr: string) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function AdminUsersPage() {
  const [users, setUsers]     = useState<UserRecord[]>([]);
  const [filtered, setFiltered] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState("");
  const [total, setTotal]     = useState(0);

  useEffect(() => {
    userApi.list("?limit=100")
      .then((data) => {
        if (data) {
          const records = data.users as UserRecord[];
          setUsers(records); setFiltered(records); setTotal(data.total);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(
      q
        ? users.filter(
            (u) =>
              u.email.toLowerCase().includes(q) ||
              u.displayName.toLowerCase().includes(q)
          )
        : users
    );
  }, [search, users]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-2xl text-white">
            Users
          </h1>
          <p className="mt-1 font-[family-name:var(--font-body)] text-xs text-white/40">
            {total} registered member{total !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="relative w-full max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-white/30" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email…"
            className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] py-2.5 pl-9 pr-4 font-[family-name:var(--font-body)] text-xs text-white placeholder:text-white/20 outline-none focus:border-[#d4af37]/40"
          />
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Total Users",    value: total,                                        icon: Users },
          { label: "Google Sign-In", value: users.filter((u) => u.provider === "google").length,   icon: Shield },
          { label: "Email Sign-In",  value: users.filter((u) => u.provider === "password").length, icon: Mail },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="glass-luxury rounded-xl p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#d4af37]/10">
                <Icon className="size-4 text-[#d4af37]" />
              </div>
              <div>
                <p className="font-[family-name:var(--font-display)] text-2xl text-white">{value}</p>
                <p className="font-[family-name:var(--font-body)] text-[10px] text-white/40">{label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="glass-luxury overflow-hidden rounded-2xl">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px]">
            <thead>
              <tr className="border-b border-white/[0.06]">
                {["User", "Email", "Provider", "Joined", "Last Login"].map((h) => (
                  <th
                    key={h}
                    className="px-5 py-3.5 text-left font-[family-name:var(--font-accent)] text-[9px] tracking-[0.2em] text-white/35 uppercase"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center">
                    <div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-[#d4af37]/30 border-t-[#d4af37]" />
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center font-[family-name:var(--font-body)] text-sm text-white/30">
                    {search ? "No users match your search." : "No users registered yet."}
                  </td>
                </tr>
              ) : (
                filtered.map((u) => {
                  const initials = (u.displayName || u.email)
                    .split(" ").map((w: string) => w[0]).slice(0, 2).join("").toUpperCase();
                  return (
                    <tr key={u.id} className="group transition-colors hover:bg-white/[0.02]">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#d4af37]/30 bg-[#d4af37]/10">
                            {u.photoURL ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={u.photoURL} alt="" className="h-8 w-8 rounded-full object-cover" />
                            ) : (
                              <span className="font-[family-name:var(--font-accent)] text-[9px] text-[#d4af37]">
                                {initials}
                              </span>
                            )}
                          </div>
                          <p className="font-[family-name:var(--font-body)] text-sm text-white group-hover:text-[#d4af37] transition-colors">
                            {u.displayName || "—"}
                          </p>
                        </div>
                      </td>
                      <td className="px-5 py-4 font-[family-name:var(--font-body)] text-xs text-white/60">
                        {u.email}
                      </td>
                      <td className="px-5 py-4">
                        <span className={`rounded-full border px-2.5 py-1 font-[family-name:var(--font-accent)] text-[8px] tracking-[0.1em] uppercase ${PROVIDER_COLOR[u.provider] ?? ""}`}>
                          {PROVIDER_LABEL[u.provider] ?? u.provider}
                        </span>
                      </td>
                      <td className="px-5 py-4 font-[family-name:var(--font-body)] text-xs text-white/40">
                        <div className="flex items-center gap-1.5">
                          <Clock size={10} className="text-[#d4af37]/40" />
                          {fmt(u.createdAt)}
                        </div>
                      </td>
                      <td className="px-5 py-4 font-[family-name:var(--font-body)] text-xs text-white/40">
                        {fmt(u.lastLoginAt)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
