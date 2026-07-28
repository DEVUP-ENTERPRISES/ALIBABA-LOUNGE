"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

interface AdminModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  wide?: boolean;
}

export function AdminModal({
  open,
  onClose,
  title,
  children,
  wide,
}: AdminModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            className={`relative z-10 max-h-[90vh] w-full overflow-y-auto rounded-2xl border border-[#d4af37]/20 bg-[#0c0c0e] shadow-[0_0_60px_rgba(0,0,0,0.5)] ${wide ? "max-w-3xl" : "max-w-lg"}`}
          >
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/[0.06] bg-[#0c0c0e]/95 px-6 py-4 backdrop-blur-md">
              <h2 className="font-[family-name:var(--font-display)] text-xl text-white">
                {title}
              </h2>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg p-1 text-white/50 transition-colors hover:bg-white/5 hover:text-white"
                aria-label="Close"
              >
                <X className="size-5" />
              </button>
            </div>
            <div className="p-6">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
