"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import type { MenuItem } from "@/lib/menu/types";
import { MenuTagBadge } from "@/components/ui/MenuTagBadge";
import { cn } from "@/lib/utils";
import { resolveImageUrl } from "@/lib/image-url";

interface MenuItemCardProps {
  item: MenuItem;
  index?: number;
  variant?: "default" | "featured";
}

export function MenuItemCard({
  item,
  index = 0,
  variant = "default",
}: MenuItemCardProps) {
  const isFeatured = variant === "featured" || item.layout === "wide";
  const imageSrc = resolveImageUrl(item.image);
  const ref = useRef<HTMLElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [4, -4]), {
    stiffness: 300,
    damping: 30,
  });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-4, 4]), {
    stiffness: 300,
    damping: 30,
  });

  const handleMove = (e: React.MouseEvent<HTMLElement>) => {
    if (!ref.current || window.matchMedia("(pointer: coarse)").matches) return;
    const rect = ref.current.getBoundingClientRect();
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  const handleLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.article
      ref={ref}
      layout
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{
        duration: 0.45,
        delay: Math.min(index * 0.025, 0.2),
        ease: [0.22, 1, 0.36, 1],
      }}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      style={{ rotateX, rotateY, transformPerspective: 1200 }}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-2xl border border-white/[0.06] bg-[#0c0c0e]/90 transition-[border-color,box-shadow] duration-500 hover:border-[#d4af37]/30 hover:shadow-[0_20px_60px_rgba(0,0,0,0.5),0_0_40px_rgba(212,175,55,0.08)]",
        isFeatured && "md:col-span-2"
      )}
    >
      <div
        className={cn(
          "relative w-full overflow-hidden",
          isFeatured ? "aspect-[16/10] md:aspect-[21/9]" : "aspect-[5/4]"
        )}
      >
        <Image
          src={imageSrc}
          alt={item.name}
          fill
          sizes={
            isFeatured
              ? "(max-width: 768px) 100vw, 66vw"
              : "(max-width: 768px) 100vw, 33vw"
          }
          className="object-cover transition-transform duration-[1.1s] ease-out group-hover:scale-[1.06]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/25 to-[#050505]/10" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(212,175,55,0.14),transparent_55%)] opacity-0 transition-opacity duration-700 group-hover:opacity-100" />
        <div className="absolute top-4 right-4">
          <span className="inline-flex items-center rounded-full border border-[#d4af37]/40 bg-[#050505]/80 px-4 py-1.5 font-[family-name:var(--font-display)] text-lg text-[#d4af37] backdrop-blur-md md:text-xl">
            ${item.price}
          </span>
        </div>
        {item.tags && item.tags.length > 0 && (
          <div className="absolute top-4 left-4 flex flex-wrap gap-1.5">
            {item.tags.slice(0, 2).map((tag) => (
              <MenuTagBadge key={tag} tag={tag} />
            ))}
          </div>
        )}
      </div>

      <div className="relative flex flex-1 flex-col p-5 md:p-6">
        <div className="absolute top-0 right-6 left-6 h-px bg-gradient-to-r from-transparent via-[#d4af37]/25 to-transparent" />
        <h3
          className={cn(
            "font-[family-name:var(--font-display)] leading-tight tracking-wide text-white",
            isFeatured ? "text-2xl md:text-3xl" : "text-xl md:text-2xl"
          )}
        >
          {item.name}
        </h3>
        <p className="mt-3 flex-1 font-[family-name:var(--font-body)] text-sm leading-relaxed text-white/55 md:text-[15px]">
          {item.description}
        </p>
        {item.tags && item.tags.length > 2 && (
          <div className="mt-4 flex flex-wrap gap-2 border-t border-white/[0.06] pt-4">
            {item.tags.slice(2).map((tag) => (
              <MenuTagBadge key={tag} tag={tag} />
            ))}
          </div>
        )}
      </div>
    </motion.article>
  );
}
