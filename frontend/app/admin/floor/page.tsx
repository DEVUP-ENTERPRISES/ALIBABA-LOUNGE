"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AdminModal } from "@/components/admin/ui/AdminModal";
import { AdminSelect } from "@/components/admin/ui/AdminSelect";
import { tableApi } from "@/lib/admin/data-api";
import type { FloorTable, TableSection, TableStatus } from "@/lib/admin/types";
import { cn } from "@/lib/utils";

// The venue runs one room today, but the others exist so a new area can be
// opened from here without a code change.
const SECTIONS: { value: TableSection; label: string }[] = [
  { value: "main-dining", label: "Main Dining Room" },
  { value: "backyard", label: "Backyard" },
  { value: "patio", label: "Patio" },
  { value: "bar", label: "Bar & More" },
];

const STATUSES: { value: TableStatus; label: string }[] = [
  { value: "available", label: "Available" },
  { value: "occupied", label: "Occupied" },
  { value: "reserved", label: "Reserved" },
  { value: "cleaning", label: "Cleaning" },
];

const statusTone: Record<TableStatus, string> = {
  available: "border-emerald-400/30 bg-emerald-400/[0.06] text-emerald-300",
  occupied: "border-amber-400/35 bg-amber-400/[0.07] text-amber-300",
  reserved: "border-sky-400/30 bg-sky-400/[0.06] text-sky-300",
  cleaning: "border-white/15 bg-white/[0.04] text-white/50",
};

export default function AdminFloorPage() {
  const [tables, setTables] = useState<FloorTable[]>([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setTables(await tableApi.list("?all=true"));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load the floor.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
    const poll = window.setInterval(() => void load(), 20000);
    return () => window.clearInterval(poll);
  }, [load]);

  const setStatus = async (t: FloorTable, status: TableStatus) => {
    try {
      const updated = await tableApi.update(t.id, { status });
      setTables((prev) => prev.map((x) => (x.id === t.id ? updated : x)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update the table.");
    }
  };

  const remove = async (t: FloorTable) => {
    if (!window.confirm(`Remove table ${t.code}?`)) return;
    try {
      await tableApi.remove(t.id);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not remove the table.");
    }
  };

  const bySection = useMemo(() => {
    const map = new Map<TableSection, FloorTable[]>();
    tables.forEach((t) => {
      if (!map.has(t.section)) map.set(t.section, []);
      map.get(t.section)!.push(t);
    });
    return map;
  }, [tables]);

  const seats = tables.filter((t) => t.isActive).reduce((n, t) => n + t.seats, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-2xl text-white">Floor Plan</h1>
          <p className="mt-1 text-sm text-white/45">
            {tables.filter((t) => t.isActive).length} tables · {seats} seats. Tap a status to change it.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setAddOpen(true)}
          className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#8b6914] via-[#d4af37] to-[#8b6914] px-5 py-2.5 text-sm font-medium text-[#050505]"
        >
          <Plus className="size-4" /> Add table
        </button>
      </div>

      {error && (
        <p role="alert" className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
          {error}
        </p>
      )}

      {SECTIONS.map((section) => {
        const list = (bySection.get(section.value) ?? []).sort(
          (a, b) => a.sortOrder - b.sortOrder || a.code.localeCompare(b.code)
        );
        if (list.length === 0) return null;
        return (
          <section key={section.value}>
            <h2 className="mb-3 font-[family-name:var(--font-accent)] text-[11px] tracking-[0.18em] text-white/45 uppercase">
              {section.label} · {list.length}
            </h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
              {list.map((t) => (
                <div
                  key={t.id}
                  className={cn(
                    "rounded-xl border p-3",
                    statusTone[t.status],
                    !t.isActive && "opacity-40"
                  )}
                >
                  <div className="flex items-start justify-between">
                    <span className="font-[family-name:var(--font-display)] text-lg text-white">
                      {t.code}
                    </span>
                    <button
                      type="button"
                      onClick={() => remove(t)}
                      aria-label={`Remove ${t.code}`}
                      className="text-white/25 transition-colors hover:text-rose-400"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                  <p className="mt-0.5 text-[10px] tracking-[0.14em] text-white/40 uppercase">
                    {t.seats} seats
                    {t.openOrders > 0 && ` · ${t.openOrders} open`}
                  </p>
                  <select
                    value={t.status}
                    onChange={(e) => setStatus(t, e.target.value as TableStatus)}
                    className="mt-2 w-full rounded-lg border border-white/10 bg-[#050505]/60 px-2 py-1.5 text-[11px] text-white/75"
                  >
                    {STATUSES.map((s) => (
                      <option key={s.value} value={s.value} className="bg-[#0c0c0e]">
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </section>
        );
      })}

      {loading && tables.length === 0 && (
        <p className="py-10 text-center text-sm text-white/40">Loading the floor…</p>
      )}

      <AdminModal open={addOpen} onClose={() => setAddOpen(false)} title="Add table">
        <TableForm
          onCancel={() => setAddOpen(false)}
          onSaved={(t) => {
            setTables((prev) => [...prev, t]);
            setAddOpen(false);
          }}
        />
      </AdminModal>
    </div>
  );
}

function TableForm({
  onSaved,
  onCancel,
}: {
  onSaved: (t: FloorTable) => void;
  onCancel: () => void;
}) {
  const [section, setSection] = useState<TableSection>("main-dining");
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
            await tableApi.create({
              code: String(fd.get("code") || "").toUpperCase(),
              seats: Number(fd.get("seats") || 4),
              section,
            })
          );
        } catch (err) {
          setError(err instanceof Error ? err.message : "Could not add the table.");
        } finally {
          setBusy(false);
        }
      }}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="code">Table code</Label>
          <Input id="code" name="code" required maxLength={12} placeholder="M15" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="seats">Seats</Label>
          <Input id="seats" name="seats" type="number" min={1} max={40} defaultValue={4} required />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Section</Label>
        <AdminSelect
          value={section}
          onChange={(v) => setSection(v as TableSection)}
          options={SECTIONS.map((s) => ({ value: s.value, label: s.label }))}
        />
      </div>

      {error && <p role="alert" className="text-sm text-rose-400">{error}</p>}

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={busy}
          className="rounded-full bg-gradient-to-r from-[#8b6914] via-[#d4af37] to-[#8b6914] px-6 py-2.5 text-sm font-medium text-[#050505] disabled:opacity-60"
        >
          {busy ? "Adding…" : "Add table"}
        </button>
        <button type="button" onClick={onCancel} className="rounded-full border border-white/10 px-6 py-2.5 text-sm text-white/60">
          Cancel
        </button>
      </div>
    </form>
  );
}
