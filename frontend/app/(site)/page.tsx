import { HeroSection } from "@/components/sections/hero/HeroSection";
import { ExperienceSection } from "@/components/sections/home/ExperienceSection";
import { HookahSection } from "@/components/sections/home/HookahSection";
import { FeaturedMenuSection } from "@/components/sections/home/FeaturedMenuSection";
import { EventsPreviewSection } from "@/components/sections/home/EventsPreviewSection";
import { CateringPreviewSection } from "@/components/sections/home/CateringPreviewSection";
import { FranchisePreviewSection } from "@/components/sections/home/FranchisePreviewSection";
import { InstagramSection } from "@/components/sections/home/InstagramSection";
import { ReviewsSection } from "@/components/sections/home/ReviewsSection";
import { FinalCTASection } from "@/components/sections/home/FinalCTASection";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <ExperienceSection />
      <div className="line-gold opacity-[0.08]" />
      <HookahSection />
      <div className="line-gold opacity-[0.08]" />
      <FeaturedMenuSection />
      <div className="line-gold opacity-[0.08]" />
      <EventsPreviewSection />
      <div className="line-gold opacity-[0.08]" />
      <CateringPreviewSection />
      <div className="line-gold opacity-[0.08]" />
      <FranchisePreviewSection />
      <div className="line-gold opacity-[0.08]" />
      <InstagramSection />
      <ReviewsSection />
      <FinalCTASection />
    </>
  );
}
