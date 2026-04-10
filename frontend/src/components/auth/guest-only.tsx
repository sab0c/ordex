"use client";

import { useAuthRedirect } from "@/hooks/use-auth-redirect";

export function GuestOnly({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { isReady } = useAuthRedirect("guest");

  if (!isReady) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-muted-foreground">
        Carregando...
      </div>
    );
  }

  return <>{children}</>;
}
