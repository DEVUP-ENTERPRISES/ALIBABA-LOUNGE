export const API_ORIGIN =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ||
  "http://localhost:5050/api";

// Static uploads are served from the server root, not under /api.
const ASSET_ORIGIN = API_ORIGIN.replace(/\/api$/, "");

export function resolveImageUrl(url?: string | null, fallback = "") {
  if (!url) return fallback;

  if (
    url.startsWith("http://") ||
    url.startsWith("https://") ||
    url.startsWith("blob:") ||
    url.startsWith("data:")
  ) {
    return url;
  }

  if (url.startsWith("/uploads/")) {
    return `${ASSET_ORIGIN}${url}`;
  }

  return url;
}
