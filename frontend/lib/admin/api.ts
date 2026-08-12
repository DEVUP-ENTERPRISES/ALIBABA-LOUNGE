export const ADMIN_TOKEN_COOKIE = "sheesh_admin_token";
export const ADMIN_TOKEN_KEY = "sheesh_admin_token";

import { API_ORIGIN, resolveImageUrl } from "@/lib/image-url";

export const API_BASE_URL = API_ORIGIN;

export function getAdminToken(): string | null {
  if (typeof window === "undefined") return null;
  const fromStorage = localStorage.getItem(ADMIN_TOKEN_KEY);
  if (fromStorage) return fromStorage;

  const match = document.cookie.match(new RegExp(`(?:^|; )${ADMIN_TOKEN_COOKIE}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export function setAdminToken(token: string, rememberMe = true) {
  if (typeof window === "undefined") return;
  localStorage.setItem(ADMIN_TOKEN_KEY, token);

  const maxAge = rememberMe ? 30 * 24 * 60 * 60 : 24 * 60 * 60;
  const isSecure = window.location.protocol === "https:";
  document.cookie = `${ADMIN_TOKEN_COOKIE}=${encodeURIComponent(token)}; path=/; max-age=${maxAge}; SameSite=Lax${isSecure ? "; Secure" : ""}`;
}

export function clearAdminToken() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(ADMIN_TOKEN_KEY);
  document.cookie = `${ADMIN_TOKEN_COOKIE}=; path=/; max-age=0; SameSite=Lax`;
}

export function resolveApiAssetUrl(url?: string | null) {
  return resolveImageUrl(url);
}

export interface AdminProfile {
  id: string;
  name: string;
  email: string;
  role: "super-admin" | "admin" | "manager" | "server";
  isActive: boolean;
  lastLoginAt?: string | null;
}

export async function parseApiError(response: Response) {
  try {
    const data = (await response.json()) as { message?: string };
    return data.message || "Something went wrong. Please try again.";
  } catch {
    return "Something went wrong. Please try again.";
  }
}

