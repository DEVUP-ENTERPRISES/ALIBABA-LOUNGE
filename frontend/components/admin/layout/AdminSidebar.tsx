"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  UtensilsCrossed,
  Calendar,
  BookOpen,
  ClipboardList,
  Building2,
  ImageIcon,
  Settings,
  LogOut,
  X,
  Users,
} from "lucide-react";
import { adminNavItems, ADMIN_BASE } from "@/lib/admin/navigation";
import { cn } from "@/lib/utils";
import { useAdminAuth } from "@/contexts/AdminAuthContext";

const icons: Record<string, React.ComponentType<{ className?: string }>> = {
  "layout-dashboard": LayoutDashboard,
  utensils: UtensilsCrossed,
  calendar: Calendar,
  "book-open": BookOpen,
  "concierge-bell": ClipboardList,
  building: Building2,
  image: ImageIcon,
  users: Users,
  settings: Settings,
};

interface AdminSidebarProps {
  open: boolean;
  onClose: () => void;
  collapsed: boolean;
}

export function AdminSidebar({ open, onClose, collapsed }: AdminSidebarProps) {
  const pathname = usePathname();
  const { logout } = useAdminAuth();

  return (
    <>
      {open && (
        <button
          type="button"
          aria-label="Close menu"
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 flex h-full flex-col border-r border-[#d4af37]/12 bg-[#050505]/92 shadow-[18px_0_60px_rgba(0,0,0,0.32)] backdrop-blur-2xl transition-all duration-300 lg:z-30",
          collapsed ? "w-[72px]" : "w-64",
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="relative flex h-16 items-center justify-between border-b border-white/[0.06] px-4">
          <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[#d4af37]/45 to-transparent" />
          {!collapsed && (
            <Link href={`${ADMIN_BASE}/dashboard`} className="block">
              <span className="font-[family-name:var(--font-display)] text-lg tracking-[0.12em] text-white uppercase">
                Sheesh
              </span>
              <span className="block font-[family-name:var(--font-accent)] text-[8px] tracking-[0.3em] text-[#d4af37]/70 uppercase">
                Admin
              </span>
            </Link>
          )}
          <button
            type="button"
            className="rounded-lg p-1 text-white/50 lg:hidden"
            onClick={onClose}
          >
            <X className="size-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {adminNavItems.map((item) => {
            const Icon = icons[item.icon];
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                title={collapsed ? item.label : undefined}
                className={cn(
                  "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all duration-300",
                  active
                    ? "bg-[#d4af37]/15 text-[#d4af37] shadow-[inset_0_1px_0_rgba(212,175,55,0.12),0_10px_28px_rgba(212,175,55,0.06)]"
                    : "text-white/50 hover:bg-white/[0.045] hover:text-white"
                )}
              >
                {Icon && <Icon className="size-4 shrink-0 transition-transform duration-300 group-hover:scale-105" />}
                {!collapsed && (
                  <span className="font-[family-name:var(--font-body)] text-xs tracking-wide">
                    {item.label}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-white/[0.06] p-3">
          <button
            type="button"
            onClick={() => void logout()}
            className={cn(
              "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-white/40 transition-colors hover:bg-white/[0.04] hover:text-rose-200"
            )}
          >
            <LogOut className="size-4 shrink-0" />
            {!collapsed && (
              <span className="font-[family-name:var(--font-body)] text-xs">
                Logout
              </span>
            )}
          </button>
        </div>
      </aside>
    </>
  );
}
