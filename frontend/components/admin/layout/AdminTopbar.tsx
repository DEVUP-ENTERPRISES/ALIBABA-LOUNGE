"use client";

import { Bell, LogOut, Menu, PanelLeftClose, PanelLeft, Search } from "lucide-react";
import { useAdminAuth } from "@/contexts/AdminAuthContext";

interface AdminTopbarProps {
  onMenuClick: () => void;
  onToggleCollapse: () => void;
  collapsed: boolean;
  title: string;
}

export function AdminTopbar({
  onMenuClick,
  onToggleCollapse,
  collapsed,
  title,
}: AdminTopbarProps) {
  const { admin, logout } = useAdminAuth();
  const initials =
    admin?.name
      ?.split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "SA";

  return (
    <header className="sticky top-0 z-20 flex min-h-16 items-center justify-between gap-4 border-b border-[#d4af37]/12 bg-[#050505]/84 px-4 shadow-[0_12px_45px_rgba(0,0,0,0.28)] backdrop-blur-2xl md:px-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          className="rounded-xl border border-white/10 bg-white/[0.04] p-2 text-white/60 transition hover:border-[#d4af37]/30 hover:text-[#d4af37] lg:hidden"
          onClick={onMenuClick}
          aria-label="Open sidebar"
        >
          <Menu className="size-5" />
        </button>
        <button
          type="button"
          className="hidden rounded-xl border border-white/10 bg-white/[0.04] p-2 text-white/60 transition hover:border-[#d4af37]/30 hover:text-[#d4af37] lg:inline-flex"
          onClick={onToggleCollapse}
          aria-label="Toggle sidebar"
        >
          {collapsed ? (
            <PanelLeft className="size-5" />
          ) : (
            <PanelLeftClose className="size-5" />
          )}
        </button>
        <div>
          <p className="font-[family-name:var(--font-accent)] text-[9px] tracking-[0.3em] text-[#d4af37]/60 uppercase">
            Sheesh Admin
          </p>
          <h1 className="font-[family-name:var(--font-display)] text-lg text-white md:text-xl">
            {title}
          </h1>
        </div>
      </div>
      <div className="flex min-w-0 items-center gap-2 sm:gap-3">
        <div className="relative hidden w-[min(28vw,320px)] lg:block">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-white/25" />
          <div className="h-10 rounded-2xl border border-white/[0.07] bg-white/[0.04] pl-10 pr-4 text-xs leading-10 text-white/28">
            Search operations...
          </div>
        </div>
        <button
          type="button"
          className="relative hidden size-10 items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.03] text-white/45 transition hover:border-[#d4af37]/30 hover:text-[#d4af37] sm:inline-flex"
          aria-label="Notifications"
        >
          <Bell className="size-4" />
          <span className="absolute right-2 top-2 size-1.5 rounded-full bg-[#d4af37]" />
        </button>
        <div className="hidden text-right sm:block">
          <p className="max-w-36 truncate font-[family-name:var(--font-body)] text-xs text-white/85">
            {admin?.name ?? "Admin User"}
          </p>
          <p className="font-[family-name:var(--font-body)] text-[10px] text-white/40">
            {admin?.role === "super-admin" ? "Executive Access" : "Dallas Operations"}
          </p>
        </div>
        <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl border border-[#d4af37]/30 bg-[#d4af37]/10 font-[family-name:var(--font-accent)] text-xs text-[#d4af37] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
          {initials}
        </div>
        <button
          type="button"
          onClick={() => void logout()}
          className="hidden size-10 items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.03] text-white/40 transition hover:border-rose-400/25 hover:text-rose-200 md:inline-flex"
          aria-label="Logout"
        >
          <LogOut className="size-4" />
        </button>
      </div>
    </header>
  );
}
