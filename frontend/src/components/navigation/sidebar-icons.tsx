import type { NavigationIconKey } from "./navigation.types";

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

export function SidebarIcon({
  icon,
}: Readonly<{
  icon: NavigationIconKey;
}>) {
  if (icon === "dashboard") {
    return <DashboardIcon />;
  }

  if (icon === "orders") {
    return <ListIcon />;
  }

  return <PlusIcon />;
}

export function SidebarCloseIcon() {
  return <CloseIcon />;
}
