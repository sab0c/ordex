"use client";

import { useAuthRedirect } from "@/hooks/use-auth-redirect";
import { AuthScreenFallback } from "./auth-screen-fallback";

type AuthenticatedRouteProps = {
  children: (session: {
    isReady: boolean;
    token: string | null;
  }) => React.ReactNode;
};

export function AuthenticatedRoute({
  children,
}: Readonly<AuthenticatedRouteProps>) {
  const { isReady, token } = useAuthRedirect("authenticated");

  if (!isReady) {
    return <>{children({ isReady: false, token: null })}</>;
  }

  if (!token) {
    return <AuthScreenFallback message="Carregando área autenticada..." />;
  }

  return <>{children({ isReady: true, token })}</>;
}
