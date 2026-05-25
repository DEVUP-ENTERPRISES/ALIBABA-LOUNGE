"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChefHat, Flame, Search, Sparkles } from "lucide-react";
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
    <div className="cinematic-backdrop relative min-h-screen overflow-x-hidden pt-24 pb-20 pb-mobile-cta md:pt-28 md:pb-24">
      <FloatingParticles count={10} className="hidden opacity-30 md:block" />
      <SmokeOverlay className="opacity-40" />

      <div className="relative mx-auto mb-10 max-w-7xl px-4 sm:px-6 md:mb-14 md:px-12 lg:px-20">
        <div className="cinematic-frame relative min-h-[360px] overflow-hidden rounded-2xl md:min-h-[430px] md:rounded-3xl">
          <Image
            src={categoryHero[category]}
            alt=""
            fill
            className="object-cover image-cinematic"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-[#050505]/75 to-[#050505]/25" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_left,rgba(212,175,55,0.12),transparent_60%)]" />
          <div className="absolute inset-0 film-grain" />
          <div className="absolute inset-0 flex items-end p-6 sm:p-10 md:p-12">
            <motion.div
              key={category}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
              className="max-w-2xl"
            >
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#d4af37]/30 bg-[#050505]/55 px-4 py-1.5 backdrop-blur-md">
                <Sparkles className="size-3 text-[#d4af37]" />
                <span className="font-[family-name:var(--font-accent)] text-[8px] tracking-[0.26em] text-[#d4af37] uppercase">
                  Curated Discovery
                </span>
              </div>
              <h1 className="font-[family-name:var(--font-display)] text-4xl leading-none text-white sm:text-6xl md:text-7xl">
                Menu as an
                <span className="block text-gold-gradient">Evening Ritual</span>
              </h1>
              <p className="mt-5 max-w-xl font-[family-name:var(--font-body)] text-sm leading-relaxed text-white/62 sm:text-base">
                Explore signature plates, private shisha blends, craft drinks, and late-night desserts through a cinematic menu built for discovery.
              </p>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 md:px-12 lg:px-20">
        <SectionHeading
          eyebrow="Our Menu"
          title="Curated Indulgence"
          subtitle="Elevated plates, signature hookah blends, craft drinks, and decadent desserts - every item presented with cinematic luxury."
        />

        <div className="relative mx-auto mt-10 max-w-2xl">
          <Search className="absolute top-1/2 left-4 size-4 -translate-y-1/2 text-[#d4af37]/50" />
          <Input
            placeholder="Search menu..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-14 rounded-2xl pl-11"
          />
        </div>

        <div className="sticky top-[72px] z-20 -mx-4 mt-8 flex justify-start gap-2 overflow-x-auto border-y border-white/[0.06] bg-[#050505]/78 px-4 py-3 backdrop-blur-2xl sm:mx-0 sm:flex-wrap sm:justify-center sm:border-0 sm:bg-transparent sm:p-0 sm:backdrop-blur-0">
          {menuCategories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => {
                setCategory(cat.id);
                setSubFilter("all");
              }}
              className={cn(
                "shrink-0 rounded-full border px-4 py-2 font-[family-name:var(--font-accent)] text-[9px] tracking-[0.18em] uppercase transition-all duration-300 sm:px-6 sm:py-2.5 sm:text-[10px]",
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

        <div className="mx-auto mt-6 flex w-fit items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-4 py-2 font-[family-name:var(--font-body)] text-sm text-white/42">
          {loading ? <Flame className="size-3.5 animate-pulse text-[#d4af37]" /> : <ChefHat className="size-3.5 text-[#d4af37]/70" />}
          <span>{loading ? "Preparing the menu..." : `${filtered.length} ${filtered.length === 1 ? "item" : "items"}`}</span>
        </div>

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
          <div className="mx-auto mt-16 max-w-md rounded-2xl border border-[#d4af37]/12 bg-white/[0.03] p-8 text-center">
            <ChefHat className="mx-auto size-8 text-[#d4af37]/45" />
            <p className="mt-4 font-[family-name:var(--font-display)] text-2xl text-white">No match found</p>
            <p className="mt-2 font-[family-name:var(--font-body)] text-sm text-white/42">
              Try another category or search for a signature dish.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
