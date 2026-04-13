"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { clearStoredAccessToken } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { LogoMark } from "../brand/logo-mark";
import { ThemeToggle } from "../theme-toggle";
import { Button } from "../ui/button";

const navigationItems = [
  {
    href: "/dashboard",
    label: "Dashboard",
    description: "Visão geral",
    isAvailable: true,
  },
  {
    href: "/dashboard/orders",
    label: "Listar Ordens",
    description: "Em breve",
    isAvailable: false,
  },
  {
    href: "/dashboard/new-order",
    label: "Nova Ordem",
    description: "Em breve",
    isAvailable: false,
  },
] as const;

function DashboardIcon() {
  return (
    <svg aria-hidden="true" className="h-4 w-4" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="3" width="7" height="7" rx="2" className="fill-current opacity-90" />
      <rect x="14" y="3" width="7" height="5" rx="2" className="fill-current opacity-70" />
      <rect x="14" y="10" width="7" height="11" rx="2" className="fill-current opacity-90" />
      <rect x="3" y="12" width="7" height="9" rx="2" className="fill-current opacity-65" />
    </svg>
  );
}

function ListIcon() {
  return (
    <svg aria-hidden="true" className="h-4 w-4" viewBox="0 0 24 24" fill="none">
      <circle cx="6" cy="7" r="1.5" className="fill-current" />
      <circle cx="6" cy="12" r="1.5" className="fill-current opacity-80" />
      <circle cx="6" cy="17" r="1.5" className="fill-current opacity-65" />
      <path
        d="M10 7h8M10 12h8M10 17h8"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg aria-hidden="true" className="h-4 w-4" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 5v14M5 12h14"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function getItemIcon(label: (typeof navigationItems)[number]["label"]) {
  if (label === "Dashboard") {
    return <DashboardIcon />;
  }

  if (label === "Listar Ordens") {
    return <ListIcon />;
  }

  return <PlusIcon />;
}

function CloseIcon() {
  return (
    <svg aria-hidden="true" className="h-4 w-4" viewBox="0 0 24 24" fill="none">
      <path
        d="M6 6l12 12M18 6L6 18"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

type AppSidebarProps = {
  className?: string;
  isMobileDrawer?: boolean;
  onClose?: () => void;
};

export function AppSidebar({
  className,
  isMobileDrawer = false,
  onClose,
}: Readonly<AppSidebarProps>) {
  const pathname = usePathname();
  const router = useRouter();

  function handleLogout() {
    clearStoredAccessToken();
    onClose?.();
    router.replace("/");
  }

  return (
    <aside
      className={cn(
        "app-sidebar flex w-[238px] flex-col border-r border-border/70 bg-surface/84 px-4 py-5 backdrop-blur-xl",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-3 border-b border-border/70 pb-4">
        <div className="flex min-w-0 items-center gap-3">
          <LogoMark />
          <div className="min-w-0">
            <p className="truncate text-base font-semibold tracking-tight text-foreground">
              Ordex
            </p>
            <p className="truncate text-xs text-muted-foreground">
              Painel operacional
            </p>
          </div>
        </div>
        {isMobileDrawer ? (
          <button
            aria-label="Fechar menu"
            className="glass-toggle inline-flex h-10 w-10 items-center justify-center rounded-2xl text-muted-foreground hover:text-foreground"
            type="button"
            onClick={onClose}
          >
            <CloseIcon />
          </button>
        ) : null}
      </div>

      <div className="mt-6 flex-1 space-y-2">
        {navigationItems.map((item) => {
          const isActive = item.isAvailable && pathname === item.href;

          if (!item.isAvailable) {
            return (
              <div
                key={item.label}
                className="flex min-h-[68px] items-center gap-3 rounded-3xl border border-transparent px-3 py-3 text-left opacity-75"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-border/70 bg-surface-elevated/70 text-muted-foreground">
                  {getItemIcon(item.label)}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-foreground/88">
                    {item.label}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          }

          return (
            <Link
              key={item.label}
              href={item.href}
              onClick={onClose}
              className={cn(
                "group relative flex min-h-[68px] items-center gap-3 overflow-hidden rounded-3xl border px-3 py-3 transition-all duration-200",
                isActive
                  ? "app-sidebar__nav-item--active border-primary/25"
                  : "border-transparent bg-transparent hover:border-border hover:bg-surface-elevated/55",
              )}
            >
              {isActive ? (
                <span className="absolute inset-y-3 left-0 w-[3px] rounded-full bg-primary" />
              ) : null}
              <span
                className={cn(
                  "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border transition-colors",
                  isActive
                    ? "border-primary/20 bg-primary/15 text-primary"
                    : "border-border/70 bg-surface-elevated/70 text-muted-foreground group-hover:text-foreground",
                )}
              >
                {getItemIcon(item.label)}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-foreground">{item.label}</p>
                <p className="truncate text-xs text-muted-foreground">{item.description}</p>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="space-y-5 pt-6">
        <div className="flex justify-end px-1">
          <ThemeToggle />
        </div>

        <Button className="glass-logout w-full px-6" variant="secondary" onClick={handleLogout}>
          Sair
        </Button>
      </div>
    </aside>
  );
}
