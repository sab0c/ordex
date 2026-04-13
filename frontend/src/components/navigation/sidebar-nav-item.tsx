import Link from "next/link";
import { cn } from "@/lib/utils";
import type { NavigationItem } from "./navigation.types";
import { SidebarIcon } from "./sidebar-icons";

type SidebarNavItemProps = {
  isActive: boolean;
  item: NavigationItem;
  onNavigate?: () => void;
};

export function SidebarNavItem({
  isActive,
  item,
  onNavigate,
}: Readonly<SidebarNavItemProps>) {
  if (!item.isAvailable) {
    return (
      <div className="flex min-h-[68px] items-center gap-3 rounded-3xl border border-transparent px-3 py-3 text-left opacity-75">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-border/70 bg-surface-elevated/70 text-muted-foreground">
          <SidebarIcon icon={item.icon} />
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
      href={item.href}
      onClick={onNavigate}
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
        <SidebarIcon icon={item.icon} />
      </span>
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-foreground">{item.label}</p>
        <p className="truncate text-xs text-muted-foreground">{item.description}</p>
      </div>
    </Link>
  );
}
