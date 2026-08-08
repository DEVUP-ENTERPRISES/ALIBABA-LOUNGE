"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Edit, Star, Loader2 } from "lucide-react";
import { AdminModal } from "@/components/admin/ui/AdminModal";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { reviewApi } from "@/lib/admin/data-api";
import type { AdminReview } from "@/lib/admin/types";

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<AdminReview | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [form, setForm] = useState({
    author: "",
    role: "Regular Guest",
    quote: "",
    stars: 5,
    initial: "",
    isFeatured: true,
    isApproved: true,
  });

  const loadReviews = async () => {
    setLoading(true);
    try {
      setReviews(await reviewApi.list());
    } catch {
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadReviews();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({
      author: "",
      role: "Regular Guest",
      quote: "",
      stars: 5,
      initial: "",
      isFeatured: true,
      isApproved: true,
    });
    setModalOpen(true);
  };

  const openEdit = (review: AdminReview) => {
    setEditing(review);
    setForm({
      author: review.author,
      role: review.role,
      quote: review.quote,
      stars: review.stars,
      initial: review.initial,
      isFeatured: review.isFeatured,
      isApproved: review.isApproved,
    });
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await reviewApi.update(editing.id, form as unknown as Record<string, unknown>);
      } else {
        await reviewApi.create(form as unknown as Record<string, unknown>);
      }
      setModalOpen(false);
      await loadReviews();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to save review.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await reviewApi.remove(deleteId);
      setDeleteId(null);
      await loadReviews();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete review.");
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-2xl text-white">
            Guest Reviews & Testimonials
          </h1>
          <p className="text-sm text-white/50">
            Manage customer feedback displayed on the homepage review marquee.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-[#d4af37] px-6 py-2.5 text-sm font-semibold text-[#050505] transition hover:brightness-110"
        >
          <Plus className="h-4 w-4" /> Add Review
        </button>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#d4af37]" />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="glass-luxury relative flex flex-col justify-between rounded-2xl p-6 transition-all hover:border-[#d4af37]/30"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex gap-1 text-[#d4af37]">
                    {Array.from({ length: review.stars }).map((_, i) => (
                      <Star key={i} className="h-3.5 w-3.5 fill-[#d4af37]" />
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => openEdit(review)}
                      className="rounded-lg p-1.5 text-white/50 hover:bg-white/10 hover:text-white"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteId(review.id)}
                      className="rounded-lg p-1.5 text-rose-400/60 hover:bg-rose-500/10 hover:text-rose-400"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <p className="mt-4 text-sm italic text-white/80">
                  &ldquo;{review.quote}&rdquo;
                </p>
              </div>

              <div className="mt-6 flex items-center gap-3 border-t border-white/5 pt-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#d4af37]/15 font-[family-name:var(--font-display)] text-xs font-semibold text-[#d4af37]">
                  {review.initial}
                </div>
                <div>
                  <p className="font-medium text-white">{review.author}</p>
                  <p className="text-xs text-white/40">{review.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      <AdminModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Edit Review" : "Add Guest Review"}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Author Name</Label>
              <Input
                required
                value={form.author}
                onChange={(e) => setForm({ ...form, author: e.target.value })}
                placeholder="Amir K."
              />
            </div>
            <div className="space-y-2">
              <Label>Role / Tagline</Label>
              <Input
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                placeholder="Regular Guest"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Quote / Review Text</Label>
            <Textarea
              required
              rows={4}
              value={form.quote}
              onChange={(e) => setForm({ ...form, quote: e.target.value })}
              placeholder="Alibaba is Dallas's premier hookah lounge..."
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Stars (1-5)</Label>
              <Input
                type="number"
                min={1}
                max={5}
                value={form.stars}
                onChange={(e) => setForm({ ...form, stars: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label>Avatar Initial</Label>
              <Input
                value={form.initial}
                onChange={(e) => setForm({ ...form, initial: e.target.value })}
                placeholder="AK"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="rounded-full border border-white/10 px-5 py-2 text-xs text-white/60 hover:bg-white/5"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-full bg-[#d4af37] px-6 py-2 text-xs font-semibold text-[#050505] hover:brightness-110"
            >
              {saving ? "Saving..." : editing ? "Update Review" : "Create Review"}
            </button>
          </div>
        </form>
      </AdminModal>

      {/* Delete Modal */}
      <AdminModal
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        title="Delete Review"
      >
        <p className="text-sm text-white/70">
          Are you sure you want to delete this guest review? This action cannot be undone.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => setDeleteId(null)}
            className="rounded-full border border-white/10 px-5 py-2 text-xs text-white/60 hover:bg-white/5"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="rounded-full bg-rose-500 px-6 py-2 text-xs font-semibold text-white hover:bg-rose-600"
          >
            Delete
          </button>
        </div>
      </AdminModal>
    </div>
  );
}
