import { Suspense } from "react";
import { PublicPageShell } from "@/components/layout/PublicPageShell";
import { ReservationStatusContent } from "@/components/sections/reservation/ReservationStatusContent";

export const metadata = {
  title: "Track Your Reservation | Alibaba Hookah Lounge",
  description:
    "Check the status of your table booking at Alibaba Hookah Lounge with your reservation code.",
  // A personal booking lookup has nothing to offer search engines.
  robots: { index: false, follow: false },
};

export default function ReservationStatusPage() {
  return (
    <PublicPageShell>
      {/* useSearchParams opts the tree into client-side rendering, which the
          App Router requires a boundary for. */}
      <Suspense
        fallback={
          <div className="cinematic-backdrop min-h-screen pt-24 pb-24">
            <p className="mt-20 text-center text-sm text-white/35">Loading…</p>
          </div>
        }
      >
        <ReservationStatusContent />
      </Suspense>
    </PublicPageShell>
  );
}
