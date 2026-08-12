import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "You are offline" };

export default function OfflinePage() {
  return (
    <div className="cinematic-backdrop flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <h1 className="font-[family-name:var(--font-display)] text-3xl text-white">
        No connection
      </h1>
      <p className="mt-3 max-w-sm font-[family-name:var(--font-body)] text-sm leading-relaxed text-white/55">
        The lounge wifi may have dropped. Your cart is saved — reconnect and it
        will be waiting.
      </p>
      <Link
        href="/order"
        className="mt-7 rounded-full border border-[#d4af37]/45 px-6 py-3 font-[family-name:var(--font-accent)] text-xs tracking-[0.18em] text-[#f5e6c8] uppercase"
      >
        Try again
      </Link>
    </div>
  );
}
