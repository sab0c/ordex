"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { AppSidebar } from "../navigation/app-sidebar";

function MenuIcon() {
  return (
    <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 24 24" fill="none">
      <path
        d="M4 7h16M4 12h16M4 17h16"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function AppShell({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <main className="relative h-screen overflow-hidden bg-background">
      <div className="hero-aurora pointer-events-none absolute inset-0" />
      <div className="relative h-screen w-full">
        {!isMobileMenuOpen ? (
          <button
            aria-expanded={isMobileMenuOpen}
            aria-label="Abrir menu"
            className="glass-toggle fixed right-4 top-4 z-50 inline-flex h-11 w-11 items-center justify-center rounded-2xl lg:hidden"
            type="button"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <MenuIcon />
          </button>
        ) : null}

        {isMobileMenuOpen ? (
          <button
            aria-label="Fechar menu"
            className="fixed inset-0 z-40 bg-background/70 backdrop-blur-sm lg:hidden"
            type="button"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        ) : null}

        <AppSidebar className="fixed inset-y-0 left-0 z-40 hidden lg:flex" />
        <AppSidebar
          className={cn(
            "fixed inset-y-0 left-0 z-50 max-w-[86vw] transition-transform duration-300 lg:hidden",
            isMobileMenuOpen ? "translate-x-0" : "-translate-x-full",
          )}
          isMobileDrawer
          onClose={() => setIsMobileMenuOpen(false)}
        />

        <section className="h-screen overflow-y-auto px-4 pb-6 pt-20 md:px-6 lg:ml-[238px] lg:w-[calc(100%-238px)] lg:px-6 lg:py-6 lg:pt-6">
          {children}
        </section>
      </div>
    </main>
  );
}
