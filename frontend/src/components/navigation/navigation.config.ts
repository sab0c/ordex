import { appRoutes } from "@/lib/routes";
import type { NavigationItem } from "./navigation.types";

export const navigationItems: NavigationItem[] = [
  {
    href: appRoutes.dashboard,
    label: "Dashboard",
    description: "Visao geral",
    icon: "dashboard",
    isAvailable: true,
  },
  {
    href: appRoutes.orders,
    label: "Ordens",
    description: "Listagem completa",
    icon: "orders",
    isAvailable: true,
  },
  {
    href: appRoutes.newOrder,
    label: "Nova Ordem",
    description: "Em breve",
    icon: "new-order",
    isAvailable: false,
  },
];
