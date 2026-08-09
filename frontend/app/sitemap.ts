import type { MetadataRoute } from "next";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "https://alibaba-lounge.vercel.app";

const ROUTES = [
  { path: "", priority: 1.0 },
  { path: "/menu", priority: 0.9 },
  { path: "/reservation", priority: 0.9 },
  { path: "/events", priority: 0.8 },
  { path: "/gallery", priority: 0.7 },
  { path: "/catering", priority: 0.7 },
  { path: "/franchise", priority: 0.6 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return ROUTES.map(({ path, priority }) => ({
    url: `${SITE_URL}${path}`,
    lastModified,
    changeFrequency: "weekly" as const,
    priority,
  }));
}
