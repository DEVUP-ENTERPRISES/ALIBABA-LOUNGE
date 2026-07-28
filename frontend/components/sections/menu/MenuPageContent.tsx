"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search } from "lucide-react";
import Image from "next/image";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { MenuItemCard } from "@/components/ui/MenuItemCard";
import { Input } from "@/components/ui/input";
import {
  menuCategories,
  foodSubcategories,
  hookahSubcategories,
  drinksSubcategories,
} from "@/lib/menu-data";
import type { MenuCategory } from "@/lib/menu/types";
import type { MenuItem } from "@/lib/menu/types";
import { menuApi } from "@/lib/admin/data-api";
import { menuImages } from "@/lib/menu-images";
import { cn } from "@/lib/utils";
import { SmokeOverlay } from "@/components/effects/SmokeOverlay";
import { FloatingParticles } from "@/components/effects/FloatingParticles";

const categoryHero: Record<MenuCategory, string> = {
  food: menuImages.cuisine,
  hookah: menuImages.hookahLounge,
  drinks: menuImages.mocktails,
  desserts: menuImages.desserts,
};

function matchesSubcategory(
  itemSub: string | undefined,
  filter: string,
  category: MenuCategory
) {
  if (filter === "all") return true;
  if (itemSub === filter) return true;
  if (
    category === "hookah" &&
    filter === "selection" &&
    itemSub === "premium"
  ) {
    return true;
  }
  return false;
}

export function MenuPageContent() {
  const [category, setCategory] = useState<MenuCategory>("food");
  const [subFilter, setSubFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetches menu data from the backend on mount.
    setLoading(true);
    menuApi
      .list("?limit=100&isAvailable=true")
      .then((items) => {
        if (mounted) setMenuItems(items);
      })
      .catch(() => {
        if (mounted) setMenuItems([]);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const subcategories =
    category === "food"
      ? foodSubcategories
      : category === "hookah"
        ? hookahSubcategories
        : category === "drinks"
          ? drinksSubcategories
          : null;

  const filtered = useMemo(() => {
    return menuItems.filter((item) => {
      const matchCategory = item.category === category;
      const matchSub = matchesSubcategory(item.subcategory, subFilter, category);
      const matchSearch =
        search.trim() === "" ||
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.description.toLowerCase().includes(search.toLowerCase());
      return matchCategory && matchSub && matchSearch;
    });
  }, [menuItems, category, subFilter, search]);

  return (
    <div className="relative min-h-screen overflow-x-hidden pt-24 pb-20 pb-mobile-cta md:pt-28 md:pb-24">
      <FloatingParticles count={10} className="hidden opacity-30 md:block" />
      <SmokeOverlay className="opacity-40" />

      <div className="relative mx-auto mb-12 max-w-7xl px-4 sm:px-6 md:mb-16 md:px-12 lg:px-20">
        <div className="relative aspect-[2/1] min-h-[180px] overflow-hidden rounded-2xl md:aspect-[21/9] md:min-h-[220px] md:rounded-3xl">
          <Image
            src={categoryHero[category]}
            alt=""
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-[#050505]/75 to-[#050505]/25" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_left,rgba(212,175,55,0.12),transparent_60%)]" />
          <div className="absolute inset-0 film-grain" />
        </div>
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 md:px-12 lg:px-20">
        <SectionHeading
          eyebrow="Our Menu"
          title="Curated Indulgence"
          subtitle="Elevated plates, signature hookah blends, craft drinks, and decadent desserts — every item presented with cinematic luxury."
        />

        <div className="relative mx-auto mt-10 max-w-lg">
          <Search className="absolute top-1/2 left-4 size-4 -translate-y-1/2 text-[#d4af37]/50" />
          <Input
            placeholder="Search menu..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-11"
          />
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-2 sm:gap-3">
          {menuCategories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => {
                setCategory(cat.id);
                setSubFilter("all");
              }}
              className={cn(
                "rounded-full border px-4 py-2 font-[family-name:var(--font-accent)] text-[9px] tracking-[0.18em] uppercase transition-all duration-300 sm:px-6 sm:py-2.5 sm:text-[10px]",
                category === cat.id
                  ? "border-[#d4af37] bg-[#d4af37]/15 text-[#d4af37] glow-gold"
                  : "border-white/10 text-white/50 hover:border-[#d4af37]/40 hover:text-white"
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {subcategories && (
          <motion.div
            key={category}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-5 flex flex-wrap justify-center gap-2"
          >
            {subcategories.map((sub) => (
              <button
                key={sub.id}
                type="button"
                onClick={() => setSubFilter(sub.id)}
                className={cn(
                  "rounded-full border px-3 py-1.5 font-[family-name:var(--font-body)] text-xs transition-all duration-300",
                  subFilter === sub.id
                    ? "border-[#d4af37]/40 bg-[#d4af37]/10 text-[#d4af37]"
                    : "border-transparent text-white/40 hover:text-white/70"
                )}
              >
                {sub.label}
              </button>
            ))}
          </motion.div>
        )}

        {category === "desserts" && subFilter === "all" && (
          <p className="mt-4 text-center font-[family-name:var(--font-accent)] text-[10px] tracking-[0.25em] text-[#d4af37]/60 uppercase">
            Decadent Desserts
          </p>
        )}

        <p className="mt-6 text-center font-[family-name:var(--font-body)] text-sm text-white/35">
          {loading ? "Loading menu..." : `${filtered.length} ${filtered.length === 1 ? "item" : "items"}`}
        </p>

        <motion.div
          layout
          className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3"
        >
          <AnimatePresence mode="popLayout">
            {filtered.map((item, i) => (
              <MenuItemCard
                key={item.id}
                item={item}
                index={i}
                variant={
                  item.featured || item.layout === "wide" || i % 7 === 0
                    ? "featured"
                    : "default"
                }
              />
            ))}
          </AnimatePresence>
        </motion.div>

        {!loading && filtered.length === 0 && (
          <p className="mt-16 text-center font-[family-name:var(--font-body)] text-white/40">
            No items match your search.
          </p>
        )}
      </div>
    </div>
  );
}
