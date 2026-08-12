"use client";

import { useCallback, useEffect, useState } from "react";
import { KeyRound, Plus, UserCog } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AdminModal } from "@/components/admin/ui/AdminModal";
import { AdminSelect } from "@/components/admin/ui/AdminSelect";
import { staffApi } from "@/lib/admin/data-api";
import type { StaffMember, StaffRole } from "@/lib/admin/types";
import { formatUsTimestamp } from "@/lib/format";
import { cn } from "@/lib/utils";

const ROLES: { value: StaffRole; label: string; blurb: string }[] = [
  { value: "server", label: "Server", blurb: "Claims and serves orders on the floor" },
  { value: "manager", label: "Manager", blurb: "All orders, reassign, close, edit the floor" },
  { value: "admin", label: "Admin", blurb: "Back office: menu, events, settings" },
  { value: "super-admin", label: "Super Admin", blurb: "Everything, including staff" },
];

const roleTone: Record<StaffRole, string> = {
  "super-admin": "border-[#d4af37]/40 text-[#d4af37]",
  admin: "border-violet-400/30 text-violet-300",
  manager: "border-sky-400/30 text-sky-300",
  server: "border-emerald-400/30 text-emerald-300",
};

export default function AdminStaffPage() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [pwFor, setPwFor] = useState<StaffMember | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setStaff(await staffApi.list("?limit=200"));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load staff.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const toggleActive = async (member: StaffMember) => {
    try {
      const updated = await staffApi.update(member.id, { isActive: !member.isActive });
      setStaff((prev) => prev.map((s) => (s.id === member.id ? updated : s)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update.");
    }
  };

  const changeRole = async (member: StaffMember, role: StaffRole) => {
    try {
      const updated = await staffApi.update(member.id, { role });
      setStaff((prev) => prev.map((s) => (s.id === member.id ? updated : s)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not change role.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-2xl text-white">Staff</h1>
          <p className="mt-1 text-sm text-white/45">
            Create accounts for the floor. Servers sign in at the same admin URL.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setAddOpen(true)}
          className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#8b6914] via-[#d4af37] to-[#8b6914] px-5 py-2.5 text-sm font-medium text-[#050505]"
        >
          <Plus className="size-4" /> Add worker
        </button>
      </div>

      {error && (
        <p role="alert" className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
          {error}
        </p>
      )}

      <div className="glass-luxury overflow-x-auto rounded-2xl">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="border-b border-white/[0.06] text-[11px] tracking-[0.14em] text-white/40 uppercase">
            <tr>
              <th className="px-4 py-4">Name</th>
              <th className="px-4 py-4">Email</th>
              <th className="px-4 py-4">Role</th>
              <th className="px-4 py-4">Last sign-in</th>
              <th className="px-4 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {staff.map((m) => (
              <tr key={m.id} className="border-b border-white/[0.04] hover:bg-white/[0.02]">
                <td className="px-4 py-3">
                  <p className="text-white">{m.displayName || m.name}</p>
                  {m.phone && <p className="text-xs text-white/35">{m.phone}</p>}
                </td>
                <td className="px-4 py-3 text-white/55">{m.email}</td>
                <td className="px-4 py-3">
                  <select
                    value={m.role}
                    onChange={(e) => changeRole(m, e.target.value as StaffRole)}
                    className={cn(
                      "rounded-full border bg-transparent px-3 py-1 text-xs",
                      roleTone[m.role]
                    )}
                  >
                    {ROLES.map((r) => (
                      <option key={r.value} value={r.value} className="bg-[#0c0c0e]">
                        {r.label}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-3 text-white/45">
                  {m.lastLoginAt ? formatUsTimestamp(m.lastLoginAt) : "Never"}
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setPwFor(m)}
                      title="Set a new password"
                      className="rounded-lg border border-white/10 p-2 text-white/50 hover:text-[#d4af37]"
                    >
                      <KeyRound className="size-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleActive(m)}
                      className={cn(
                        "rounded-lg border px-3 py-1.5 text-xs transition-colors",
                        m.isActive
                          ? "border-emerald-400/30 text-emerald-300 hover:bg-emerald-400/10"
                          : "border-white/10 text-white/40 hover:text-white/70"
                      )}
                    >
                      {m.isActive ? "Active" : "Disabled"}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {loading && <p className="px-4 py-5 text-center text-sm text-white/40">Loading staff…</p>}
        {!loading && staff.length === 0 && (
          <p className="px-4 py-8 text-center text-sm text-white/35">No staff yet.</p>
        )}
      </div>

      <AdminModal open={addOpen} onClose={() => setAddOpen(false)} title="Add worker">
        <StaffForm
          onCancel={() => setAddOpen(false)}
          onSaved={(m) => {
            setStaff((prev) => [...prev, m]);
            setAddOpen(false);
          }}
        />
      </AdminModal>

      <AdminModal open={!!pwFor} onClose={() => setPwFor(null)} title={`New password — ${pwFor?.name ?? ""}`}>
        {pwFor && <PasswordForm member={pwFor} onDone={() => setPwFor(null)} />}
      </AdminModal>
    </div>
  );
}

function StaffForm({
  onSaved,
  onCancel,
}: {
  onSaved: (m: StaffMember) => void;
  onCancel: () => void;
}) {
  const [role, setRole] = useState<StaffRole>("server");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <form
      className="space-y-4"
      onSubmit={async (e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        setBusy(true);
        setError(null);
        try {
          onSaved(
            await staffApi.create({
              name: String(fd.get("name") || ""),
              displayName: String(fd.get("displayName") || ""),
              email: String(fd.get("email") || ""),
              phone: String(fd.get("phone") || ""),
              password: String(fd.get("password") || ""),
              role,
            })
          );
        } catch (err) {
          setError(err instanceof Error ? err.message : "Could not create the account.");
        } finally {
          setBusy(false);
        }
      }}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Full name</Label>
          <Input id="name" name="name" required placeholder="Aisha Rahman" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="displayName">Floor name</Label>
          <Input id="displayName" name="displayName" placeholder="Aisha" />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" required placeholder="aisha@alibabahookahlounge.co" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" name="phone" type="tel" placeholder="(469) 555-0134" />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input id="password" name="password" type="text" required minLength={8} placeholder="At least 8 characters" />
        <p className="text-xs text-white/35">
          Share this with the worker; they can change it after signing in.
        </p>
      </div>

      <div className="space-y-2">
        <Label>Role</Label>
        <AdminSelect
          value={role}
          onChange={(v) => setRole(v as StaffRole)}
          options={ROLES.map((r) => ({ value: r.value, label: r.label }))}
        />
        <p className="text-xs text-white/35">{ROLES.find((r) => r.value === role)?.blurb}</p>
      </div>

      {error && <p role="alert" className="text-sm text-rose-400">{error}</p>}

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={busy}
          className="rounded-full bg-gradient-to-r from-[#8b6914] via-[#d4af37] to-[#8b6914] px-6 py-2.5 text-sm font-medium text-[#050505] disabled:opacity-60"
        >
          {busy ? "Creating…" : "Create worker"}
        </button>
        <button type="button" onClick={onCancel} className="rounded-full border border-white/10 px-6 py-2.5 text-sm text-white/60">
          Cancel
        </button>
      </div>
    </form>
  );
}

function PasswordForm({ member, onDone }: { member: StaffMember; onDone: () => void }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  if (done) {
    return (
      <div className="py-6 text-center">
        <UserCog className="mx-auto size-8 text-[#d4af37]" />
        <p className="mt-3 text-white">Password updated.</p>
        <button type="button" onClick={onDone} className="mt-5 rounded-full border border-white/10 px-6 py-2 text-sm text-white/70">
          Close
        </button>
      </div>
    );
  }

  return (
    <form
      className="space-y-4"
      onSubmit={async (e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        setBusy(true);
        setError(null);
        try {
          await staffApi.resetPassword(member.id, String(fd.get("password") || ""));
          setDone(true);
        } catch (err) {
          setError(err instanceof Error ? err.message : "Could not set the password.");
        } finally {
          setBusy(false);
        }
      }}
    >
      <div className="space-y-2">
        <Label htmlFor="pw">New password</Label>
        <Input id="pw" name="password" type="text" required minLength={8} placeholder="At least 8 characters" />
      </div>
      {error && <p role="alert" className="text-sm text-rose-400">{error}</p>}
      <button
        type="submit"
        disabled={busy}
        className="rounded-full bg-gradient-to-r from-[#8b6914] via-[#d4af37] to-[#8b6914] px-6 py-2.5 text-sm font-medium text-[#050505] disabled:opacity-60"
      >
        {busy ? "Saving…" : "Set password"}
      </button>
    </form>
  );
}
