"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AdminShell } from "@/components/admin/layout/AdminShell";
import { ReservationProvider } from "@/components/providers/ReservationProvider";
import { AdminAuthProvider, useAdminAuth } from "@/contexts/AdminAuthContext";
import { ADMIN_BASE, canAccess, landingFor } from "@/lib/admin/navigation";

function AdminRouteGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { status, admin } = useAdminAuth();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace(`${ADMIN_BASE}/login?next=${encodeURIComponent(pathname)}`);
      return;
    }
    // Hiding a link is not access control — a server typing the URL for menu
    // management or settings must still be turned away. The API enforces this
    // too; this stops the page from rendering at all.
    if (status === "authenticated" && !canAccess(admin?.role, pathname)) {
      router.replace(landingFor(admin?.role));
    }
  }, [pathname, router, status, admin?.role]);

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#050505] px-6">
        <div className="relative flex flex-col items-center gap-5 text-center">
          <div className="absolute inset-0 -z-10 blur-3xl">
            <div className="h-24 w-24 rounded-full bg-[#d4af37]/15" />
          </div>
          <div className="h-12 w-12 animate-spin rounded-full border border-[#d4af37]/15 border-t-[#d4af37]" />
          <div>
            <p className="font-[family-name:var(--font-accent)] text-[10px] tracking-[0.32em] text-[#d4af37] uppercase">
              Secure Console
            </p>
            <p className="mt-2 text-sm text-white/45">Verifying admin access</p>
          </div>
        </div>
      </div>
    );
  }

  if (status !== "authenticated") {
    return null;
  }

  return <>{children}</>;
}

export function AdminLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLogin =
    pathname === `${ADMIN_BASE}/login` ||
    pathname === "/admin/login" ||
    (typeof pathname === "string" && pathname.endsWith("/login"));

  return (
    <AdminAuthProvider>
      {isLogin ? (
        children
      ) : (
        <AdminRouteGuard>
          <ReservationProvider loadOnMount>
            <AdminShell>{children}</AdminShell>
          </ReservationProvider>
        </AdminRouteGuard>
      )}
    </AdminAuthProvider>
  );
}
