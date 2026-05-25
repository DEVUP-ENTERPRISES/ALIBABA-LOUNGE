"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Eye, EyeOff, ArrowRight, AlertCircle, Check } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { menuImages } from "@/lib/menu-images";

const PW_RULES = [
  { label: "At least 8 characters", test: (p: string) => p.length >= 8 },
  { label: "One uppercase letter",  test: (p: string) => /[A-Z]/.test(p) },
  { label: "One number",            test: (p: string) => /\d/.test(p) },
];

export default function SignupPage() {
  return (
    <Suspense>
      <SignupForm />
    </Suspense>
  );
}

function SignupForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") ?? "/";
  const { signUpWithEmail, signInWithGoogle } = useAuth();

  const [name, setName]         = useState("");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw]     = useState(false);
  const [loading, setLoading]   = useState(false);
  const [googleLoad, setGoogleLoad] = useState(false);
  const [error, setError]       = useState("");

  const pwStrength = PW_RULES.filter((r) => r.test(password)).length;

  const friendlyError = (code: string) => {
    const map: Record<string, string> = {
      "auth/email-already-in-use":  "An account with this email already exists.",
      "auth/invalid-email":         "Please enter a valid email address.",
      "auth/weak-password":         "Password must be at least 6 characters.",
      "auth/popup-closed-by-user":  "",
    };
    return map[code] || "Something went wrong. Please try again.";
  };

  const handleGoogle = async () => {
    setError(""); setGoogleLoad(true);
    try {
      await signInWithGoogle();
      router.push(next);
    } catch (e: unknown) {
      const code = (e as { code?: string }).code ?? "";
      const msg = friendlyError(code);
      if (msg) setError(msg);
    } finally {
      setGoogleLoad(false);
    }
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (pwStrength < PW_RULES.length) {
      setError("Please meet all password requirements.");
      return;
    }
    setError(""); setLoading(true);
    try {
      await signUpWithEmail(email, password, name.trim());
      router.push(next);
    } catch (e: unknown) {
      setError(friendlyError((e as { code?: string }).code ?? ""));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* ── Brand Panel ── */}
      <div className="relative hidden w-[52%] flex-col justify-between overflow-hidden lg:flex">
        <Image
          src={menuImages.experience}
          alt="Sheesh experience"
          fill
          className="object-cover"
          priority
          sizes="52vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#050505]/95 via-[#050505]/60 to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(212,175,55,0.12),transparent_55%)]" />

        <div className="relative z-10 p-12">
          <Link href="/" className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full border border-[#d4af37]/60 bg-[#d4af37]/10" />
            <span className="font-[family-name:var(--font-display)] text-lg tracking-[0.15em] text-white uppercase">
              Sheesh
            </span>
          </Link>
        </div>

        <div className="relative z-10 p-12">
          <p className="font-[family-name:var(--font-accent)] text-[10px] tracking-[0.4em] text-[#d4af37] uppercase">
            Join the Experience
          </p>
          <h2 className="mt-3 font-[family-name:var(--font-display)] text-4xl leading-tight tracking-wide text-white uppercase">
            Your Table Awaits.<br />Your Night Begins.
          </h2>
          <div className="mt-6 h-px w-16 bg-[#d4af37]/40" />

          {/* Perks */}
          <ul className="mt-8 space-y-3">
            {[
              "Priority reservation access",
              "Exclusive member events",
              "Personalized lounge experience",
            ].map((perk) => (
              <li key={perk} className="flex items-center gap-3">
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-[#d4af37]/40 bg-[#d4af37]/10">
                  <Check size={10} className="text-[#d4af37]" />
                </div>
                <span className="font-[family-name:var(--font-body)] text-sm text-white/60">
                  {perk}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* ── Form Panel ── */}
      <div className="flex flex-1 items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-[420px]"
        >
          {/* Mobile logo */}
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="h-6 w-6 rounded-full border border-[#d4af37]/60 bg-[#d4af37]/10" />
            <span className="font-[family-name:var(--font-display)] text-base tracking-[0.12em] text-white uppercase">
              Sheesh
            </span>
          </div>

          <h1 className="font-[family-name:var(--font-display)] text-3xl tracking-wide text-white uppercase">
            Create Account
          </h1>
          <p className="mt-2 font-[family-name:var(--font-body)] text-sm text-white/50">
            Join Dallas&apos;s most exclusive lounge experience.
          </p>

          {/* Google */}
          <button
            onClick={handleGoogle}
            disabled={googleLoad}
            className="mt-8 flex w-full items-center justify-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-5 py-3.5 font-[family-name:var(--font-body)] text-sm text-white transition-all duration-300 hover:border-[#d4af37]/40 hover:bg-[#d4af37]/5 disabled:opacity-50"
          >
            {googleLoad ? <Spinner /> : <GoogleIcon />}
            Continue with Google
          </button>

          <Divider />

          <form onSubmit={handleSubmit} className="space-y-4">
            <AuthInput
              label="Full Name"
              type="text"
              value={name}
              onChange={setName}
              placeholder="Your name"
              autoComplete="name"
            />
            <AuthInput
              label="Email"
              type="email"
              value={email}
              onChange={setEmail}
              placeholder="you@example.com"
              autoComplete="email"
            />
            <div className="relative">
              <AuthInput
                label="Password"
                type={showPw ? "text" : "password"}
                value={password}
                onChange={setPassword}
                placeholder="••••••••"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPw((p) => !p)}
                className="absolute right-4 top-9 text-white/30 hover:text-white/60 transition-colors"
              >
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {/* Password strength */}
            {password.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="space-y-2"
              >
                <div className="flex gap-1.5">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className={`h-0.5 flex-1 rounded-full transition-colors duration-300 ${
                        i < pwStrength
                          ? pwStrength === 1 ? "bg-red-500"
                          : pwStrength === 2 ? "bg-amber-400"
                          : "bg-[#d4af37]"
                          : "bg-white/10"
                      }`}
                    />
                  ))}
                </div>
                <div className="grid grid-cols-1 gap-1">
                  {PW_RULES.map((rule) => (
                    <div key={rule.label} className="flex items-center gap-2">
                      <div className={`h-3.5 w-3.5 rounded-full border flex items-center justify-center transition-colors duration-200 ${
                        rule.test(password)
                          ? "border-[#d4af37] bg-[#d4af37]/20"
                          : "border-white/15"
                      }`}>
                        {rule.test(password) && <Check size={8} className="text-[#d4af37]" />}
                      </div>
                      <span className={`font-[family-name:var(--font-body)] text-[11px] transition-colors ${
                        rule.test(password) ? "text-white/50" : "text-white/25"
                      }`}>
                        {rule.label}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {error && <ErrorMsg msg={error} />}

            <AuthButton loading={loading}>Create Account</AuthButton>

            <p className="pt-1 font-[family-name:var(--font-body)] text-[11px] leading-relaxed text-white/25 text-center">
              By creating an account, you agree to our{" "}
              <span className="text-white/40">Terms of Service</span> and{" "}
              <span className="text-white/40">Privacy Policy</span>.
            </p>
          </form>

          <p className="mt-6 text-center font-[family-name:var(--font-body)] text-sm text-white/40">
            Already have an account?{" "}
            <Link href="/login" className="text-[#d4af37] hover:text-[#f0cc58] transition-colors">
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}

/* ── Shared sub-components ── */

function AuthInput({ label, type, value, onChange, placeholder, autoComplete }: {
  label: string; type: string; value: string;
  onChange: (v: string) => void; placeholder: string; autoComplete?: string;
}) {
  return (
    <div>
      <label className="mb-1.5 block font-[family-name:var(--font-accent)] text-[10px] tracking-[0.2em] text-white/50 uppercase">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        required
        className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3.5 font-[family-name:var(--font-body)] text-sm text-white placeholder:text-white/20 outline-none transition-all duration-300 focus:border-[#d4af37]/50 focus:bg-[#d4af37]/[0.03] focus:ring-1 focus:ring-[#d4af37]/20"
      />
    </div>
  );
}

function AuthButton({ children, loading }: { children: React.ReactNode; loading: boolean }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="group flex w-full items-center justify-center gap-2 rounded-xl bg-[#d4af37] px-5 py-3.5 font-[family-name:var(--font-accent)] text-[11px] tracking-[0.2em] text-[#050505] uppercase transition-all duration-300 hover:bg-[#f0cc58] hover:shadow-[0_8px_30px_rgba(212,175,55,0.35)] disabled:opacity-60"
    >
      {loading ? <Spinner dark /> : (
        <>
          {children}
          <ArrowRight size={14} className="transition-transform duration-300 group-hover:translate-x-1" />
        </>
      )}
    </button>
  );
}

function Divider() {
  return (
    <div className="my-6 flex items-center gap-4">
      <div className="h-px flex-1 bg-white/[0.06]" />
      <span className="font-[family-name:var(--font-body)] text-[11px] text-white/25">or</span>
      <div className="h-px flex-1 bg-white/[0.06]" />
    </div>
  );
}

function ErrorMsg({ msg }: { msg: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/5 px-4 py-3"
    >
      <AlertCircle size={14} className="shrink-0 text-red-400" />
      <p className="font-[family-name:var(--font-body)] text-xs text-red-400">{msg}</p>
    </motion.div>
  );
}

function Spinner({ dark }: { dark?: boolean }) {
  return (
    <svg className={`h-4 w-4 animate-spin ${dark ? "text-[#050505]" : "text-white/60"}`} viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}
