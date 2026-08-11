"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  X,
  LogOut,
  User,
  ChevronDown,
  Calendar,
  Phone,
} from "lucide-react";
import { navLinks } from "@/lib/theme";
import { useScrollState } from "@/hooks/useScrollState";
import { useReservations } from "@/components/providers/ReservationProvider";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

/* ─── User avatar + dropdown ─────────────────────────────────── */
function UserAvatar() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  if (!user) return null;

  const name = user.displayName ?? user.email?.split("@")[0] ?? "Guest";
  const initials = name
    .split(" ")
    .map((w: string) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div ref={ref} className="relative">
      <motion.button
        onClick={() => setOpen((o) => !o)}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.97 }}
        className={cn(
          "group flex items-center gap-2 rounded-full py-1 pl-1 pr-3",
          "border border-white/12 bg-white/[0.04] backdrop-blur-sm",
          "transition-colors duration-300",
          "hover:border-[#d4af37]/50 hover:bg-[#d4af37]/[0.07]",
          open && "border-[#d4af37]/50 bg-[#d4af37]/[0.07]",
        )}
      >
        <div className="relative flex-shrink-0">
          <div className="flex h-7 w-7 items-center justify-center rounded-full border border-[#d4af37]/60 bg-gradient-to-br from-[#d4af37]/40 to-[#8b6914]/30 overflow-hidden">
            {user.photoURL ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.photoURL}
                alt=""
                className="h-7 w-7 rounded-full object-cover"
              />
            ) : (
              <span className="font-[family-name:var(--font-display)] text-[10px] text-[#d4af37]">
                {initials}
              </span>
            )}
          </div>
          <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full border-[1.5px] border-[#050505] bg-emerald-400" />
        </div>
        <span className="font-[family-name:var(--font-accent)] text-[9px] tracking-[0.12em] text-white/75 uppercase">
          {initials}
        </span>
        <ChevronDown
          size={10}
          className={cn(
            "flex-shrink-0 text-white/30 transition-transform duration-300",
            open && "rotate-180 text-[#d4af37]",
          )}
        />
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.95 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="absolute right-0 top-[calc(100%+12px)] w-56 overflow-hidden rounded-2xl border border-white/[0.08] bg-[#080808]/96 shadow-[0_24px_64px_rgba(0,0,0,0.7),0_0_0_1px_rgba(212,175,55,0.07)] backdrop-blur-2xl z-50"
          >
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#d4af37]/40 to-transparent" />
            <div className="border-b border-white/[0.06] px-4 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border border-[#d4af37]/40 bg-gradient-to-br from-[#d4af37]/20 to-[#8b6914]/10 overflow-hidden">
                  {user.photoURL ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={user.photoURL}
                      alt=""
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  ) : (
                    <span className="font-[family-name:var(--font-display)] text-sm text-[#d4af37]">
                      {initials}
                    </span>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="truncate font-[family-name:var(--font-display)] text-sm text-white">
                    {user.displayName ?? "Guest"}
                  </p>
                  <p className="truncate font-[family-name:var(--font-body)] text-[10px] text-white/35 mt-0.5">
                    {user.email}
                  </p>
                </div>
              </div>
            </div>
            <div className="p-1.5">
              <Link
                href="/account"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 font-[family-name:var(--font-body)] text-sm text-white/55 transition-all hover:bg-white/[0.05] hover:text-white"
              >
                <User size={13} className="text-[#d4af37]/50" /> My Account
              </Link>
              <button
                onClick={async () => {
                  setOpen(false);
                  await signOut();
                  router.push("/");
                }}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 font-[family-name:var(--font-body)] text-sm text-white/55 transition-all hover:bg-rose-500/[0.08] hover:text-rose-300"
              >
                <LogOut size={13} className="text-white/30" /> Sign Out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Main Navbar ─────────────────────────────────────────────── */
export function Navbar() {
  const scrolled = useScrollState(50);
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { openModal } = useReservations();
  const { user, signOut } = useAuth();
  const router = useRouter();

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    // The fixed Reserve bar sits at z-8000, above the drawer. Flag the open
    // state so CSS can hide it — otherwise it covers the drawer's own
    // actions and shows a second, duplicate "Reserve a Table".
    document.body.dataset.menuOpen = mobileOpen ? "true" : "false";
    return () => {
      document.body.style.overflow = "";
      delete document.body.dataset.menuOpen;
    };
  }, [mobileOpen]);

  const closeMobile = () => setMobileOpen(false);

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50",
          "transition-[background-color,border-color,box-shadow,backdrop-filter] duration-150",
          scrolled
            ? "border-b border-[#d4af37]/[0.1] bg-[#050505]/88 shadow-[0_2px_40px_rgba(0,0,0,0.5)] backdrop-blur-2xl"
            : "bg-transparent",
        )}
      >
        {/* Gold top shimmer line — visible when scrolled */}
        <div
          className={cn(
            "absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#d4af37]/60 to-transparent transition-opacity duration-150",
            scrolled ? "opacity-100" : "opacity-0",
          )}
        />

        <nav className="mx-auto flex h-[72px] max-w-[1400px] items-center gap-3 px-5 sm:px-8 lg:px-12">
          {/* ── Logo ── */}
          <div className="flex-shrink-0 mr-3">
            <Link
              href="/"
              onClick={closeMobile}
              aria-label="Alibaba Hookah Lounge — home"
              className="group block"
            >
              <Image
                src="/alibaba-logo.png"
                alt="Alibaba Hookah Lounge"
                width={979}
                height={324}
                priority
                sizes="176px"
                className="h-11 w-auto transition-[filter,opacity] duration-400 group-hover:brightness-110 group-hover:drop-shadow-[0_0_16px_rgba(212,175,55,0.45)] sm:h-12"
              />
            </Link>
          </div>

          {/* ── Nav links ── */}
          <ul className="hidden lg:flex flex-1 items-center justify-center gap-6 xl:gap-8 min-w-0">
            {navLinks.map((link, i) => {
              const active =
                pathname === link.href ||
                (link.href !== "/" && pathname.startsWith(link.href));
              return (
                <motion.li
                  key={link.href}
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.06, duration: 0.5 }}
                  className="flex-shrink-0"
                >
                  <Link
                    href={link.href}
                    className={cn(
                      "group relative py-1 font-[family-name:var(--font-body)] text-[11px] tracking-[0.22em] uppercase transition-colors duration-300 whitespace-nowrap",
                      active
                        ? "text-white"
                        : "text-white/50 hover:text-white/90",
                    )}
                  >
                    {link.label}
                    {/* Active gold dot */}
                    {active && (
                      <motion.span
                        layoutId="nav-dot"
                        className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 size-1 rounded-full bg-[#d4af37]"
                        style={{ boxShadow: "0 0 6px rgba(212,175,55,0.8)" }}
                      />
                    )}
                    {/* Hover underline */}
                    <span
                      className={cn(
                        "absolute -bottom-1 left-0 h-px bg-gradient-to-r from-transparent via-[#d4af37]/60 to-transparent transition-all duration-400",
                        active
                          ? "w-full opacity-0"
                          : "w-0 opacity-0 group-hover:w-full group-hover:opacity-100",
                      )}
                    />
                  </Link>
                </motion.li>
              );
            })}
          </ul>

          {/* ── Right controls ── */}
          <div className="ml-auto lg:ml-0 flex flex-shrink-0 items-center gap-2.5">
            {/* Desktop */}
            <motion.div
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="hidden lg:flex items-center gap-2.5"
            >
              {user ? (
                <>
                  <motion.button
                    type="button"
                    onClick={openModal}
                    whileHover={{
                      scale: 1.04,
                      boxShadow: "0 0 20px rgba(212,175,55,0.25)",
                    }}
                    whileTap={{ scale: 0.97 }}
                    className="flex items-center gap-1.5 rounded-full border border-[#d4af37]/40 bg-[#d4af37]/8 px-4 py-2 font-[family-name:var(--font-accent)] text-[9.5px] tracking-[0.25em] text-[#d4af37] uppercase transition-colors duration-300 hover:border-[#d4af37]/70 hover:bg-[#d4af37]/12 whitespace-nowrap"
                  >
                    <Calendar size={11} />
                    Reserve
                  </motion.button>
                  <UserAvatar />
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="font-[family-name:var(--font-body)] text-[11px] tracking-[0.15em] text-white/45 uppercase transition-colors hover:text-white/80 whitespace-nowrap"
                  >
                    Sign In
                  </Link>
                  <motion.div
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <Link
                      href="/signup"
                      className="flex items-center rounded-full border border-[#d4af37]/40 bg-[#d4af37]/8 px-4 py-2 font-[family-name:var(--font-accent)] text-[9.5px] tracking-[0.25em] text-[#d4af37] uppercase transition-all hover:border-[#d4af37]/70 hover:bg-[#d4af37]/12 whitespace-nowrap"
                    >
                      Join
                    </Link>
                  </motion.div>
                </>
              )}
            </motion.div>

            {/* Mobile hamburger */}
            <motion.button
              type="button"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
              whileTap={{ scale: 0.92 }}
              className="relative z-50 flex h-9 w-9 items-center justify-center rounded-full border border-white/12 bg-white/[0.04] text-white/70 transition-all hover:border-[#d4af37]/40 hover:text-[#d4af37] lg:hidden"
              onClick={() => setMobileOpen((o) => !o)}
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={mobileOpen ? "x" : "menu"}
                  initial={{ opacity: 0, rotate: -90, scale: 0.6 }}
                  animate={{ opacity: 1, rotate: 0, scale: 1 }}
                  exit={{ opacity: 0, rotate: 90, scale: 0.6 }}
                  transition={{ duration: 0.2 }}
                >
                  {mobileOpen ? <X size={17} /> : <Menu size={17} />}
                </motion.span>
              </AnimatePresence>
            </motion.button>
          </div>
        </nav>
      </header>

      {/* ─── Mobile drawer ─────────────────────────────────────── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 z-40 bg-[#030303]/95 backdrop-blur-2xl lg:hidden"
              onClick={closeMobile}
            />

            {/* Drawer panel */}
            <motion.nav
              key="drawer"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 220 }}
              className="fixed right-0 top-0 bottom-0 z-50 flex h-full w-[min(100vw,340px)] flex-col bg-[#050505] border-l border-[#d4af37]/10 shadow-[-30px_0_80px_rgba(0,0,0,0.7)] lg:hidden overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Gold corner accent */}
              <div className="absolute top-0 right-0 h-40 w-40 rounded-full bg-[#d4af37]/[0.05] blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 h-48 w-48 rounded-full bg-[#d4af37]/[0.03] blur-3xl pointer-events-none" />
              <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#d4af37]/50 to-transparent" />

              {/* Header row */}
              <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-white/[0.06]">
                <Link
                  href="/"
                  onClick={closeMobile}
                  aria-label="Alibaba Hookah Lounge — home"
                  className="block"
                >
                  <Image
                    src="/alibaba-logo.png"
                    alt="Alibaba Hookah Lounge"
                    width={979}
                    height={324}
                    sizes="150px"
                    className="h-9 w-auto"
                  />
                </Link>
                <motion.button
                  whileTap={{ scale: 0.88 }}
                  onClick={closeMobile}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 text-white/50 hover:border-[#d4af37]/40 hover:text-[#d4af37] transition-colors"
                >
                  <X size={15} />
                </motion.button>
              </div>

              {/* Nav links */}
              <div
                className="flex-1 min-h-0 overflow-y-auto px-5 py-5 sm:px-6 sm:py-6"
                style={{
                  touchAction: "pan-y",
                  WebkitOverflowScrolling: "touch",
                }}
              >
                <ul className="space-y-2">
                  {navLinks.map((link, i) => {
                    const active =
                      pathname === link.href ||
                      (link.href !== "/" && pathname.startsWith(link.href));
                    return (
                      <motion.li
                        key={link.href}
                        initial={{ opacity: 0, x: 24 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{
                          delay: 0.06 + i * 0.055,
                          ease: [0.16, 1, 0.3, 1],
                          duration: 0.45,
                        }}
                      >
                        <Link
                          href={link.href}
                          onClick={closeMobile}
                          className={cn(
                            "group flex items-center justify-between rounded-xl px-4 py-3 font-[family-name:var(--font-display)] text-xl tracking-[0.08em] uppercase transition-all duration-300",
                            active
                              ? "text-[#d4af37] bg-[#d4af37]/[0.07]"
                              : "text-white/60 hover:text-white hover:bg-white/[0.03]",
                          )}
                        >
                          {link.label}
                          {active && (
                            <motion.span
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="size-1.5 rounded-full bg-[#d4af37] flex-shrink-0"
                              style={{
                                boxShadow: "0 0 8px rgba(212,175,55,0.9)",
                              }}
                            />
                          )}
                        </Link>
                      </motion.li>
                    );
                  })}
                </ul>
              </div>

              {/* Bottom CTA */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35, duration: 0.5 }}
                className="safe-bottom shrink-0 space-y-3 border-t border-white/[0.06] px-6 pt-4 pb-6"
              >
                {user ? (
                  <>
                    {/* User card */}
                    <div className="flex items-center gap-3 rounded-xl border border-white/[0.07] bg-white/[0.03] px-3.5 py-3">
                      <div className="relative flex-shrink-0">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full border border-[#d4af37]/40 bg-gradient-to-br from-[#d4af37]/20 to-[#8b6914]/10 overflow-hidden">
                          {user.photoURL ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={user.photoURL}
                              alt=""
                              className="h-9 w-9 rounded-full object-cover"
                            />
                          ) : (
                            <span className="font-[family-name:var(--font-display)] text-sm text-[#d4af37]">
                              {(user.displayName ?? user.email ?? "U")
                                .split(" ")
                                .map((w: string) => w[0])
                                .slice(0, 2)
                                .join("")
                                .toUpperCase()}
                            </span>
                          )}
                        </div>
                        <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full border-[1.5px] border-[#050505] bg-emerald-400" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-[family-name:var(--font-display)] text-sm text-white">
                          {user.displayName ?? user.email?.split("@")[0]}
                        </p>
                        <p className="truncate font-[family-name:var(--font-body)] text-[10px] text-white/30">
                          {user.email}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        openModal();
                        closeMobile();
                      }}
                      className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#d4af37]/40 bg-[#d4af37]/10 py-3 font-[family-name:var(--font-accent)] text-[10px] tracking-[0.28em] text-[#d4af37] uppercase hover:bg-[#d4af37]/18 transition-colors"
                    >
                      <Calendar size={13} /> Reserve a Table
                    </button>

                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      <Link
                        href="/account"
                        onClick={closeMobile}
                        className="flex items-center justify-center gap-1.5 rounded-xl border border-white/10 py-2.5 font-[family-name:var(--font-body)] text-xs text-white/45 hover:text-white transition-colors"
                      >
                        <User size={12} /> Account
                      </Link>
                      <button
                        onClick={async () => {
                          closeMobile();
                          await signOut();
                          router.push("/");
                        }}
                        className="flex items-center justify-center gap-1.5 rounded-xl border border-white/10 py-2.5 font-[family-name:var(--font-body)] text-xs text-white/45 hover:border-rose-500/30 hover:text-rose-300 transition-colors"
                      >
                        <LogOut size={12} /> Sign Out
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      onClick={closeMobile}
                      className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#d4af37]/40 bg-[#d4af37]/10 py-3 font-[family-name:var(--font-accent)] text-[10px] tracking-[0.28em] text-[#d4af37] uppercase hover:bg-[#d4af37]/18 transition-colors"
                    >
                      Sign In
                    </Link>
                    <Link
                      href="/signup"
                      onClick={closeMobile}
                      className="flex w-full items-center justify-center rounded-xl border border-white/10 py-3 font-[family-name:var(--font-body)] text-[11px] text-white/40 hover:text-white transition-colors"
                    >
                      Create an Account
                    </Link>
                  </>
                )}

                {/* Phone shortcut */}
                <a
                  href="tel:+14695865437"
                  className="flex items-center justify-center gap-2 pt-1 font-[family-name:var(--font-accent)] text-[9px] tracking-[0.2em] text-white/25 uppercase hover:text-[#d4af37]/60 transition-colors"
                >
                  <Phone size={10} /> (469) 586-5437
                </a>
              </motion.div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
