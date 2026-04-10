"use client";

import { useRouter } from "next/navigation";
import { clearStoredAccessToken } from "@/lib/auth";
import { Button } from "../ui/button";

export function DashboardPage() {
  const router = useRouter();

  function handleLogout() {
    clearStoredAccessToken();
    router.replace("/");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 py-10">
      <div className="flex flex-col items-center gap-6 text-center">
        <p className="text-3xl font-semibold tracking-tight text-foreground">entrou</p>
        <Button onClick={handleLogout}>Sair</Button>
      </div>
    </main>
  );
}
