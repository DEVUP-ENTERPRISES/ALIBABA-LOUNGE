import { Suspense } from "react";
import { AdminLoginForm } from "@/components/admin/auth/AdminLoginForm";

export const metadata = {
  title: "Admin Login | Sheesh Eatery & Lounge",
  robots: { index: false, follow: false },
};

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#050505] text-white/50">
          Loading secure portal...
        </div>
      }
    >
      <AdminLoginForm />
    </Suspense>
  );
}
