"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { Download, X } from "lucide-react";
import { getCookie, setCookie } from "@/lib/cookies";

const DISMISS_KEY = "alibaba-install-dismissed";
const DISMISS_DAYS = 7;

interface InstallEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

/**
 * Invitation to install the app.
 *
 * Only appears when the browser actually offers installation, which means it
 * never shows once installed — the event simply stops firing. Dismissing hides
 * it for a week rather than forever, so a guest who says "not now" is asked
 * again on a later visit but never nagged in the same session.
 *
 * It also registers the service worker, which is what makes the offer possible.
 */
export function InstallPrompt() {
  const [deferred, setDeferred] = useState<InstallEvent | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        /* unsupported or blocked — the site still works, just not installable */
      });
    }

    // Already installed: standalone display, or iOS's own flag.
    const installed =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
    if (installed || getCookie(DISMISS_KEY) === "true") return;

    const onPrompt = (e: Event) => {
      // Keep the event so we can show our own invitation instead of the
      // browser's, which most people ignore.
      e.preventDefault();
      setDeferred(e as InstallEvent);
      window.setTimeout(() => setVisible(true), 2500);
    };

    const onInstalled = () => {
      setVisible(false);
      setDeferred(null);
    };

    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const dismiss = useCallback(() => {
    setVisible(false);
    setCookie(DISMISS_KEY, "true", { maxAgeSeconds: DISMISS_DAYS * 24 * 60 * 60 });
  }, []);

  const install = useCallback(async () => {
    if (!deferred) return;
    setVisible(false);
    await deferred.prompt();
    const { outcome } = await deferred.userChoice;
    // Declining should not re-ask on the next page view.
    if (outcome === "dismissed") {
      setCookie(DISMISS_KEY, "true", { maxAgeSeconds: DISMISS_DAYS * 24 * 60 * 60 });
    }
    setDeferred(null);
  }, [deferred]);

  return (
    <AnimatePresence>
      {visible && deferred && (
        <motion.div
          initial={{ y: 90, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 90, opacity: 0 }}
          transition={{ type: "spring", damping: 26, stiffness: 260 }}
          className="safe-bottom fixed inset-x-3 bottom-3 z-[9200] mx-auto max-w-md rounded-2xl border border-[#d4af37]/35 bg-[#0a0a0c]/97 p-4 shadow-[0_24px_60px_rgba(0,0,0,0.7)] backdrop-blur-xl lg:left-auto lg:right-6 lg:bottom-6"
        >
          <div className="flex items-start gap-3">
            <div className="relative size-11 shrink-0 overflow-hidden rounded-xl border border-[#d4af37]/25 bg-[#050505]">
              <Image src="/icons/icon-192.png" alt="" fill sizes="44px" className="object-contain p-1" />
            </div>

            <div className="min-w-0 flex-1">
              <p className="font-[family-name:var(--font-display)] text-base leading-tight text-white">
                Order faster next time
              </p>
              <p className="mt-1 text-xs leading-relaxed text-white/55">
                Add Alibaba to your home screen — one tap to your table, no
                searching for the link.
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

          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={install}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#8b6914] via-[#d4af37] to-[#8b6914] py-3 font-[family-name:var(--font-accent)] text-[11px] font-medium tracking-[0.16em] text-[#050505] uppercase"
            >
              <Download className="size-3.5" /> Add to home screen
            </button>
            <button
              type="button"
              onClick={dismiss}
              className="rounded-xl border border-white/10 px-4 text-[11px] text-white/45 transition-colors hover:text-white/70"
            >
              Later
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
