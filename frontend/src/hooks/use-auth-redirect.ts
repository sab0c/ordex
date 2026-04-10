"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getStoredAccessToken } from "@/lib/auth";

type AuthMode = "authenticated" | "guest";

export function useAuthRedirect(mode: AuthMode) {
  const router = useRouter();
  const [token] = useState<string | null>(() => getStoredAccessToken());

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
    isReady:
      mode === "authenticated" ? token !== null : token === null,
    token,
  };
}
