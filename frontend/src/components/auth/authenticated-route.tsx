"use client";

import { useAuthRedirect } from "@/hooks/use-auth-redirect";
import { AuthScreenFallback } from "./auth-screen-fallback";

type AuthenticatedRouteProps = {
  children: (token: string) => React.ReactNode;
};

export function AuthenticatedRoute({
  children,
}: Readonly<AuthenticatedRouteProps>) {
  const { isReady, token } = useAuthRedirect("authenticated");

  if (!isReady || !token) {
    return <AuthScreenFallback message="Carregando área autenticada..." />;
  }

  return <>{children(token)}</>;
}
