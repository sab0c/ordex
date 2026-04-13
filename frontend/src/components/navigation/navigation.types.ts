export type NavigationIconKey = "dashboard" | "orders" | "new-order";

export type NavigationItem = {
  href: string;
  label: string;
  description: string;
  icon: NavigationIconKey;
  isAvailable: boolean;
};
