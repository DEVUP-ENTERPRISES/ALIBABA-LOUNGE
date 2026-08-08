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
    <header className="sticky top-0 z-20 flex min-h-16 items-center justify-between gap-4 border-b border-zinc-800 bg-zinc-950/80 px-4 backdrop-blur-xl md:px-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          className="rounded-lg border border-zinc-800 bg-zinc-900 p-2 text-zinc-400 transition hover:bg-zinc-800 hover:text-zinc-100 lg:hidden"
          onClick={onMenuClick}
          aria-label="Open sidebar"
        >
          <Menu className="size-5" />
        </button>
        <button
          type="button"
          className="hidden rounded-lg border border-zinc-800 bg-zinc-900 p-2 text-zinc-400 transition hover:bg-zinc-800 hover:text-zinc-100 lg:inline-flex"
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
          <p className="text-[10px] font-medium tracking-wider text-zinc-500 uppercase">
            Alibaba Admin
          </p>
          <h1 className="text-lg font-bold text-zinc-100 md:text-xl">
            {title}
          </h1>
        </div>
      </div>
      <div className="flex min-w-0 items-center gap-2 sm:gap-3">
        <div className="relative hidden w-[min(28vw,320px)] lg:block">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-zinc-500" />
          <div className="h-10 rounded-lg border border-zinc-800 bg-zinc-900/50 pl-10 pr-4 text-xs leading-10 text-zinc-400">
            Search operations...
          </div>
        </div>
        <button
          type="button"
          className="relative hidden size-10 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-400 transition hover:bg-zinc-800 hover:text-zinc-100 sm:inline-flex"
          aria-label="Notifications"
        >
          <Bell className="size-4" />
          <span className="absolute right-2 top-2 size-1.5 rounded-full bg-blue-500" />
        </button>
        <div className="hidden text-right sm:block">
          <p className="max-w-36 truncate text-sm font-medium text-zinc-100">
            {admin?.name ?? "Admin User"}
          </p>
          <p className="text-xs text-zinc-500">
            {admin?.role === "super-admin" ? "Executive Access" : "Dallas Operations"}
          </p>
        </div>
        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-sm font-semibold text-zinc-100">
          {initials}
        </div>
        <button
          type="button"
          onClick={() => void logout()}
          className="hidden size-10 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-400 transition hover:border-rose-900 hover:text-rose-400 md:inline-flex"
          aria-label="Logout"
        >
          <LogOut className="size-4" />
        </button>
      </div>
    </header>
  );
}
