"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { galleryApi, settingApi } from "@/lib/admin/data-api";
import type { GalleryImage, AdminSetting } from "@/lib/admin/types";

/** Matches the glyph the footer already uses; lucide-react has no Instagram export. */
function IgGlyph({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden
    >
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="18" cy="6" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

const FALLBACK_HANDLE = "@alibabalounge01";
const FALLBACK_URL = "https://instagram.com/alibabalounge01";

export function InstagramSection() {
  const [posts, setPosts] = useState<GalleryImage[]>([]);
  const [handle, setHandle] = useState(FALLBACK_HANDLE);
  const [profileUrl, setProfileUrl] = useState(FALLBACK_URL);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let mounted = true;

    galleryApi
      .list("?limit=12")
      .then((items) => {
        if (mounted && items?.length) setPosts(items);
      })
      .catch(() => {});

    settingApi
      .get()
      .then((s: AdminSetting) => {
        if (!mounted) return;
        if (s?.instagram) setHandle(s.instagram);
        if (s?.instagramUrl) setProfileUrl(s.instagramUrl);
      })
      .catch(() => {});

    return () => {
      mounted = false;
    };
  }, []);

  const scrollBy = (dir: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * (el.clientWidth * 0.8), behavior: "smooth" });
  };

  // Nothing uploaded yet — render nothing rather than an empty shelf.
  if (posts.length === 0) return null;

  return (
    <section className="relative overflow-hidden bg-[#070707] py-14 sm:py-16 md:py-20 lg:py-24">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_0%,rgba(212,175,55,0.05),transparent_65%)]" />

      <div className="relative mx-auto max-w-7xl px-5 sm:px-8 md:px-12 lg:px-20">
        <SectionHeading
          eyebrow="Instagram"
          title="Follow Our Nights"
          subtitle="Events, blends, and the room at its best. Tag us and you might end up here."
        />

        {/* Account row */}
        <div className="mt-8 flex flex-col items-center gap-4 sm:mt-10 sm:flex-row sm:justify-between">
          <a
            href={profileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 transition-colors hover:border-[#d4af37]/40"
          >
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full border border-[#d4af37]/40 bg-[#d4af37]/10">
              <IgGlyph className="size-4 text-[#d4af37]" />
            </span>
            <span className="text-left">
              <span className="block font-[family-name:var(--font-body)] text-sm font-medium text-white">
                {handle}
              </span>
              <span className="block font-[family-name:var(--font-accent)] text-[10px] tracking-[0.18em] text-white/40 uppercase">
                Alibaba Hookah Lounge
              </span>
            </span>
          </a>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => scrollBy(-1)}
              aria-label="Previous posts"
              className="flex size-10 items-center justify-center rounded-full border border-white/10 text-white/55 transition-colors hover:border-[#d4af37]/45 hover:text-[#d4af37]"
            >
              <ChevronLeft className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => scrollBy(1)}
              aria-label="More posts"
              className="flex size-10 items-center justify-center rounded-full border border-white/10 text-white/55 transition-colors hover:border-[#d4af37]/45 hover:text-[#d4af37]"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
        </div>

        {/* Carousel — native scroll-snap, so it flicks properly on touch */}
        <div
          ref={trackRef}
          className="hide-scrollbar mt-6 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 sm:mt-8"
          style={{ scrollPaddingLeft: "0px", WebkitOverflowScrolling: "touch" }}
        >
          {posts.map((post, i) => (
            <motion.a
              key={post.id}
              href={profileUrl}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.45, delay: Math.min(i * 0.05, 0.3) }}
              className="group relative aspect-square w-[68vw] shrink-0 snap-start overflow-hidden rounded-2xl border border-white/[0.07] sm:w-[46vw] md:w-[31%] lg:w-[23%]"
            >
              <Image
                src={post.url}
                alt={post.title || "Alibaba Hookah Lounge on Instagram"}
                fill
                quality={85}
                sizes="(max-width: 640px) 68vw, (max-width: 768px) 46vw, (max-width: 1024px) 31vw, 23vw"
                className="object-cover transition-transform duration-700 group-hover:scale-[1.06]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#050505]/80 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              <span className="absolute right-3 bottom-3 flex size-8 items-center justify-center rounded-full bg-[#050505]/75 opacity-0 backdrop-blur-md transition-opacity duration-500 group-hover:opacity-100">
                <IgGlyph className="size-3.5 text-[#d4af37]" />
              </span>
            </motion.a>
          ))}
        </div>

        <div className="mt-8 flex justify-center sm:mt-10">
          <a
            href={profileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="luxury-focus-ring inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#8b6914] via-[#d4af37] to-[#8b6914] px-7 py-3 font-[family-name:var(--font-accent)] text-xs font-medium tracking-[0.18em] text-[#050505] uppercase transition-shadow duration-500 hover:shadow-[0_0_36px_rgba(212,175,55,0.45)]"
          >
            <IgGlyph className="size-4" />
            Follow {handle}
          </a>
        </div>
      </div>
    </section>
  );
}
