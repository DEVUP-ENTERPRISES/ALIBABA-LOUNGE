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
  Star,
  LayoutGrid,
  UserCog,
  Heart,
} from "lucide-react";
import { navItemsFor, ADMIN_BASE } from "@/lib/admin/navigation";
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
  star: Star,
  users: Users,
  "clipboard-list": ClipboardList,
  "layout-grid": LayoutGrid,
  "user-cog": UserCog,
  heart: Heart,
  settings: Settings,
};

interface AdminSidebarProps {
  open: boolean;
  onClose: () => void;
  collapsed: boolean;
}

export function AdminSidebar({ open, onClose, collapsed }: AdminSidebarProps) {
  const pathname = usePathname();
  const { admin, logout } = useAdminAuth();

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
          "fixed top-0 left-0 z-50 flex h-full flex-col border-r border-zinc-800 bg-zinc-950 transition-all duration-300 lg:z-30",
          collapsed ? "w-[72px]" : "w-64",
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="relative flex h-16 items-center justify-between border-b border-zinc-800 px-4">
          {!collapsed && (
            <Link href={`${ADMIN_BASE}/dashboard`} className="block">
              <span className="text-lg font-bold tracking-tight text-zinc-100">
                Alibaba
              </span>
              <span className="block text-[10px] font-medium tracking-wider text-zinc-400 uppercase">
                Admin
              </span>
            </Link>
          )}
          <button
            type="button"
            className="rounded-md p-1 text-zinc-400 hover:text-zinc-100 lg:hidden"
            onClick={onClose}
          >
            <X className="size-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {navItemsFor(admin?.role).map((item) => {
            const Icon = icons[item.icon];
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                title={collapsed ? item.label : undefined}
                className={cn(
                  "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-zinc-800 text-zinc-50"
                    : "text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-50"
                )}
              >
                {Icon && <Icon className="size-4 shrink-0" />}
                {!collapsed && (
                  <span>
                    {item.label}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-zinc-800 p-3">
          <button
            type="button"
            onClick={() => void logout()}
            className={cn(
              "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-zinc-400 transition-colors hover:bg-zinc-800/50 hover:text-rose-400"
            )}
          >
            <LogOut className="size-4 shrink-0" />
            {!collapsed && (
              <span>
                Logout
              </span>
            )}
          </button>
        </div>
      </aside>
    </>
  );
}
