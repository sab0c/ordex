"use client";

import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { navigationItems } from "./navigation.config";
import { SidebarBrand } from "./sidebar-brand";
import { SidebarFooter } from "./sidebar-footer";
import { SidebarNavItem } from "./sidebar-nav-item";
import { useLogout } from "./use-logout";

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
  const handleLogout = useLogout({ onAfterLogout: onClose });

  return (
    <aside
      className={cn(
        "app-sidebar flex w-[238px] flex-col border-r border-border/70 bg-surface/84 px-4 py-5 backdrop-blur-xl",
        className,
      )}
    >
      <SidebarBrand isMobileDrawer={isMobileDrawer} onClose={onClose} />

      <div className="mt-6 flex-1 space-y-2">
        {navigationItems.map((item) => {
          const isActive = item.isAvailable && pathname === item.href;

          return (
            <SidebarNavItem
              key={item.label}
              isActive={isActive}
              item={item}
              onNavigate={onClose}
            />
          );
        })}
      </div>

      <SidebarFooter onLogout={handleLogout} />
    </aside>
  );
}
