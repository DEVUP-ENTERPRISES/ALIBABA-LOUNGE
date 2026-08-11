"use client";

import { useEffect, useState } from "react";
import { ImageUploadField } from "@/components/admin/ui/ImageUploadField";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { settingApi } from "@/lib/admin/data-api";
import type { AdminSetting } from "@/lib/admin/types";
import { Check, Loader2 } from "lucide-react";

const defaultSettings: AdminSetting = {
  brandName: "Alibaba Hookah Lounge",
  tagline: "Where luxury meets flavor.",
  description: "Dallas's premier hookah lounge & dining destination.",
  phone: "+1 (469) 586-5437",
  location: "Dallas, TX",
  email: "alibabahookah2238@gmail.com",
  instagram: "@alibabalounge01",
  instagramUrl: "https://instagram.com/alibabalounge01",
  hoursSunThu: "1 PM – 2 AM",
  hoursFriSat: "1 PM – 4 AM",
  eventsBanner: "",
  cateringBanner: "",
};

export default function AdminSettingsPage() {
  const [form, setForm] = useState<AdminSetting>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    settingApi
      .get()
      .then((data) => {
        if (mounted && data) setForm((prev) => ({ ...prev, ...data }));
      })
      .catch(() => {})
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const handleChange = (field: keyof AdminSetting, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setSaved(false);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const updated = await settingApi.update(form as unknown as Record<string, unknown>);
      setForm(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save settings.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#d4af37]" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-3xl space-y-8 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-2xl text-white">
            Site Settings & Configuration
          </h1>
          <p className="text-sm text-white/50">
            Manage public brand info, contact details, operating hours, and social media.
          </p>
        </div>
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-full bg-[#d4af37] px-6 py-2.5 text-sm font-semibold text-[#050505] transition hover:brightness-110 disabled:opacity-50"
        >
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Saving...
            </>
          ) : saved ? (
            <>
              <Check className="h-4 w-4" /> Saved!
            </>
          ) : (
            "Save Changes"
          )}
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-4 text-sm text-rose-300">
          {error}
        </div>
      )}

      {/* Brand Settings */}
      <section className="glass-luxury rounded-2xl p-6 md:p-8">
        <h2 className="font-[family-name:var(--font-display)] text-xl text-white">
          Restaurant & Brand Info
        </h2>
        <div className="mt-6 space-y-4">
          <div className="space-y-2">
            <Label>Brand Name</Label>
            <Input
              value={form.brandName}
              onChange={(e) => handleChange("brandName", e.target.value)}
              placeholder="Alibaba Hookah Lounge"
            />
          </div>
          <div className="space-y-2">
            <Label>Tagline</Label>
            <Input
              value={form.tagline}
              onChange={(e) => handleChange("tagline", e.target.value)}
              placeholder="Where luxury meets flavor."
            />
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              rows={3}
              value={form.description}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="Dallas's premier hookah lounge & dining destination."
            />
          </div>
        </div>
      </section>

      {/* Opening Hours */}
      <section className="glass-luxury rounded-2xl p-6 md:p-8">
        <h2 className="font-[family-name:var(--font-display)] text-xl text-white">
          Opening Hours
        </h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Sun – Thu</Label>
            <Input
              value={form.hoursSunThu}
              onChange={(e) => handleChange("hoursSunThu", e.target.value)}
              placeholder="1 PM – 2 AM"
            />
          </div>
          <div className="space-y-2">
            <Label>Fri – Sat</Label>
            <Input
              value={form.hoursFriSat}
              onChange={(e) => handleChange("hoursFriSat", e.target.value)}
              placeholder="1 PM – 4 AM"
            />
          </div>
        </div>
      </section>

      {/* Contact Info */}
      <section className="glass-luxury rounded-2xl p-6 md:p-8">
        <h2 className="font-[family-name:var(--font-display)] text-xl text-white">
          Contact Details
        </h2>
        <div className="mt-6 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input
                value={form.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                placeholder="+1 (469) 586-5437"
              />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => handleChange("email", e.target.value)}
                placeholder="alibabahookah2238@gmail.com"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Location</Label>
            <Input
              value={form.location}
              onChange={(e) => handleChange("location", e.target.value)}
              placeholder="Dallas, TX"
            />
          </div>
        </div>
      </section>

      {/* Social Media */}
      <section className="glass-luxury rounded-2xl p-6 md:p-8">
        <h2 className="font-[family-name:var(--font-display)] text-xl text-white">
          Social Media
        </h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Instagram Handle</Label>
            <Input
              value={form.instagram}
              onChange={(e) => handleChange("instagram", e.target.value)}
              placeholder="@alibabalounge01"
            />
          </div>
          <div className="space-y-2">
            <Label>Instagram URL</Label>
            <Input
              value={form.instagramUrl}
              onChange={(e) => handleChange("instagramUrl", e.target.value)}
              placeholder="https://instagram.com/alibabalounge01"
            />
          </div>
        </div>
      </section>

      {/* Page Banners */}
      <section className="glass-luxury rounded-2xl p-6 md:p-8">
        <h2 className="font-[family-name:var(--font-display)] text-xl text-white">
          Page Hero Banners
        </h2>
        <p className="mt-1 text-sm text-white/40">
          Upload hero banner image URLs for custom landing pages.
        </p>
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <ImageUploadField
            label="Events Banner"
            aspect="wide"
            value={form.eventsBanner}
            onChange={(url) => handleChange("eventsBanner", url)}
          />
          <ImageUploadField
            label="Catering Banner"
            aspect="wide"
            value={form.cateringBanner}
            onChange={(url) => handleChange("cateringBanner", url)}
          />
        </div>
      </section>
    </form>
  );
}
