"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { Download, Plus, Share, X } from "lucide-react";
import { getCookie, setCookie } from "@/lib/cookies";

const DISMISS_KEY = "alibaba-install-dismissed";
const DISMISS_DAYS = 7;
const SHOW_AFTER_MS = 2500;

interface InstallEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

type Mode = "android" | "ios" | null;

/** Already running as an installed app? */
function isStandalone() {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    window.matchMedia("(display-mode: minimal-ui)").matches ||
    // iOS predates the display-mode query and uses its own flag.
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

/** iOS Safari — the only browser on iOS that can install to the home screen. */
function isIosSafari() {
  if (typeof window === "undefined") return false;
  const ua = window.navigator.userAgent;
  const iOS =
    /iPad|iPhone|iPod/.test(ua) ||
    // iPadOS 13+ reports as a Mac, distinguishable by touch support.
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const webkit = /WebKit/.test(ua);
  const otherBrowser = /CriOS|FxiOS|OPiOS|EdgiOS|Brave/.test(ua);
  return iOS && webkit && !otherBrowser;
}

/**
 * Invitation to install.
 *
 * Two paths, because the platforms differ fundamentally:
 *
 * Android and desktop Chromium fire `beforeinstallprompt`, so the browser is
 * asked to install directly.
 *
 * iOS Safari never fires it — Apple only supports Share -> Add to Home Screen —
 * so it gets illustrated instructions instead. Without that branch, iPhone
 * guests would never be offered the app at all.
 *
 * Either way the invitation stops once installed: the event no longer fires,
 * and the standalone check catches iOS.
 */
export function InstallPrompt() {
  const [deferred, setDeferred] = useState<InstallEvent | null>(null);
  const [mode, setMode] = useState<Mode>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        /* blocked or unsupported — the site still works, just not installable */
      });
    }

    if (isStandalone() || getCookie(DISMISS_KEY) === "true") return;

    const onPrompt = (e: Event) => {
      e.preventDefault(); // show our own invitation, not the browser's bar
      setDeferred(e as InstallEvent);
      setMode("android");
      window.setTimeout(() => setVisible(true), SHOW_AFTER_MS);
    };

    const onInstalled = () => {
      setVisible(false);
      setDeferred(null);
    };

    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);

    // iOS has no event to wait for, so offer instructions on a timer instead.
    let iosTimer: number | undefined;
    if (isIosSafari()) {
      iosTimer = window.setTimeout(() => {
        setMode("ios");
        setVisible(true);
      }, SHOW_AFTER_MS);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
      if (iosTimer) window.clearTimeout(iosTimer);
    };
  }, []);

  const remember = () =>
    setCookie(DISMISS_KEY, "true", { maxAgeSeconds: DISMISS_DAYS * 24 * 60 * 60 });

  const dismiss = useCallback(() => {
    setVisible(false);
    remember();
  }, []);

  const install = useCallback(async () => {
    if (!deferred) return;
    setVisible(false);
    await deferred.prompt();
    const { outcome } = await deferred.userChoice;
    if (outcome === "dismissed") remember();
    setDeferred(null);
  }, [deferred]);

  const showable = visible && (mode === "ios" || (mode === "android" && deferred));

  return (
    <AnimatePresence>
      {showable && (
        <motion.div
          initial={{ y: 90, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 90, opacity: 0 }}
          transition={{ type: "spring", damping: 26, stiffness: 260 }}
          role="dialog"
          aria-label="Install the Alibaba app"
          className="safe-bottom fixed inset-x-3 bottom-3 z-[9200] mx-auto max-w-md rounded-2xl border border-[#d4af37]/35 bg-[#0a0a0c]/97 p-4 shadow-[0_24px_60px_rgba(0,0,0,0.7)] backdrop-blur-xl lg:right-6 lg:bottom-6 lg:left-auto"
        >
          <div className="flex items-start gap-3">
            <div className="relative size-11 shrink-0 overflow-hidden rounded-xl border border-[#d4af37]/25 bg-[#050505]">
              <Image src="/icons/icon-192.png" alt="" fill sizes="44px" className="object-contain p-1" />
            </div>

            <div className="min-w-0 flex-1">
              <p className="font-[family-name:var(--font-display)] text-base leading-tight text-white">
                Get the Alibaba app
              </p>
              <p className="mt-1 text-xs leading-relaxed text-white/55">
                {mode === "ios"
                  ? "Two taps and it lives on your home screen — opens straight to your table."
                  : "Order in one tap, works even when the wifi drops."}
              </p>
            </div>

            <button
              type="button"
              onClick={dismiss}
              aria-label="Not now"
              className="shrink-0 text-white/25 transition-colors hover:text-white/60"
            >
              <X className="size-4" />
            </button>
          </div>

          {mode === "ios" ? (
            <>
              <ol className="mt-4 space-y-2.5">
                <li className="flex items-center gap-3 rounded-xl border border-white/[0.07] bg-white/[0.02] px-3 py-2.5">
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-[#d4af37]/15 text-[#d4af37]">
                    <Share className="size-3.5" />
                  </span>
                  <span className="text-xs text-white/70">
                    Tap <strong className="text-white">Share</strong> in the Safari toolbar
                  </span>
                </li>
                <li className="flex items-center gap-3 rounded-xl border border-white/[0.07] bg-white/[0.02] px-3 py-2.5">
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-[#d4af37]/15 text-[#d4af37]">
                    <Plus className="size-3.5" />
                  </span>
                  <span className="text-xs text-white/70">
                    Choose <strong className="text-white">Add to Home Screen</strong>
                  </span>
                </li>
              </ol>
              <button
                type="button"
                onClick={dismiss}
                className="mt-3 w-full rounded-xl border border-white/10 py-2.5 text-[11px] tracking-[0.14em] text-white/50 uppercase transition-colors hover:text-white/80"
              >
                Got it
              </button>
            </>
          ) : (
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={install}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#8b6914] via-[#d4af37] to-[#8b6914] py-3 font-[family-name:var(--font-accent)] text-[11px] font-medium tracking-[0.16em] text-[#050505] uppercase"
              >
                <Download className="size-3.5" /> Install app
              </button>
              <button
                type="button"
                onClick={dismiss}
                className="rounded-xl border border-white/10 px-4 text-[11px] text-white/45 transition-colors hover:text-white/70"
              >
                Later
              </button>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
