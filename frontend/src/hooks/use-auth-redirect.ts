"use client";

import { useRouter } from "next/navigation";
import { useEffect, useSyncExternalStore } from "react";
import { getStoredAccessToken, subscribeToAuthChange } from "@/lib/auth";

type AuthMode = "authenticated" | "guest";

function getServerSnapshot(): string | null {
  return null;
}

export function useAuthRedirect(mode: AuthMode) {
  const router = useRouter();
  const token = useSyncExternalStore(
    subscribeToAuthChange,
    getStoredAccessToken,
    getServerSnapshot,
  );

  useEffect(() => {
    const isAuthenticated = Boolean(token);

    if (mode === "authenticated" && !isAuthenticated) {
      router.replace("/");
      return;
    }

    if (mode === "guest" && isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [mode, router, token]);

  return {
    isReady: mode === "authenticated" ? token !== null : token === null,
    token,
  };
}
