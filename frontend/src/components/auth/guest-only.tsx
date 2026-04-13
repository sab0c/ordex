"use client";

import { useAuthRedirect } from "@/hooks/use-auth-redirect";
import { AuthScreenFallback } from "./auth-screen-fallback";

export function GuestOnly({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { isReady } = useAuthRedirect("guest");

  if (!isReady) {
    return <AuthScreenFallback message="Carregando..." />;
  }

  return <>{children}</>;
}
