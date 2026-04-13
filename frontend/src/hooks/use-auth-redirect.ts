"use client";

import { useRouter } from "next/navigation";
import { useEffect, useSyncExternalStore } from "react";
import { getStoredAccessToken, subscribeToAuthChange } from "@/lib/auth";
import { appRoutes } from "@/lib/routes";

export type AuthMode = "authenticated" | "guest";

function getServerSnapshot(): string | null {
  return null;
}

function subscribeToHydration(callback: () => void): () => void {
  void callback;
  return () => undefined;
}

function getClientHydrationSnapshot(): boolean {
  return true;
}

function getServerHydrationSnapshot(): boolean {
  return false;
}

export function useAuthRedirect(mode: AuthMode) {
  const router = useRouter();
  const isHydrated = useSyncExternalStore(
    subscribeToHydration,
    getClientHydrationSnapshot,
    getServerHydrationSnapshot,
  );
  const token = useSyncExternalStore(
    subscribeToAuthChange,
    getStoredAccessToken,
    getServerSnapshot,
  );

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    const isAuthenticated = Boolean(token);

    if (mode === "authenticated" && !isAuthenticated) {
      router.replace(appRoutes.home);
      return;
    }

    if (mode === "guest" && isAuthenticated) {
      router.replace(appRoutes.dashboard);
    }
  }, [isHydrated, mode, router, token]);

  return {
    isReady: isHydrated,
    token,
  };
}
