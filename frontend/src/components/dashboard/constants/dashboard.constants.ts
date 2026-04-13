import type { GetOrdersParams, OrderStatus } from "@/lib/api";

export const DASHBOARD_VALUE_ANALYSIS_LIMIT = 100;

export const dashboardStatusRequests: Record<string, GetOrdersParams> = {
  totalOrders: { page: 1, limit: 1 },
  openOrders: { page: 1, limit: 1, status: "Aberta" satisfies OrderStatus },
  inProgressOrders: { page: 1, limit: 1, status: "Em andamento" satisfies OrderStatus },
  concludedOrders: { page: 1, limit: 1, status: "Concluída" satisfies OrderStatus },
  cancelledOrders: { page: 1, limit: 1, status: "Cancelada" satisfies OrderStatus },
  valueOrders: {
    page: 1,
    limit: DASHBOARD_VALUE_ANALYSIS_LIMIT,
    sort_by: "valor_estimado",
    sort_order: "desc",
  },
};
