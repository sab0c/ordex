type AppShellMobileMenuButtonProps = {
  isVisible: boolean;
  onOpen: () => void;
};

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

export function AppShellMobileMenuButton({
  isVisible,
  onOpen,
}: Readonly<AppShellMobileMenuButtonProps>) {
  if (!isVisible) {
    return null;
  }

  return (
    <button
      aria-expanded="false"
      aria-label="Abrir menu"
      className="glass-toggle fixed right-4 top-4 z-50 inline-flex h-11 w-11 items-center justify-center rounded-2xl lg:hidden"
      type="button"
      onClick={onOpen}
    >
      <MenuIcon />
    </button>
  );
}
