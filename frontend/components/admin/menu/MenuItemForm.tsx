"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AdminSelect } from "@/components/admin/ui/AdminSelect";
import { ImageUploadField } from "@/components/admin/ui/ImageUploadField";
import {
  adminCategoryOptions,
  adminSubcategoryOptions,
  adminTagOptions,
} from "@/lib/admin/form-options";
import type { MenuItem, MenuCategory, MenuTag } from "@/lib/menu/types";
import { cn } from "@/lib/utils";

interface MenuItemFormProps {
  item?: MenuItem | null;
  onCancel: () => void;
  onSave?: (payload: FormData | Record<string, unknown>) => void;
}

export function MenuItemForm({ item, onCancel, onSave }: MenuItemFormProps) {
  const [category, setCategory] = useState<MenuCategory>(item?.category ?? "food");
  const [subcategory, setSubcategory] = useState(item?.subcategory ?? "");
  const [selectedTags, setSelectedTags] = useState<MenuTag[]>(item?.tags ?? []);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const subOptions = adminSubcategoryOptions[category] ?? [];

  useEffect(() => {
    if (item) {
      setCategory(item.category);
      setSubcategory(item.subcategory ?? "");
      setSelectedTags(item.tags ?? []);
      return;
    }
    setCategory("food");
    setSubcategory("");
    setSelectedTags([]);
  }, [item]);

  useEffect(() => {
    const valid = subOptions.some((o) => o.value === subcategory);
    if (!valid && subOptions[0]) {
      setSubcategory(subOptions[0].value);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reset subcategory when category changes
  }, [category]);

  const toggleTag = (tag: MenuTag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  return (
    <form
      className="space-y-5"
      onSubmit={(e) => {
        e.preventDefault();
        const form = new FormData(e.currentTarget);
        const featured = form.get("featured") === "on";

        if (imageFile) {
          const fd = new FormData();
          fd.append("image", imageFile);
          fd.append("title", String(form.get("title") || ""));
          fd.append("description", String(form.get("description") || ""));
          fd.append("category", category);
          fd.append("subcategory", subcategory);
          fd.append("price", String(form.get("price") || "0"));
          fd.append("featured", String(featured));
          fd.append("layout", featured ? "wide" : "default");
          fd.append("isAvailable", "true");
          fd.append("tags", JSON.stringify(selectedTags));
          onSave?.(fd);
        } else {
          onSave?.({
            title: String(form.get("title") || ""),
            description: String(form.get("description") || ""),
            category,
            subcategory,
            price: Number(form.get("price") || 0),
            image: item?.image || "",
            tags: selectedTags,
            featured,
            layout: featured ? "wide" : "default",
            isAvailable: true,
          });
        }
      }}
    >
      <ImageUploadField
        label="Item Image"
        hint="High-quality food, drink, or hookah photography · preview before save"
        initialPreview={item?.image ?? null}
        aspect="video"
        onFileChange={setImageFile}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="menu-name">Name</Label>
          <Input
            id="menu-name"
            name="title"
            defaultValue={item?.name}
            placeholder="Item name"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="menu-price">Price ($)</Label>
          <Input
            id="menu-price"
            name="price"
            type="number"
            min={0}
            step={0.01}
            defaultValue={item?.price}
            placeholder="0.00"
            required
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <AdminSelect
          label="Category"
          value={category}
          onChange={(v) => setCategory(v as MenuCategory)}
          options={adminCategoryOptions}
          placeholder="Select category"
        />
        <AdminSelect
          label="Subcategory"
          value={subcategory}
          onChange={setSubcategory}
          options={subOptions}
          placeholder="Select subcategory"
          disabled={subOptions.length === 0}
        />
      </div>

      <div className="space-y-2">
        <Label>Tags</Label>
        <div className="flex flex-wrap gap-2">
          {adminTagOptions.map((tag) => (
            <button
              key={tag.value}
              type="button"
              onClick={() => toggleTag(tag.value)}
              className={cn(
                "rounded-full border px-3 py-1 font-[family-name:var(--font-accent)] text-[9px] tracking-[0.12em] uppercase transition-all",
                selectedTags.includes(tag.value)
                  ? "border-[#d4af37] bg-[#d4af37]/15 text-[#d4af37]"
                  : "border-white/10 text-white/40 hover:border-white/20"
              )}
            >
              {tag.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="menu-desc">Description</Label>
        <Textarea
          id="menu-desc"
          name="description"
          defaultValue={item?.description}
          rows={3}
          placeholder="Premium description..."
          required
        />
      </div>

      <label className="inline-flex items-center gap-3 text-sm text-white/55">
        <input
          type="checkbox"
          name="featured"
          defaultChecked={item?.featured}
          className="size-4 accent-[#d4af37]"
        />
        Feature this item
      </label>

      <div className="flex flex-wrap gap-3 border-t border-white/[0.06] pt-4">
        <button
          type="submit"
          className="rounded-full bg-[#d4af37] px-6 py-2.5 text-sm font-medium text-[#050505] transition-shadow hover:shadow-[0_0_24px_rgba(212,175,55,0.35)]"
        >
          Save Item
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-full border border-white/15 px-6 py-2.5 text-sm text-white/60 hover:text-white"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
