import { ThemeToggle } from "../theme-toggle";
import { Button } from "../ui/button";

type SidebarFooterProps = {
  onLogout: () => void;
};

export function SidebarFooter({
  onLogout,
}: Readonly<SidebarFooterProps>) {
  return (
    <div className="space-y-5 pt-6">
      <div className="flex justify-end px-1">
        <ThemeToggle />
      </div>

      <Button className="glass-logout w-full px-6" variant="secondary" onClick={onLogout}>
        Sair
      </Button>
    </div>
  );
}
