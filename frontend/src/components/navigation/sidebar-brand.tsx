import { LogoMark } from "../brand/logo-mark";
import { SidebarCloseIcon } from "./sidebar-icons";

type SidebarBrandProps = {
  isMobileDrawer: boolean;
  onClose?: () => void;
};

export function SidebarBrand({
  isMobileDrawer,
  onClose,
}: Readonly<SidebarBrandProps>) {
  return (
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
          <SidebarCloseIcon />
        </button>
      ) : null}
    </div>
  );
}
