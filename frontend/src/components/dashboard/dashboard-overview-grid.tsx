import { StatCard } from "../ui/stat-card";
import { dashboardOverviewColorTokens } from "@/app/themes/dashboard-color-tokens";

type DashboardOverviewGridProps = {
  totalEstimatedValue: string;
  averageEstimatedValue: string;
  totalOrders: number;
  recentOrdersLastThreeDays: number;
};

export function DashboardOverviewGrid({
  averageEstimatedValue,
  recentOrdersLastThreeDays,
  totalEstimatedValue,
  totalOrders,
}: Readonly<DashboardOverviewGridProps>) {
  return (
    <section className="grid gap-4 md:grid-cols-2">
      <StatCard
        accent={dashboardOverviewColorTokens.totalEstimatedValueAccent}
        helper="Soma do valor estimado das ordens carregadas para análise."
        label="Valor estimado total"
        value={totalEstimatedValue}
      />
      <StatCard
        accent={dashboardOverviewColorTokens.averageEstimatedValueAccent}
        helper="Média financeira por ordem registrada."
        label="Ticket médio"
        value={averageEstimatedValue}
      />
      <StatCard
        accent={dashboardOverviewColorTokens.totalOrdersAccent}
        helper="Total consolidado de ordens cadastradas."
        label="Total de ordens"
        value={String(totalOrders)}
      />
      <StatCard
        accent={dashboardOverviewColorTokens.recentOrdersAccent}
        helper="Quantidade de ordens criadas nos últimos 3 dias."
        label="Ordens recentes"
        value={String(recentOrdersLastThreeDays)}
      />
    </section>
  );
}
