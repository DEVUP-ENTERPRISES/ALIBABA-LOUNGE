import { PublicPageShell } from "@/components/layout/PublicPageShell";
import { EventsPageContent } from "@/components/sections/events/EventsPageContent";

export const metadata = {
  title: "Events | Sheesh Eatery & Lounge",
  description: "Voice of Sheesh Season 1 and exclusive lounge events in Dallas.",
};

export default function EventsPage() {
  return (
    <PublicPageShell>
      <EventsPageContent />
    </PublicPageShell>
  );
}
