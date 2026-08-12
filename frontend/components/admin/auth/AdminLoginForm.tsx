"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ShieldCheck,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { ADMIN_BASE } from "@/lib/admin/navigation";

type ToastState = {
  type: "success" | "error";
  message: string;
} | null;

export function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, status } = useAdminAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<ToastState>(null);
  const [fieldError, setFieldError] = useState<string | null>(null);

  const nextPath = useMemo(() => {
    const next = searchParams.get("next");
    return next?.startsWith(ADMIN_BASE) &&
      next !== ADMIN_BASE &&
      next !== `${ADMIN_BASE}/login`
      ? next
      : `${ADMIN_BASE}/dashboard`;
  }, [searchParams]);

  useEffect(() => {
    if (status === "authenticated") {
      router.replace(nextPath);
    }
  }, [nextPath, router, status]);

  const showToast = (nextToast: ToastState) => {
    setToast(nextToast);
    window.setTimeout(() => setToast(null), 3600);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFieldError(null);

    if (!email.trim() || !password) {
      setFieldError("Enter your admin email and password.");
      showToast({ type: "error", message: "Complete all secure login fields." });
      return;
    }

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setFieldError("Enter a valid email address.");
      showToast({ type: "error", message: "Email format is invalid." });
      return;
    }

    setSubmitting(true);

    try {
      await login({ email, password, rememberMe });
      showToast({ type: "success", message: "Access granted. Opening console." });
      router.replace(nextPath);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to sign in.";
      setFieldError(message);
      showToast({ type: "error", message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-zinc-950 px-4 py-6 text-zinc-50 sm:px-6 lg:px-8">
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.02)_0_1px,transparent_1px_72px)] opacity-25" />

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -18, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.98 }}
            className={cn(
              "fixed top-5 right-4 z-50 flex max-w-sm items-center gap-3 rounded-2xl border px-4 py-3 text-sm shadow-[0_18px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl",
              toast.type === "success"
                ? "border-emerald-400/25 bg-emerald-500/10 text-emerald-100"
                : "border-rose-400/25 bg-rose-500/10 text-rose-100"
            )}
          >
            {toast.type === "success" ? (
              <CheckCircle2 className="size-4 shrink-0" />
            ) : (
              <AlertCircle className="size-4 shrink-0" />
            )}
            <span>{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="relative z-10 mx-auto grid min-h-[calc(100vh-3rem)] w-full max-w-7xl items-center gap-8 lg:grid-cols-[0.95fr_1.05fr]">
        <motion.section
          initial={{ opacity: 0, x: -28 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="hidden lg:block"
        >
          <div className="max-w-xl">
            <p className="text-[11px] font-semibold tracking-wider text-zinc-500 uppercase">
              Alibaba Admin
            </p>
            <h1 className="mt-6 text-5xl font-bold tracking-tight text-zinc-100 xl:text-6xl">
              Hospitality control, refined.
            </h1>
            <p className="mt-6 max-w-lg text-base leading-8 text-zinc-400">
              A secure command center for reservations, guest flow, table
              orders, and events.
            </p>
          </div>

          <div className="mt-12 grid max-w-xl grid-cols-3 gap-3">
            {[
              ["128", "Reservations"],
              ["14", "Pending"],
              ["Live", "Operations"],
            ].map(([value, label]) => (
              <div
                key={label}
                className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 shadow-sm"
              >
                <p className="text-2xl font-bold text-zinc-100">
                  {value}
                </p>
                <p className="mt-1 text-[10px] font-medium tracking-wider text-zinc-500 uppercase">
                  {label}
                </p>
              </div>
            ))}
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: "easeOut" }}
          className="mx-auto w-full max-w-[480px] lg:mr-0"
        >
          <div className="relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/80 p-6 shadow-xl backdrop-blur-xl sm:p-8">
            <div className="relative">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[10px] font-semibold tracking-wider text-zinc-500 uppercase">
                    Secure Login
                  </p>
                  <h2 className="mt-2 text-2xl font-bold text-zinc-100 sm:text-3xl">
                    Admin Portal
                  </h2>
                </div>
                <div className="flex size-12 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500">
                  <ShieldCheck className="size-5" />
                </div>
              </div>

              <form noValidate onSubmit={handleSubmit} className="mt-8 space-y-5">
                <label className="block space-y-2">
                  <span className="text-xs font-medium text-zinc-400">
                    Email address
                  </span>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-zinc-500" />
                    <Input
                      type="email"
                      autoComplete="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder="admin@sheesh.com"
                      className="h-12 rounded-lg bg-zinc-950 pl-10 border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </label>

                <label className="block space-y-2">
                  <span className="text-xs font-medium text-zinc-400">
                    Password
                  </span>
                  <div className="relative">
                    <LockKeyhole className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-zinc-500" />
                    <Input
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder="Enter secure password"
                      className="h-12 rounded-lg bg-zinc-950 px-10 border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((value) => !value)}
                      className="absolute top-1/2 right-3 inline-flex size-8 -translate-y-1/2 items-center justify-center rounded-md text-zinc-500 transition hover:bg-zinc-800 hover:text-zinc-300"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                </label>

                <div className="flex flex-col gap-3 text-sm text-zinc-400 sm:flex-row sm:items-center sm:justify-between">
                  <label className="inline-flex cursor-pointer items-center gap-2.5">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(event) => setRememberMe(event.target.checked)}
                      className="size-4 rounded border-zinc-700 bg-zinc-950 text-blue-600 focus:ring-blue-500 focus:ring-offset-zinc-900"
                    />
                    <span>Remember this console</span>
                  </label>
                  <span className="text-xs text-zinc-600">JWT secured session</span>
                </div>

                {fieldError && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-lg border border-rose-900/50 bg-rose-500/10 px-4 py-3 text-sm text-rose-200"
                  >
                    {fieldError}
                  </motion.p>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="flex h-12 w-full items-center justify-center rounded-lg bg-blue-600 px-5 text-sm font-medium text-white transition-colors hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-zinc-900 disabled:pointer-events-none disabled:opacity-50"
                >
                  <span className="relative">
                    {submitting ? "Authenticating..." : "Sign in to Dashboard"}
                  </span>
                </button>
              </form>
            </div>
          </div>
        </motion.section>
      </main>
    </div>
  );
}
