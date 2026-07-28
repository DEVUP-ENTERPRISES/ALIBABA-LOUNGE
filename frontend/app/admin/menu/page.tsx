"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { menuCategories } from "@/lib/menu-data";
import { Input } from "@/components/ui/input";
import { AdminModal } from "@/components/admin/ui/AdminModal";
import { StatusChip } from "@/components/admin/ui/StatusChip";
import { MenuTagBadge } from "@/components/ui/MenuTagBadge";
import { MenuItemForm } from "@/components/admin/menu/MenuItemForm";
import type { MenuItem, MenuTag } from "@/lib/menu/types";
import { cn } from "@/lib/utils";
import { menuApi } from "@/lib/admin/data-api";
import { resolveImageUrl } from "@/lib/image-url";

export default function AdminMenuPage() {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [editItem, setEditItem] = useState<MenuItem | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadMenu = async () => {
    setLoading(true);
    try {
      setMenuItems(await menuApi.list("?limit=100"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- loads server-backed admin table data on mount.
    void loadMenu();
  }, []);

  const filtered = useMemo(() => {
    return menuItems.filter((item) => {
      const matchCat =
        categoryFilter === "all" || item.category === categoryFilter;
      const matchSearch =
        search === "" ||
        item.name.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [menuItems, search, categoryFilter]);

  const closeForm = () => {
    setAddOpen(false);
    setEditItem(null);
  };

  const saveItem = async (payload: Parameters<typeof menuApi.create>[0]) => {
    if (editItem) {
      await menuApi.update(editItem.id, payload);
    } else {
      await menuApi.create(payload);
    }
    closeForm();
    await loadMenu();
  };

  const deleteItem = async () => {
    if (!deleteId) return;
    await menuApi.remove(deleteId);
    setDeleteId(null);
    await loadMenu();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-md flex-1">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-white/30" />
          <Input
            placeholder="Search menu items..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <button
          type="button"
          onClick={() => setAddOpen(true)}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#8b6914] via-[#d4af37] to-[#8b6914] px-5 py-2.5 text-sm font-medium text-[#050505] transition-shadow hover:shadow-[0_0_24px_rgba(212,175,55,0.3)]"
        >
          <Plus className="size-4" />
          Add Item
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setCategoryFilter("all")}
          className={cn(
            "rounded-full border px-4 py-1.5 text-xs transition-colors",
            categoryFilter === "all"
              ? "border-[#d4af37]/40 bg-[#d4af37]/10 text-[#d4af37]"
              : "border-white/10 text-white/45"
          )}
        >
          All
        </button>
        {menuCategories.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setCategoryFilter(c.id)}
            className={cn(
              "rounded-full border px-4 py-1.5 text-xs transition-colors",
              categoryFilter === c.id
                ? "border-[#d4af37]/40 bg-[#d4af37]/10 text-[#d4af37]"
                : "border-white/10 text-white/45"
            )}
          >
            {c.label}
          </button>
        ))}
      </div>

      <div className="glass-luxury overflow-x-auto rounded-2xl">
        <table className="w-full min-w-[800px] text-left text-sm">
          <thead>
            <tr className="border-b border-white/[0.06] font-[family-name:var(--font-accent)] text-[10px] tracking-[0.2em] text-white/40 uppercase">
              <th className="px-4 py-4">Image</th>
              <th className="px-4 py-4">Item</th>
              <th className="px-4 py-4">Category</th>
              <th className="px-4 py-4">Tags</th>
              <th className="px-4 py-4">Price</th>
              <th className="px-4 py-4">Status</th>
              <th className="px-4 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.slice(0, 50).map((item) => (
              <tr
                key={item.id}
                className="border-b border-white/[0.04] transition-colors hover:bg-white/[0.02]"
              >
                <td className="px-4 py-3">
                  <div className="relative size-12 overflow-hidden rounded-lg border border-white/[0.06]">
                    <Image
                      src={resolveImageUrl(item.image)}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="48px"
                    />
                  </div>
                </td>
                <td className="px-4 py-3">
                  <p className="font-medium text-white">{item.name}</p>
                  <p className="line-clamp-1 text-xs text-white/40">
                    {item.subcategory}
                  </p>
                </td>
                <td className="px-4 py-3 capitalize text-white/60">
                  {item.category}
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {item.tags?.slice(0, 2).map((t) => (
                      <MenuTagBadge key={t} tag={t as MenuTag} />
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3 font-[family-name:var(--font-display)] text-[#d4af37]">
                  ${item.price}
                </td>
                <td className="px-4 py-3">
                  <StatusChip status="Published" />
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setEditItem(item)}
                      className="rounded-lg border border-white/10 p-2 text-white/50 hover:text-[#d4af37]"
                      aria-label="Edit"
                    >
                      <Pencil className="size-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteId(item.id)}
                      className="rounded-lg border border-white/10 p-2 text-white/50 hover:text-rose-400"
                      aria-label="Delete"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {loading && <p className="px-4 py-4 text-center text-sm text-white/40">Loading menu...</p>}
        {filtered.length > 50 && (
          <p className="px-4 py-3 text-center text-xs text-white/35">
            Showing 50 of {filtered.length} items
          </p>
        )}
      </div>

      <AdminModal
        open={addOpen || !!editItem}
        onClose={closeForm}
        title={editItem ? "Edit Menu Item" : "Add Menu Item"}
        wide
      >
        <MenuItemForm
          key={editItem?.id ?? "new"}
          item={editItem}
          onCancel={closeForm}
          onSave={(payload) => void saveItem(payload)}
        />
      </AdminModal>

      <AdminModal
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        title="Delete Menu Item"
      >
        <p className="font-[family-name:var(--font-body)] text-sm text-white/55">
          This will permanently delete the menu item and its image. Are you sure?
        </p>
        <div className="mt-6 flex gap-3">
          <button
            type="button"
            className="rounded-full bg-rose-600/80 px-5 py-2 text-sm text-white"
            onClick={() => void deleteItem()}
          >
            Delete
          </button>
          <button
            type="button"
            className="rounded-full border border-white/15 px-5 py-2 text-sm text-white/60"
            onClick={() => setDeleteId(null)}
          >
            Cancel
          </button>
        </div>
      </AdminModal>
    </div>
  );
}
