"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { getCookie, setCookie } from "@/lib/cookies";

const KEY = "alibaba-age-ack";

/**
 * Age acknowledgement before ordering tobacco.
 *
 * Texas sets the minimum age for tobacco at 21 (Health & Safety Code ch. 161),
 * and hookah is tobacco. This is the digital layer only — it does not replace
 * checking ID at the table, which is what actually protects the permit. It
 * records that the guest was told, and keeps a minor from ordering by phone
 * without at least a deliberate false statement.
 */
export function AgeGate({ children }: { children: React.ReactNode }) {
  const [ack, setAck] = useState<boolean | null>(null);

  useEffect(() => {
    // Cookies are not readable during render, so the first paint has to be
    // the "unknown" state and this resolves it.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setAck(getCookie(KEY) === "true");
  }, []);

  // Nothing until we know, so the gate never flashes for a guest who passed it.
  if (ack === null) return null;

  if (!ack) {
    return (
      <div className="cinematic-backdrop relative flex min-h-screen items-center justify-center px-5 py-24">
        <div className="w-full max-w-md rounded-3xl border border-[#d4af37]/25 bg-[#0c0c0e]/90 p-7 text-center shadow-[0_30px_80px_rgba(0,0,0,0.6)]">
          <div className="mx-auto flex size-14 items-center justify-center rounded-full border border-[#d4af37]/40 bg-[#d4af37]/10">
            <ShieldAlert className="size-6 text-[#d4af37]" />
          </div>

          <h1 className="mt-5 font-[family-name:var(--font-display)] text-2xl text-white">
            Are you 21 or older?
          </h1>

          <p className="mt-3 font-[family-name:var(--font-body)] text-sm leading-relaxed text-white/60">
            Hookah is a tobacco product. Texas law requires you to be 21 to
            purchase or use tobacco, and we check ID at the table.
          </p>

          <div className="mt-7 flex flex-col gap-3">
            <button
              type="button"
              onClick={() => {
                // Session cookie: a fresh browser session asks again, which is
                // the right side to err on for an age check.
                setCookie(KEY, "true");
                setAck(true);
              }}
              className="rounded-full bg-gradient-to-r from-[#8b6914] via-[#d4af37] to-[#8b6914] py-3.5 font-[family-name:var(--font-accent)] text-xs font-medium tracking-[0.18em] text-[#050505] uppercase"
            >
              Yes, I am 21 or older
            </button>
            <Link
              href="/"
              className="rounded-full border border-white/12 py-3.5 text-center font-[family-name:var(--font-accent)] text-xs tracking-[0.18em] text-white/55 uppercase transition-colors hover:text-white/80"
            >
              No, take me back
            </Link>
          </div>

          <p className="mt-6 text-[11px] leading-relaxed text-white/30">
            Smoking is harmful to your health. Bring valid photo ID — orders
            without ID will not be served.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
