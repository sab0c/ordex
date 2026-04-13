"use client";

import { AuthenticatedSessionProvider } from "@/contexts/authenticated-session-context";
import { useAuthRedirect } from "@/hooks/use-auth-redirect";
import { AppShell } from "@/components/layout/app-shell";

export function AuthenticatedAppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { isReady, token } = useAuthRedirect("authenticated");

  if (!isReady || !token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-muted-foreground">
        Carregando área autenticada...
      </div>
    );
  }

  return (
    <AuthenticatedSessionProvider token={token}>
      <AppShell>{children}</AppShell>
    </AuthenticatedSessionProvider>
  );
}
