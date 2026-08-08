"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { AdminSidebar } from "@/components/admin/layout/AdminSidebar";
import { AdminTopbar } from "@/components/admin/layout/AdminTopbar";
import { adminNavItems } from "@/lib/admin/navigation";
import { cn } from "@/lib/utils";

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  // Derive page title from nav items (slug-aware hrefs)
  const title =
    adminNavItems.find((n) => pathname === n.href)?.label ??
    adminNavItems.find((n) => pathname.startsWith(n.href))?.label ??
    "Admin";

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 font-sans">
      <AdminSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        collapsed={collapsed}
      />
      <div
        className={cn(
          "relative transition-[margin] duration-300",
          collapsed ? "lg:ml-[72px]" : "lg:ml-64"
        )}
      >
        <AdminTopbar
          title={title}
          onMenuClick={() => setSidebarOpen(true)}
          onToggleCollapse={() => setCollapsed(!collapsed)}
          collapsed={collapsed}
        />
        <div className="p-4 md:p-6 lg:p-8">
          <div className="mx-auto max-w-[1500px]">{children}</div>
        </div>
      </div>
    </div>
  );
}
