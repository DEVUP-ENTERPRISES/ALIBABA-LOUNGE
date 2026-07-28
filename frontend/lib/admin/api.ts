export const ADMIN_TOKEN_COOKIE = "sheesh_admin_token";

import { API_ORIGIN, resolveImageUrl } from "@/lib/image-url";

export const API_BASE_URL = API_ORIGIN;

export function resolveApiAssetUrl(url?: string | null) {
  return resolveImageUrl(url);
}

export interface AdminProfile {
  id: string;
  name: string;
  email: string;
  role: "admin" | "super-admin";
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
