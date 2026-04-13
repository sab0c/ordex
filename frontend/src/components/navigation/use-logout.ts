"use client";

import { useRouter } from "next/navigation";
import { clearStoredAccessToken } from "@/lib/auth";
import { appRoutes } from "@/lib/routes";

type UseLogoutOptions = {
  onAfterLogout?: () => void;
};

export function useLogout(options?: UseLogoutOptions) {
  const router = useRouter();

  return () => {
    clearStoredAccessToken();
    options?.onAfterLogout?.();
    router.replace(appRoutes.home);
  };
}
