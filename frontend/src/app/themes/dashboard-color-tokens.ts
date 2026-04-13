import type { OrderStatus } from "@/lib/api";

export type DashboardBadgeColorTokens = {
  background: string;
  border: string;
  text: string;
};

export type DashboardStatusColorTokens = {
  accent: string;
  badge: DashboardBadgeColorTokens;
};

export const dashboardOverviewColorTokens = {
  totalEstimatedValueAccent: "var(--dashboard-overview-total-estimated-accent)",
  averageEstimatedValueAccent: "var(--dashboard-overview-average-estimated-accent)",
  totalOrdersAccent: "var(--dashboard-overview-total-orders-accent)",
  recentOrdersAccent: "var(--dashboard-overview-recent-orders-accent)",
} as const;

export const dashboardStatusColorTokens: Record<OrderStatus, DashboardStatusColorTokens> = {
  Aberta: {
    accent: "var(--dashboard-status-open-accent)",
    badge: {
      background: "var(--dashboard-status-open-badge-background)",
      border: "var(--dashboard-status-open-badge-border)",
      text: "var(--dashboard-status-open-badge-text)",
    },
  },
  "Em andamento": {
    accent: "var(--dashboard-status-in-progress-accent)",
    badge: {
      background: "var(--dashboard-status-in-progress-badge-background)",
      border: "var(--dashboard-status-in-progress-badge-border)",
      text: "var(--dashboard-status-in-progress-badge-text)",
    },
  },
  Concluída: {
    accent: "var(--dashboard-status-concluded-accent)",
    badge: {
      background: "var(--dashboard-status-concluded-badge-background)",
      border: "var(--dashboard-status-concluded-badge-border)",
      text: "var(--dashboard-status-concluded-badge-text)",
    },
  },
  Cancelada: {
    accent: "var(--dashboard-status-cancelled-accent)",
    badge: {
      background: "var(--dashboard-status-cancelled-badge-background)",
      border: "var(--dashboard-status-cancelled-badge-border)",
      text: "var(--dashboard-status-cancelled-badge-text)",
    },
  },
};
