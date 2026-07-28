"use client";

import Image from "next/image";
import { Upload, X, ImageIcon } from "lucide-react";
import { useImageUpload } from "@/hooks/useImageUpload";
import { cn } from "@/lib/utils";
import { resolveImageUrl } from "@/lib/image-url";

interface ImageUploadFieldProps {
  label?: string;
  hint?: string;
  initialPreview?: string | null;
  aspect?: "video" | "square" | "wide";
  onFileChange?: (file: File | null) => void;
  onPreviewChange?: (previewUrl: string | null) => void;
  className?: string;
}

const aspectClass = {
  video: "aspect-video",
  square: "aspect-square",
  wide: "aspect-[21/9]",
};

export function ImageUploadField({
  label = "Upload Image",
  hint = "Drag & drop or click to browse · JPG, PNG, WebP",
  initialPreview,
  aspect = "video",
  onFileChange,
  onPreviewChange,
  className,
}: ImageUploadFieldProps) {
  const resolvedInitialPreview = resolveImageUrl(initialPreview);
  const upload = useImageUpload(resolvedInitialPreview);

  const onInputChange = (files: FileList | null) => {
    upload.handleFiles(files);
    const f = files?.[0] ?? null;
    onFileChange?.(f);
    if (!f) {
      onPreviewChange?.(resolvedInitialPreview || null);
      return;
    }
    const url = URL.createObjectURL(f);
    onPreviewChange?.(url);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    upload.setDragOver(false);
    onInputChange(e.dataTransfer.files);
  };

  const handleClear = () => {
    upload.clear();
    onFileChange?.(null);
    onPreviewChange?.(null);
  };

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <p className="font-[family-name:var(--font-accent)] text-xs tracking-[0.2em] text-[#d4af37]/70 uppercase">
          {label}
        </p>
      )}

      <input
        ref={upload.inputRef}
        type="file"
        accept={upload.accept}
        className="sr-only"
        onChange={(e) => onInputChange(e.target.files)}
      />

      {upload.preview ? (
        <div
          className={cn(
            "group relative overflow-hidden rounded-2xl border border-[#d4af37]/20 bg-[#050505] premium-glow-ring",
            aspectClass[aspect]
          )}
        >
          {resolveImageUrl(upload.preview).startsWith("blob:") ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={resolveImageUrl(upload.preview)}
              alt="Preview"
              className="h-full w-full object-cover"
            />
          ) : (
            <Image
              src={resolveImageUrl(upload.preview)}
              alt="Preview"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 600px"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#050505]/80 via-transparent to-transparent" />
          <div className="absolute top-3 right-3 flex gap-2">
            <button
              type="button"
              onClick={upload.openPicker}
              className="rounded-lg border border-white/15 bg-[#050505]/80 px-3 py-1.5 text-xs text-white/80 backdrop-blur-md transition-colors hover:border-[#d4af37]/40 hover:text-[#d4af37]"
            >
              Replace
            </button>
            <button
              type="button"
              onClick={handleClear}
              className="rounded-lg border border-white/15 bg-[#050505]/80 p-2 text-white/60 backdrop-blur-md hover:text-rose-400"
              aria-label="Remove image"
            >
              <X className="size-4" />
            </button>
          </div>
          {upload.file && (
            <p className="absolute bottom-3 left-3 max-w-[80%] truncate rounded-md bg-[#050505]/80 px-2 py-1 text-[10px] text-white/50 backdrop-blur-md">
              {upload.file.name} · {(upload.file.size / 1024).toFixed(0)} KB
            </p>
          )}
        </div>
      ) : (
        <div
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && upload.openPicker()}
          onClick={upload.openPicker}
          onDragOver={(e) => {
            e.preventDefault();
            upload.setDragOver(true);
          }}
          onDragLeave={() => upload.setDragOver(false)}
          onDrop={handleDrop}
          className={cn(
            "flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 transition-all duration-300",
            aspectClass[aspect],
            upload.dragOver
              ? "border-[#d4af37] bg-[#d4af37]/8 shadow-[0_0_40px_rgba(212,175,55,0.12)]"
              : "border-white/10 bg-white/[0.02] hover:border-[#d4af37]/35 hover:bg-[#d4af37]/5"
          )}
        >
          <div className="flex size-14 items-center justify-center rounded-full border border-[#d4af37]/25 bg-[#d4af37]/10">
            <Upload className="size-6 text-[#d4af37]" />
          </div>
          <p className="mt-4 font-[family-name:var(--font-display)] text-base text-white">
            {label}
          </p>
          <p className="mt-2 max-w-xs text-center font-[family-name:var(--font-body)] text-xs text-white/40">
            {hint}
          </p>
          <span className="mt-4 inline-flex items-center gap-2 rounded-full border border-[#d4af37]/30 px-4 py-1.5 text-[10px] tracking-[0.15em] text-[#d4af37] uppercase">
            <ImageIcon className="size-3.5" />
            Browse Files
          </span>
        </div>
      )}
    </div>
  );
}
