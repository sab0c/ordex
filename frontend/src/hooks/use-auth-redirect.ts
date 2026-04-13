"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useSyncExternalStore } from "react";
import { getStoredAccessToken, subscribeToAuthChange } from "@/lib/auth";

type AuthMode = "authenticated" | "guest";

function getServerSnapshot(): string | null {
  return null;
}

export function useAuthRedirect(mode: AuthMode) {
  const router = useRouter();
  const [isHydrated, setIsHydrated] = useState(false);
  const token = useSyncExternalStore(
    subscribeToAuthChange,
    getStoredAccessToken,
    getServerSnapshot,
  );

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    const isAuthenticated = Boolean(token);

    if (mode === "authenticated" && !isAuthenticated) {
      router.replace("/");
      return;
    }

    if (mode === "guest" && isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [isHydrated, mode, router, token]);

  return {
    isReady: isHydrated,
    token,
  };
}
