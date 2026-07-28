import { PublicPageShell } from "@/components/layout/PublicPageShell";
import { MenuPageContent } from "@/components/sections/menu/MenuPageContent";

export const metadata = {
  title: "Menu | Sheesh Eatery & Lounge",
  description: "Explore our premium food, hookah, drinks, and desserts menu.",
};

export default function MenuPage() {
  return (
    <PublicPageShell>
      <MenuPageContent />
    </PublicPageShell>
  );
}
