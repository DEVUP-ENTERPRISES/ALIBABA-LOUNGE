import { PublicPageShell } from "@/components/layout/PublicPageShell";
import { FranchisePageContent } from "@/components/sections/franchise/FranchisePageContent";

export const metadata = {
  title: "Franchise | Sheesh Eatery & Lounge",
  description: "Partner with Sheesh and bring our luxury lounge concept to new markets.",
};

export default function FranchisePage() {
  return (
    <PublicPageShell>
      <FranchisePageContent />
    </PublicPageShell>
  );
}
