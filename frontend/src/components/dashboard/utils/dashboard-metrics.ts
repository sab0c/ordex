import type { Order } from "@/lib/api";
import type { OperationalSummaryItem } from "../types/dashboard.types";

export function formatDashboardCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function countOrdersFromLastDays(orders: Order[], days: number): number {
  const now = new Date();
  const threshold = new Date(now);
  threshold.setDate(now.getDate() - days);

  return orders.filter((order) => new Date(order.data_criacao) >= threshold).length;
}

export function calculateAverageEstimatedValue(
  totalEstimatedValue: number,
  totalOrders: number,
): number {
  if (totalOrders === 0) {
    return 0;
  }

  return totalEstimatedValue / totalOrders;
}

export function buildOperationalSummaryItems({
  cancelledOrders,
  concludedOrders,
  inProgressOrders,
  openOrders,
  totalOrders,
}: {
  cancelledOrders: number;
  concludedOrders: number;
  inProgressOrders: number;
  openOrders: number;
  totalOrders: number;
}): OperationalSummaryItem[] {
  return [
    {
      label: "Ordens em aberto e em andamento",
      value: openOrders + inProgressOrders,
    },
    {
      label: "Ordens encerradas",
      value: concludedOrders + cancelledOrders,
    },
    {
      label: "Taxa de conclusão",
      value:
        totalOrders === 0 ? "0%" : `${Math.round((concludedOrders / totalOrders) * 100)}%`,
    },
  ];
}
