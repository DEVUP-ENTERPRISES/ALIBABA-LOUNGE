"use client";

import { ImageUploadField } from "@/components/admin/ui/ImageUploadField";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export default function AdminSettingsPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <section className="glass-luxury rounded-2xl p-6 md:p-8">
        <h2 className="font-[family-name:var(--font-display)] text-xl text-white">
          Restaurant Settings
        </h2>
        <form className="mt-6 space-y-4" onSubmit={(e) => e.preventDefault()}>
          <div className="space-y-2">
            <Label>Brand Name</Label>
            <Input defaultValue="Sheesh Eatery & Lounge" />
          </div>
          <div className="space-y-2">
            <Label>Tagline</Label>
            <Input defaultValue="Where luxury meets flavor." />
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              rows={3}
              defaultValue="Dallas's premier hookah lounge & dining destination."
            />
          </div>
        </form>
      </section>

      <section className="glass-luxury rounded-2xl p-6 md:p-8">
        <h2 className="font-[family-name:var(--font-display)] text-xl text-white">
          Opening Hours
        </h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Sun – Thu</Label>
            <Input defaultValue="11 AM – 2 AM" />
          </div>
          <div className="space-y-2">
            <Label>Fri – Sat</Label>
            <Input defaultValue="11 AM – 3 AM" />
          </div>
        </div>
      </section>

      <section className="glass-luxury rounded-2xl p-6 md:p-8">
        <h2 className="font-[family-name:var(--font-display)] text-xl text-white">
          Contact
        </h2>
        <div className="mt-6 space-y-4">
          <div className="space-y-2">
            <Label>Phone</Label>
            <Input defaultValue="+1 (214) 407-7941" />
          </div>
          <div className="space-y-2">
            <Label>Location</Label>
            <Input defaultValue="Dallas, TX" />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input type="email" placeholder="hello@sheeshlounge.com" />
          </div>
        </div>
      </section>

      <section className="glass-luxury rounded-2xl p-6 md:p-8">
        <h2 className="font-[family-name:var(--font-display)] text-xl text-white">
          Social Media
        </h2>
        <div className="mt-6 space-y-4">
          <div className="space-y-2">
            <Label>Instagram</Label>
            <Input defaultValue="@Sheeshtx" />
          </div>
        </div>
      </section>

      <section className="glass-luxury rounded-2xl p-6 md:p-8">
        <h2 className="font-[family-name:var(--font-display)] text-xl text-white">
          Page Banners
        </h2>
        <p className="mt-1 text-sm text-white/40">
          Upload hero banners for public pages
        </p>
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <ImageUploadField label="Events Banner" aspect="wide" />
          <ImageUploadField label="Catering Banner" aspect="wide" />
        </div>
      </section>

      <section className="glass-luxury rounded-2xl p-6 md:p-8">
        <h2 className="font-[family-name:var(--font-display)] text-xl text-white">
          Branding
        </h2>
        <div className="mt-6 space-y-4">
          <div className="space-y-2">
            <Label>Primary Gold</Label>
            <Input defaultValue="#d4af37" />
          </div>
          <div className="space-y-2">
            <Label>Background</Label>
            <Input defaultValue="#050505" />
          </div>
        </div>
        <button
          type="button"
          className="mt-8 rounded-full bg-[#d4af37] px-8 py-2.5 text-sm font-medium text-[#050505]"
        >
          Save Settings (UI only)
        </button>
      </section>
    </div>
  );
}
