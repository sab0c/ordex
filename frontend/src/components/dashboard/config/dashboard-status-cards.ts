import { dashboardStatusColorTokens } from "@/app/themes/dashboard-color-tokens";
import type { OrderStatus } from "@/lib/api";
import type {
  DashboardMetrics,
  DashboardStatusCard,
  DashboardStatusMetricKey,
} from "../types/dashboard.types";

const dashboardStatusCardConfig: Array<{
  key: DashboardStatusMetricKey;
  label: string;
  accent: string;
  helper: string;
  status: OrderStatus;
}> = [
  {
    key: "openOrders",
    label: "Ordens abertas",
    accent: dashboardStatusColorTokens.Aberta.accent,
    helper: "Quantidade de ordens aguardando atendimento ou triagem inicial.",
    status: "Aberta",
  },
  {
    key: "inProgressOrders",
    label: "Em andamento",
    accent: dashboardStatusColorTokens["Em andamento"].accent,
    helper: "Quantidade de ordens que já estão em execução neste momento.",
    status: "Em andamento",
  },
  {
    key: "concludedOrders",
    label: "Concluídas",
    accent: dashboardStatusColorTokens.Concluída.accent,
    helper: "Quantidade de ordens finalizadas com sucesso pela operação.",
    status: "Concluída",
  },
  {
    key: "cancelledOrders",
    label: "Canceladas",
    accent: dashboardStatusColorTokens.Cancelada.accent,
    helper: "Quantidade de ordens encerradas sem continuidade operacional.",
    status: "Cancelada",
  },
];

export function buildDashboardStatusCards(
  metrics: DashboardMetrics,
): DashboardStatusCard[] {
  return dashboardStatusCardConfig.map((card) => ({
    ...card,
    value: metrics[card.key],
  }));
}
