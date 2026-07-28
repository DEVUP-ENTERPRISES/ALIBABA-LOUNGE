"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const ACCEPT = "image/jpeg,image/png,image/webp,image/gif";

export function useImageUpload(initialPreview?: string | null) {
  const [preview, setPreview] = useState<string | null>(initialPreview ?? null);
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const blobRef = useRef<string | null>(null);

  const revokeBlob = useCallback(() => {
    if (blobRef.current) {
      URL.revokeObjectURL(blobRef.current);
      blobRef.current = null;
    }
  }, []);

  const setFromFile = useCallback(
    (next: File | null) => {
      revokeBlob();
      setFile(next);
      if (!next) {
        setPreview(initialPreview ?? null);
        return;
      }
      const url = URL.createObjectURL(next);
      blobRef.current = url;
      setPreview(url);
    },
    [initialPreview, revokeBlob]
  );

  const handleFiles = useCallback(
    (files: FileList | null) => {
      const f = files?.[0];
      if (!f?.type.startsWith("image/")) return;
      setFromFile(f);
    },
    [setFromFile]
  );

  const openPicker = () => inputRef.current?.click();

  const clear = useCallback(() => {
    setFromFile(null);
    if (inputRef.current) inputRef.current.value = "";
  }, [setFromFile]);

  useEffect(() => {
    setPreview(initialPreview ?? null);
  }, [initialPreview]);

  useEffect(() => () => revokeBlob(), [revokeBlob]);

  return {
    preview,
    file,
    dragOver,
    setDragOver,
    inputRef,
    accept: ACCEPT,
    handleFiles,
    openPicker,
    clear,
    setFromFile,
  };
}
