"use client";

import { useRouter } from "next/navigation";
import { clearStoredAccessToken } from "@/lib/auth";
import { LogoMark } from "../brand/logo-mark";
import { ThemeToggle } from "../theme-toggle";
import { Button } from "../ui/button";

export function DashboardShell({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();

  function handleLogout() {
    clearStoredAccessToken();
    router.replace("/");
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-background">
      <div className="hero-aurora pointer-events-none absolute inset-0" />
      <div className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col px-6 py-6 lg:px-10">
        <header className="flex flex-col gap-5 rounded-[2rem] border border-border bg-surface/80 px-5 py-4 shadow-xl shadow-black/8 backdrop-blur-xl md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <LogoMark />
            <div>
              <p className="text-lg font-semibold tracking-tight text-foreground">
                Ordex Dashboard
              </p>
              <p className="text-sm text-muted-foreground">
                Visao geral das ordens de servico
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 self-start md:self-auto">
            <ThemeToggle />
            <Button variant="secondary" onClick={handleLogout}>
              Sair
            </Button>
          </div>
        </header>

        <section className="flex-1 py-8">{children}</section>
      </div>
    </main>
  );
}
