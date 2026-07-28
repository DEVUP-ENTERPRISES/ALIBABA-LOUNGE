import { PublicPageShell } from "@/components/layout/PublicPageShell";
import { CateringPageContent } from "@/components/sections/catering/CateringPageContent";

export const metadata = {
  title: "Catering | Sheesh Eatery & Lounge",
  description: "Bespoke catering and premium hookah experiences for private events.",
};

export default function CateringPage() {
  return (
    <PublicPageShell>
      <CateringPageContent />
    </PublicPageShell>
  );
}
