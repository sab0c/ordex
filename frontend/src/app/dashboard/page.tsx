"use client";

import { DashboardPage } from "@/components/dashboard/dashboard-page";
import { useAuthRedirect } from "@/hooks/use-auth-redirect";

export default function DashboardRoute() {
  const { isReady } = useAuthRedirect("authenticated");

  if (!isReady) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-muted-foreground">
        Carregando...
      </div>
    );
  }

  return <DashboardPage />;
}
