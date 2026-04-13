"use client";

import { useEffect, useMemo, useState } from "react";
import { getOrdersRequest, type Order } from "@/lib/api";
import { dashboardStatusColorTokens } from "@/app/themes/dashboard-color-tokens";
import { useAuthenticatedSession } from "@/contexts/authenticated-session-context";
import { Card } from "../ui/card";
import { DashboardOverviewGrid } from "./dashboard-overview-grid";
import {
  DashboardStatusGrid,
  type DashboardStatusCard,
} from "./dashboard-status-grid";
import { OperationalSummaryCard } from "./operational-summary-card";

type DashboardMetrics = {
  totalOrders: number;
  openOrders: number;
  inProgressOrders: number;
  concludedOrders: number;
  cancelledOrders: number;
  totalEstimatedValue: number;
  recentOrdersLastThreeDays: number;
};

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function countOrdersFromLastDays(orders: Order[], days: number): number {
  const now = new Date();
  const threshold = new Date(now);
  threshold.setDate(now.getDate() - days);

  return orders.filter((order) => new Date(order.data_criacao) >= threshold).length;
}

export function DashboardPage() {
  const { token } = useAuthenticatedSession();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadDashboard() {
      setIsLoading(true);
      setError(null);

      try {
        const [
          totalOrdersResponse,
          openOrdersResponse,
          inProgressOrdersResponse,
          concludedOrdersResponse,
          cancelledOrdersResponse,
          valueOrdersResponse,
        ] = await Promise.all([
          getOrdersRequest(token, { page: 1, limit: 1 }),
          getOrdersRequest(token, { page: 1, limit: 1, status: "Aberta" }),
          getOrdersRequest(token, { page: 1, limit: 1, status: "Em andamento" }),
          getOrdersRequest(token, { page: 1, limit: 1, status: "Concluída" }),
          getOrdersRequest(token, { page: 1, limit: 1, status: "Cancelada" }),
          getOrdersRequest(token, {
            page: 1,
            limit: 100,
            sort_by: "valor_estimado",
            sort_order: "desc",
          }),
        ]);

        const totalEstimatedValue = valueOrdersResponse.data.reduce(
          (accumulator, order) => accumulator + Number(order.valor_estimado),
          0,
        );
        const recentOrdersLastThreeDays = countOrdersFromLastDays(
          valueOrdersResponse.data,
          3,
        );

        if (!isMounted) {
          return;
        }

        setMetrics({
          totalOrders: totalOrdersResponse.pagination.total,
          openOrders: openOrdersResponse.pagination.total,
          inProgressOrders: inProgressOrdersResponse.pagination.total,
          concludedOrders: concludedOrdersResponse.pagination.total,
          cancelledOrders: cancelledOrdersResponse.pagination.total,
          totalEstimatedValue,
          recentOrdersLastThreeDays,
        });
      } catch (requestError) {
        if (!isMounted) {
          return;
        }

        setError(
          requestError instanceof Error
            ? requestError.message
            : "Não foi possível carregar o dashboard.",
        );
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadDashboard();

    return () => {
      isMounted = false;
    };
  }, [token]);

  const statusCards = useMemo<DashboardStatusCard[]>(() => {
    if (!metrics) {
      return [];
    }

    return [
      {
        key: "openOrders",
        label: "Ordens abertas",
        accent: dashboardStatusColorTokens.Aberta.accent,
        helper: "Quantidade de ordens aguardando atendimento ou triagem inicial.",
      },
      {
        key: "inProgressOrders",
        label: "Em andamento",
        accent: dashboardStatusColorTokens["Em andamento"].accent,
        helper: "Quantidade de ordens que já estão em execução neste momento.",
      },
      {
        key: "concludedOrders",
        label: "Concluídas",
        accent: dashboardStatusColorTokens.Concluída.accent,
        helper: "Quantidade de ordens finalizadas com sucesso pela operação.",
      },
      {
        key: "cancelledOrders",
        label: "Canceladas",
        accent: dashboardStatusColorTokens.Cancelada.accent,
        helper: "Quantidade de ordens encerradas sem continuidade operacional.",
      },
    ].map((config) => ({
      ...config,
      value:
        metrics[
          config.key as keyof Pick<
            DashboardMetrics,
            "openOrders" | "inProgressOrders" | "concludedOrders" | "cancelledOrders"
          >
        ],
    }));
  }, [metrics]);

  const averageEstimatedValue = useMemo(() => {
    if (!metrics || metrics.totalOrders === 0) {
      return 0;
    }

    return metrics.totalEstimatedValue / metrics.totalOrders;
  }, [metrics]);

  return (
    <>
      {isLoading ? (
        <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
          <Card className="min-h-[260px] animate-pulse bg-surface/70" />
          <Card className="min-h-[260px] animate-pulse bg-surface/70" />
        </div>
      ) : error ? (
        <Card className="max-w-2xl border-danger/30 bg-danger/10">
          <h2 className="text-xl font-semibold text-foreground">
            Não foi possível carregar o dashboard
          </h2>
          <p className="mt-3 text-sm leading-7 text-danger">{error}</p>
        </Card>
      ) : metrics ? (
        <div className="space-y-6">
          <DashboardOverviewGrid
            averageEstimatedValue={formatCurrency(averageEstimatedValue)}
            recentOrdersLastThreeDays={metrics.recentOrdersLastThreeDays}
            totalEstimatedValue={formatCurrency(metrics.totalEstimatedValue)}
            totalOrders={metrics.totalOrders}
          />

          <OperationalSummaryCard
            cancelledOrders={metrics.cancelledOrders}
            concludedOrders={metrics.concludedOrders}
            inProgressOrders={metrics.inProgressOrders}
            openOrders={metrics.openOrders}
            totalOrders={metrics.totalOrders}
          />

          <DashboardStatusGrid cards={statusCards} />
        </div>
      ) : null}
    </>
  );
}
