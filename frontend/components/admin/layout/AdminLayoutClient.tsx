"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AdminShell } from "@/components/admin/layout/AdminShell";
import { ReservationProvider } from "@/components/providers/ReservationProvider";
import { AdminAuthProvider, useAdminAuth } from "@/contexts/AdminAuthContext";
import { ADMIN_BASE } from "@/lib/admin/navigation";

function AdminRouteGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { status } = useAdminAuth();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace(`${ADMIN_BASE}/login?next=${encodeURIComponent(pathname)}`);
    }
  }, [pathname, router, status]);

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
  const isLogin = pathname === `${ADMIN_BASE}/login`;

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
