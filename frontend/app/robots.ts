import type { MetadataRoute } from "next";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "https://alibaba-lounge.vercel.app";

// The admin slug is deliberately NOT listed here — robots.txt is public, and
// naming it would advertise the one thing it is meant to keep quiet. Those
// routes are unreachable to crawlers anyway (proxy.ts requires an auth cookie).
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/account", "/login", "/signup"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
