import { PublicPageShell } from "@/components/layout/PublicPageShell";
import { ReservationPageContent } from "@/components/sections/reservation/ReservationPageContent";

export const metadata = {
  title: "Reservation | Sheesh Eatery & Lounge",
  description: "Request a reservation at Sheesh Eatery & Lounge.",
};

export default function ReservationPage() {
  return (
    <PublicPageShell>
      <ReservationPageContent />
    </PublicPageShell>
  );
}
