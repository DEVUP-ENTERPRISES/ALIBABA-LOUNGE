import type { NextConfig } from "next";

const ADMIN_SLUG = process.env.NEXT_PUBLIC_ADMIN_SLUG || "admin";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      // Map /<slug>/admin and /<slug>/admin/* → /admin and /admin/*
      { source: `/${ADMIN_SLUG}/admin`, destination: "/admin" },
      { source: `/${ADMIN_SLUG}/admin/:path*`, destination: "/admin/:path*" },
    ];
  },

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.pexels.com",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
    dangerouslyAllowLocalIP: true,
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 2592000,
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [48, 96, 128, 256, 384],
  },
};

export default nextConfig;
