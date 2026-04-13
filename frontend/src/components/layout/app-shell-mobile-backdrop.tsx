type AppShellMobileBackdropProps = {
  isVisible: boolean;
  onClose: () => void;
};

export function AppShellMobileBackdrop({
  isVisible,
  onClose,
}: Readonly<AppShellMobileBackdropProps>) {
  if (!isVisible) {
    return null;
  }

  return (
    <button
      aria-label="Fechar menu"
      className="fixed inset-0 z-40 bg-background/70 backdrop-blur-sm lg:hidden"
      type="button"
      onClick={onClose}
    />
  );
}
