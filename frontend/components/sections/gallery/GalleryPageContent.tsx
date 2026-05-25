"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, X } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { galleryApi } from "@/lib/admin/data-api";
import type { GalleryImage } from "@/lib/admin/types";
import { cn } from "@/lib/utils";
import { resolveImageUrl } from "@/lib/image-url";
import { FloatingParticles } from "@/components/effects/FloatingParticles";

const categories = ["All", "Food", "Drinks", "Hookah", "Ambiance", "Events", "Desserts"];

export function GalleryPageContent() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [lightbox, setLightbox] = useState<GalleryImage | null>(null);

  useEffect(() => {
    let mounted = true;
    galleryApi
      .list("?isPublished=true&limit=100")
      .then((items) => { if (mounted) setImages(items); })
      .catch(() => { if (mounted) setImages([]); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") setLightbox(null); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  const filtered = useMemo(() => {
    if (activeCategory === "All") return images;
    return images.filter((img) => img.category === activeCategory);
  }, [activeCategory, images]);

  return (
    <div className="cinematic-backdrop relative min-h-screen overflow-hidden pt-24 pb-20 pb-mobile-cta">
      <FloatingParticles count={14} className="opacity-25" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_40%_at_50%_10%,rgba(212,175,55,0.05),transparent_65%)]" />
      <div className="film-grain absolute inset-0" />

      <section className="relative mx-auto max-w-7xl px-5 sm:px-8 md:px-12">
        <SectionHeading
          eyebrow="Gallery"
          title="Inside Sheesh"
          subtitle="A living archive of the room, the plates, the smoke, and the nights that make the lounge glow."
        />

        {/* Category filter */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-10 flex flex-wrap justify-center gap-2"
        >
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={cn(
                "rounded-full border px-3.5 py-1.5 sm:px-5 sm:py-2 font-[family-name:var(--font-accent)] text-[9px] sm:text-[10px] tracking-[0.18em] uppercase transition-all duration-300",
                activeCategory === cat
                  ? "border-[#d4af37] bg-[#d4af37]/15 text-[#d4af37] shadow-[0_0_12px_rgba(212,175,55,0.2)]"
                  : "border-white/10 text-white/45 hover:border-[#d4af37]/40 hover:text-white"
              )}
            >
              {cat}
            </button>
          ))}
        </motion.div>

        <motion.p
          key={activeCategory}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-5 text-center font-[family-name:var(--font-body)] text-sm text-white/30"
        >
          {loading ? "Loading gallery..." : `${filtered.length} ${filtered.length === 1 ? "image" : "images"}`}
        </motion.p>

        {/* Masonry grid */}
        <motion.div layout className="mt-10 columns-1 gap-4 sm:columns-2 sm:gap-5 lg:columns-3">
          <AnimatePresence mode="popLayout">
            {filtered.map((image, index) => (
              <motion.figure
                key={image.id}
                layout
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.94 }}
                transition={{ delay: index * 0.03, duration: 0.5 }}
                className="cinematic-frame group mb-4 break-inside-avoid cursor-pointer overflow-hidden rounded-2xl bg-white/[0.02] transition-all duration-700 hover:border-[#d4af37]/30 hover:shadow-[0_12px_40px_rgba(212,175,55,0.08)] sm:mb-5"
                onClick={() => setLightbox(image)}
              >
                <div className="relative overflow-hidden" style={{ aspectRatio: index % 5 === 0 ? "4/5" : "4/3" }}>
                  <Image
                    src={resolveImageUrl(image.url)}
                    alt={image.title}
                    fill
                    className="object-cover transition-transform duration-[2s] group-hover:scale-108"
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#050505]/85 via-transparent to-transparent opacity-80 group-hover:opacity-95 transition-opacity duration-700" />
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(212,175,55,0.08),transparent_60%)] opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                  {/* Hover overlay zoom hint */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <div className="flex items-center gap-2 rounded-full border border-[#d4af37]/40 bg-[#050505]/60 px-4 py-2 backdrop-blur-sm">
                      <Camera className="size-3 text-[#d4af37]" />
                      <p className="font-[family-name:var(--font-accent)] text-[8px] tracking-[0.2em] text-[#d4af37] uppercase">View</p>
                    </div>
                  </div>

                  <figcaption className="absolute right-4 bottom-4 left-4">
                    <p className="font-[family-name:var(--font-display)] text-lg text-white group-hover:text-gold-gradient transition-colors duration-500">
                      {image.title}
                    </p>
                    <p className="mt-0.5 font-[family-name:var(--font-accent)] text-[8px] tracking-[0.18em] text-[#d4af37]/70 uppercase">
                      {image.category}
                    </p>
                  </figcaption>
                </div>
              </motion.figure>
            ))}
          </AnimatePresence>
        </motion.div>

        {!loading && filtered.length === 0 && (
          <p className="mt-16 text-center font-[family-name:var(--font-body)] text-white/35">
            No gallery images published yet — check back soon.
          </p>
        )}
      </section>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-[#050505]/95 p-4 backdrop-blur-md sm:p-5"
            onClick={() => setLightbox(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 22, stiffness: 200 }}
              className="cinematic-frame relative max-h-[85vh] w-full max-w-5xl overflow-hidden rounded-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative aspect-[4/3]">
                <Image
                  src={resolveImageUrl(lightbox.url)}
                  alt={lightbox.title}
                  fill
                  className="object-contain bg-[#050505]"
                  sizes="90vw"
                />
              </div>
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-[#050505]/90 to-transparent p-6">
                <p className="font-[family-name:var(--font-display)] text-xl text-white">{lightbox.title}</p>
                <p className="mt-1 font-[family-name:var(--font-accent)] text-[9px] tracking-[0.2em] text-[#d4af37]/70 uppercase">{lightbox.category}</p>
              </div>
              <button
                type="button"
                onClick={() => setLightbox(null)}
                aria-label="Close gallery image"
                className="absolute top-4 right-4 flex size-10 items-center justify-center rounded-full border border-white/20 bg-[#050505]/70 text-white/60 backdrop-blur-sm transition-colors hover:border-[#d4af37]/40 hover:text-white"
              >
                <X className="size-4" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
