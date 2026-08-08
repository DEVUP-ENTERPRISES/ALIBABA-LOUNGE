import { PublicPageShell } from "@/components/layout/PublicPageShell";
import { GalleryPageContent } from "@/components/sections/gallery/GalleryPageContent";

export const metadata = {
  title: "Gallery | Alibaba Hookah Lounge",
  description: "Explore the atmosphere, dining, hookah, and events at Alibaba Hookah Lounge.",
};

export default function GalleryPage() {
  return (
    <PublicPageShell>
      <GalleryPageContent />
    </PublicPageShell>
  );
}
