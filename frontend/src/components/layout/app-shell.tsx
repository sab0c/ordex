"use client";

import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";
import { AppSidebar } from "../navigation/app-sidebar";
import { AppShellMobileBackdrop } from "./app-shell-mobile-backdrop";
import { AppShellMobileMenuButton } from "./app-shell-mobile-menu-button";
import { APP_SIDEBAR_WIDTH } from "./app-shell.constants";
import { useMobileSidebar } from "./use-mobile-sidebar";

export function AppShell({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const mobileSidebar = useMobileSidebar();

  return (
    <main className="relative h-screen overflow-hidden bg-background">
      <div className="hero-aurora pointer-events-none absolute inset-0" />
      <div className="relative h-screen w-full">
        <AppShellMobileMenuButton
          isVisible={!mobileSidebar.isOpen}
          onOpen={mobileSidebar.open}
        />
        <AppShellMobileBackdrop
          isVisible={mobileSidebar.isOpen}
          onClose={mobileSidebar.close}
        />

        <AppSidebar className="fixed inset-y-0 left-0 z-40 hidden lg:flex" />
        <AppSidebar
          className={cn(
            "fixed inset-y-0 left-0 z-50 max-w-[86vw] transition-transform duration-300 lg:hidden",
            mobileSidebar.isOpen ? "translate-x-0" : "-translate-x-full",
          )}
          isMobileDrawer
          onClose={mobileSidebar.close}
        />

        <section
          className="h-screen overflow-y-auto px-4 pb-6 pt-20 md:px-6 lg:ml-[var(--app-sidebar-width)] lg:w-[calc(100%-var(--app-sidebar-width))] lg:px-6 lg:py-6 lg:pt-6"
          style={{
            "--app-sidebar-width": `${APP_SIDEBAR_WIDTH}px`,
          } as CSSProperties}
        >
          {children}
        </section>
      </div>
    </main>
  );
}
