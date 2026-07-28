"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { API_BASE_URL, parseApiError, type AdminProfile } from "@/lib/admin/api";
import { ADMIN_BASE } from "@/lib/admin/navigation";

interface LoginPayload {
  email: string;
  password: string;
  rememberMe: boolean;
}

type AuthStatus = "loading" | "authenticated" | "unauthenticated";

interface AdminAuthContextValue {
  admin: AdminProfile | null;
  status: AuthStatus;
  login: (payload: LoginPayload) => Promise<AdminProfile>;
  logout: () => Promise<void>;
  refreshAdmin: () => Promise<AdminProfile | null>;
}

const AdminAuthContext = createContext<AdminAuthContextValue | null>(null);

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [admin, setAdmin] = useState<AdminProfile | null>(null);
  const [status, setStatus] = useState<AuthStatus>("loading");

  const refreshAdmin = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        method: "GET",
        credentials: "include",
        headers: { Accept: "application/json" },
      });

      if (!response.ok) {
        setAdmin(null);
        setStatus("unauthenticated");
        return null;
      }

      const data = (await response.json()) as { admin: AdminProfile };
      setAdmin(data.admin);
      setStatus("authenticated");
      return data.admin;
    } catch {
      setAdmin(null);
      setStatus("unauthenticated");
      return null;
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- synchronizes auth state from the backend session cookie.
    void refreshAdmin();
  }, [refreshAdmin]);

  const login = useCallback(
    async ({ email, password, rememberMe }: LoginPayload) => {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ email, password, rememberMe }),
      });

      if (!response.ok) {
        throw new Error(await parseApiError(response));
      }

      const data = (await response.json()) as { admin: AdminProfile };
      setAdmin(data.admin);
      setStatus("authenticated");
      return data.admin;
    },
    []
  );

  const logout = useCallback(async () => {
    try {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
        headers: { Accept: "application/json" },
      });
    } finally {
      setAdmin(null);
      setStatus("unauthenticated");
      router.replace(`${ADMIN_BASE}/login`);
    }
  }, [router]);

  const value = useMemo(
    () => ({ admin, status, login, logout, refreshAdmin }),
    [admin, status, login, logout, refreshAdmin]
  );

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);

  if (!context) {
    throw new Error("useAdminAuth must be used within AdminAuthProvider");
  }

  return context;
}
