"use client";

import { AppShell } from "@/components/layout/app-shell";
import { AuthenticatedSessionProvider } from "@/contexts/authenticated-session-context";
import { AuthenticatedRoute } from "./authenticated-route";

export function AuthenticatedAppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthenticatedRoute>
      {(token) => (
        <AuthenticatedSessionProvider token={token}>
          <AppShell>{children}</AppShell>
        </AuthenticatedSessionProvider>
      )}
    </AuthenticatedRoute>
  );
}
