"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Pencil, Trash2 } from "lucide-react";
import { ImageUploadField } from "@/components/admin/ui/ImageUploadField";
import { AdminSelect } from "@/components/admin/ui/AdminSelect";
import { AdminModal } from "@/components/admin/ui/AdminModal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { galleryCategoryOptions } from "@/lib/admin/form-options";
import type { GalleryImage } from "@/lib/admin/types";
import { galleryApi } from "@/lib/admin/data-api";
import { resolveImageUrl } from "@/lib/image-url";

export default function AdminGalleryPage() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Ambiance");
  const [pendingPreview, setPendingPreview] = useState<string | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [editing, setEditing] = useState<GalleryImage | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editCategory, setEditCategory] = useState("Ambiance");
  const [editFile, setEditFile] = useState<File | null>(null);
  const [uploadKey, setUploadKey] = useState(0);

  const loadImages = async () => setImages(await galleryApi.list("?limit=100"));

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- loads server-backed gallery data on mount.
    void loadImages();
  }, []);

  const addImage = async () => {
    if (!pendingPreview) return;
    const payload = new FormData();
    payload.set("title", title || "Untitled");
    payload.set("category", category);
    if (pendingFile) payload.set("image", pendingFile);
    else payload.set("url", pendingPreview);
    await galleryApi.create(payload);
    setTitle("");
    setPendingPreview(null);
    setPendingFile(null);
    setUploadKey((k) => k + 1);
    await loadImages();
  };

  const openEdit = (image: GalleryImage) => {
    setEditing(image);
    setEditTitle(image.title);
    setEditCategory(image.category);
    setEditFile(null);
  };

  const updateImage = async () => {
    if (!editing) return;
    const payload = new FormData();
    payload.set("title", editTitle || "Untitled");
    payload.set("category", editCategory);
    if (editFile) payload.set("image", editFile);
    await galleryApi.update(editing.id, payload);
    setEditing(null);
    await loadImages();
  };

  const remove = async (id: string) => {
    await galleryApi.remove(id);
    await loadImages();
  };

  return (
    <div className="space-y-8">
      <section className="glass-luxury rounded-2xl p-6 md:p-8">
        <h2 className="font-[family-name:var(--font-display)] text-xl text-white">
          Upload to Gallery
        </h2>
        <p className="mt-1 text-sm text-white/40">
          Drag & drop with live preview before adding to the grid
        </p>

        <div className="mt-6 space-y-5">
          <ImageUploadField
            key={uploadKey}
            label="Gallery Image"
            hint="Luxury lounge, food, or event photography"
            aspect="square"
            onFileChange={setPendingFile}
            onPreviewChange={setPendingPreview}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="gal-title">Title</Label>
              <Input
                id="gal-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Image title"
              />
            </div>
            <AdminSelect
              label="Category"
              value={category}
              onChange={setCategory}
              options={galleryCategoryOptions}
            />
          </div>

          <button
            type="button"
            disabled={!pendingPreview}
            onClick={() => void addImage()}
            className="rounded-full bg-[#d4af37] px-6 py-2.5 text-sm font-medium text-[#050505] disabled:cursor-not-allowed disabled:opacity-40"
          >
            Add to Gallery
          </button>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {images.map((img) => (
          <div
            key={img.id}
            className="group glass-luxury overflow-hidden rounded-2xl"
          >
            <div className="relative aspect-square">
              {resolveImageUrl(img.url).startsWith("blob:") ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={resolveImageUrl(img.url)}
                  alt={img.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <Image
                  src={resolveImageUrl(img.url)}
                  alt={img.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="300px"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-[#050505] to-transparent opacity-60" />
              <div className="absolute top-3 right-3 flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                <button
                  type="button"
                  onClick={() => openEdit(img)}
                  className="rounded-lg border border-white/10 bg-[#050505]/80 p-2 text-white/50 hover:text-[#d4af37]"
                  aria-label="Edit"
                >
                  <Pencil className="size-4" />
                </button>
                <button
                  type="button"
                  onClick={() => void remove(img.id)}
                  className="rounded-lg border border-white/10 bg-[#050505]/80 p-2 text-white/50 hover:text-rose-400"
                  aria-label="Delete"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            </div>
            <div className="p-4">
              <p className="font-[family-name:var(--font-body)] text-sm text-white">
                {img.title}
              </p>
              <p className="text-xs text-white/40">{img.category}</p>
            </div>
          </div>
        ))}
      </div>

      <AdminModal
        open={!!editing}
        onClose={() => setEditing(null)}
        title="Edit Gallery Image"
      >
        {editing && (
          <div className="space-y-5">
            <ImageUploadField
              label="Replace Image"
              initialPreview={resolveImageUrl(editing.url)}
              aspect="square"
              onFileChange={setEditFile}
            />
            <div className="space-y-2">
              <Label htmlFor="edit-gal-title">Title</Label>
              <Input
                id="edit-gal-title"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
              />
            </div>
            <AdminSelect
              label="Category"
              value={editCategory}
              onChange={setEditCategory}
              options={galleryCategoryOptions}
            />
            <div className="flex gap-3 border-t border-white/[0.06] pt-4">
              <button
                type="button"
                onClick={() => void updateImage()}
                className="rounded-full bg-[#d4af37] px-5 py-2 text-sm text-[#050505]"
              >
                Save Changes
              </button>
              <button
                type="button"
                onClick={() => setEditing(null)}
                className="rounded-full border border-white/15 px-5 py-2 text-sm text-white/60"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </AdminModal>
    </div>
  );
}
