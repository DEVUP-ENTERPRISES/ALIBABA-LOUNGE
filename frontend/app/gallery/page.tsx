import { PublicPageShell } from "@/components/layout/PublicPageShell";
import { GalleryPageContent } from "@/components/sections/gallery/GalleryPageContent";

export const metadata = {
  title: "Gallery | Sheesh Eatery & Lounge",
  description: "Explore the atmosphere, dining, hookah, and events at Sheesh.",
};

export default function GalleryPage() {
  return (
    <PublicPageShell>
      <GalleryPageContent />
    </PublicPageShell>
  );
}
