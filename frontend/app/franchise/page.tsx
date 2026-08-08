import { PublicPageShell } from "@/components/layout/PublicPageShell";
import { FranchisePageContent } from "@/components/sections/franchise/FranchisePageContent";

export const metadata = {
  title: "Franchise | Alibaba Hookah Lounge",
  description: "Partner with Alibaba Hookah Lounge and bring our luxury lounge concept to new markets.",
};

export default function FranchisePage() {
  return (
    <PublicPageShell>
      <FranchisePageContent />
    </PublicPageShell>
  );
}
