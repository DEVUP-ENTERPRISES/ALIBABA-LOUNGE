/**
 * Small cookie helper.
 *
 * Used instead of localStorage/sessionStorage so state is shared across tabs,
 * survives a browser restart where intended, and is readable by the server if
 * we ever need it during rendering. Everything stored here is a preference or
 * a table reference — never a credential.
 */

const isSecure = () =>
  typeof window !== "undefined" && window.location.protocol === "https:";

export function setCookie(
  name: string,
  value: string,
  options: { maxAgeSeconds?: number } = {}
) {
  if (typeof document === "undefined") return;

  const parts = [
    `${encodeURIComponent(name)}=${encodeURIComponent(value)}`,
    "path=/",
    // Lax keeps it on normal navigation while blocking cross-site sends.
    "SameSite=Lax",
  ];

  // Omitting Max-Age makes it a session cookie, cleared when the browser closes.
  if (typeof options.maxAgeSeconds === "number") {
    parts.push(`Max-Age=${Math.max(0, Math.floor(options.maxAgeSeconds))}`);
  }
  if (isSecure()) parts.push("Secure");

  document.cookie = parts.join("; ");
}

export function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;

  const target = encodeURIComponent(name);
  for (const chunk of document.cookie.split("; ")) {
    const eq = chunk.indexOf("=");
    if (eq === -1) continue;
    if (chunk.slice(0, eq) === target) {
      try {
        return decodeURIComponent(chunk.slice(eq + 1));
      } catch {
        return null;
      }
    }
  }
  return null;
}

export function deleteCookie(name: string) {
  setCookie(name, "", { maxAgeSeconds: 0 });
}

/** Convenience for objects; returns null rather than throwing on bad JSON. */
export function getJsonCookie<T>(name: string): T | null {
  const raw = getCookie(name);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    deleteCookie(name);
    return null;
  }
}

export function setJsonCookie(name: string, value: unknown, maxAgeSeconds?: number) {
  setCookie(name, JSON.stringify(value), { maxAgeSeconds });
}
