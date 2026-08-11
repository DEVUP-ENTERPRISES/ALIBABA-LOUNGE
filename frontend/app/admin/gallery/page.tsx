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

  const loadImages = async () => setImages(await galleryApi.list("?limit=500"));

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
      <section className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 md:p-8 shadow-sm">
        <h2 className="text-xl font-semibold text-zinc-100">
          Upload to Gallery
        </h2>
        <p className="mt-1 text-sm text-zinc-400">
          Drag & drop with live preview before adding to the grid
        </p>

        <div className="mt-8 grid gap-8 lg:grid-cols-[320px_1fr] xl:grid-cols-[360px_1fr]">
          <div className="mx-auto w-full max-w-sm lg:mx-0 lg:max-w-none">
            <ImageUploadField
              key={uploadKey}
              label="Gallery Image"
              hint="Luxury lounge, food, or event photography"
              aspect="gallery"
              onFileChange={setPendingFile}
              onPreviewChange={setPendingPreview}
            />
          </div>

          <div className="flex flex-col justify-center space-y-6">
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="gal-title">Title</Label>
                <Input
                  id="gal-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Image title"
                  className="h-[52px]"
                />
              </div>
              <AdminSelect
                label="Category"
                value={category}
                onChange={setCategory}
                options={galleryCategoryOptions}
              />
            </div>

            <div>
              <button
                type="button"
                disabled={!pendingPreview}
                onClick={() => void addImage()}
                className="rounded-lg bg-blue-600 px-8 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-blue-500 disabled:pointer-events-none disabled:opacity-50"
              >
                Add to Gallery
              </button>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {images.map((img) => (
          <div
            key={img.id}
            className="group overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/50"
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
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 to-transparent opacity-60" />
              <div className="absolute top-3 right-3 flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                <button
                  type="button"
                  onClick={() => openEdit(img)}
                  className="rounded-lg border border-zinc-700 bg-zinc-900/80 p-2 text-zinc-400 hover:text-blue-400"
                  aria-label="Edit"
                >
                  <Pencil className="size-4" />
                </button>
                <button
                  type="button"
                  onClick={() => void remove(img.id)}
                  className="rounded-lg border border-zinc-700 bg-zinc-900/80 p-2 text-zinc-400 hover:text-rose-400"
                  aria-label="Delete"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            </div>
            <div className="p-4 border-t border-zinc-800/50">
              <p className="text-sm font-medium text-zinc-100 truncate">
                {img.title}
              </p>
              <p className="text-xs text-zinc-500 mt-0.5">{img.category}</p>
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
              aspect="gallery"
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
            <div className="flex gap-3 border-t border-zinc-800 pt-4">
              <button
                type="button"
                onClick={() => void updateImage()}
                className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-500"
              >
                Save Changes
              </button>
              <button
                type="button"
                onClick={() => setEditing(null)}
                className="rounded-lg border border-zinc-700 bg-transparent px-5 py-2 text-sm font-medium text-zinc-300 hover:bg-zinc-800"
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
