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
    <div className="relative min-h-screen overflow-hidden bg-[#050505] px-4 py-6 text-white sm:px-6 lg:px-8">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(212,175,55,0.12),transparent_32%),radial-gradient(ellipse_at_bottom_right,rgba(245,230,200,0.06),transparent_34%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.035)_0_1px,transparent_1px_72px)] opacity-25" />
      <div className="film-grain pointer-events-none absolute inset-0 opacity-55" />

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
            <p className="font-[family-name:var(--font-accent)] text-[11px] tracking-[0.42em] text-[#d4af37] uppercase">
              Sheesh Admin
            </p>
            <h1 className="mt-6 font-[family-name:var(--font-display)] text-6xl leading-[0.95] tracking-wide text-white xl:text-7xl">
              Hospitality control, refined.
            </h1>
            <p className="mt-6 max-w-lg text-base leading-8 text-white/55">
              A secure command center for reservations, guest flow, events,
              catering, and franchise operations.
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
                className="rounded-2xl border border-white/[0.07] bg-white/[0.035] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-md"
              >
                <p className="font-[family-name:var(--font-display)] text-2xl text-[#d4af37]">
                  {value}
                </p>
                <p className="mt-1 text-[10px] tracking-[0.2em] text-white/35 uppercase">
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
          <div className="relative overflow-hidden rounded-[1.75rem] border border-[#d4af37]/15 bg-[#0b0b0d]/78 p-5 shadow-[0_24px_90px_rgba(0,0,0,0.62)] backdrop-blur-2xl sm:p-7">
            <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-[#d4af37]/70 to-transparent" />
            <div className="absolute -top-32 right-8 h-56 w-56 rounded-full bg-[#d4af37]/10 blur-3xl" />

            <div className="relative">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-[family-name:var(--font-accent)] text-[10px] tracking-[0.34em] text-[#d4af37] uppercase">
                    Secure Login
                  </p>
                  <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl text-white sm:text-4xl">
                    Admin Portal
                  </h2>
                </div>
                <div className="flex size-12 items-center justify-center rounded-2xl border border-[#d4af37]/20 bg-[#d4af37]/10 text-[#d4af37] shadow-[0_0_32px_rgba(212,175,55,0.08)]">
                  <ShieldCheck className="size-5" />
                </div>
              </div>

              <form noValidate onSubmit={handleSubmit} className="mt-8 space-y-5">
                <label className="block space-y-2">
                  <span className="text-xs tracking-[0.18em] text-white/45 uppercase">
                    Email
                  </span>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-[#d4af37]/55" />
                    <Input
                      type="email"
                      autoComplete="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder="admin@sheesh.com"
                      className="h-[52px] rounded-2xl bg-[#111114]/85 pl-11"
                    />
                  </div>
                </label>

                <label className="block space-y-2">
                  <span className="text-xs tracking-[0.18em] text-white/45 uppercase">
                    Password
                  </span>
                  <div className="relative">
                    <LockKeyhole className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-[#d4af37]/55" />
                    <Input
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder="Enter secure password"
                      className="h-[52px] rounded-2xl bg-[#111114]/85 pr-12 pl-11"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((value) => !value)}
                      className="absolute top-1/2 right-3 inline-flex size-9 -translate-y-1/2 items-center justify-center rounded-xl text-white/45 transition hover:bg-white/[0.05] hover:text-[#d4af37]"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                </label>

                <div className="flex flex-col gap-3 text-sm text-white/50 sm:flex-row sm:items-center sm:justify-between">
                  <label className="inline-flex cursor-pointer items-center gap-3">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(event) => setRememberMe(event.target.checked)}
                      className="size-4 rounded border border-[#d4af37]/30 bg-[#111114] accent-[#d4af37]"
                    />
                    <span>Remember this console</span>
                  </label>
                  <span className="text-xs text-white/30">JWT secured session</span>
                </div>

                {fieldError && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-100"
                  >
                    {fieldError}
                  </motion.p>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="group relative flex h-[52px] w-full items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-r from-[#8b6914] via-[#d4af37] to-[#f0d77a] px-5 font-[family-name:var(--font-accent)] text-xs font-semibold tracking-[0.24em] text-[#050505] uppercase shadow-[0_18px_48px_rgba(212,175,55,0.16)] transition duration-300 hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <span className="absolute inset-0 translate-x-[-120%] bg-gradient-to-r from-transparent via-white/35 to-transparent transition-transform duration-700 group-hover:translate-x-[120%]" />
                  <span className="relative">
                    {submitting ? "Authenticating..." : "Enter Control Center"}
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
