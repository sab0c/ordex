"use client";

import { useMemo } from "react";
import { useAuthenticatedSession } from "@/contexts/authenticated-session-context";
import { buildDashboardStatusCards } from "./config/dashboard-status-cards";
import { DashboardOverviewGrid } from "./dashboard-overview-grid";
import { useDashboardMetrics } from "./hooks/use-dashboard-metrics";
import { DashboardStatusGrid } from "./dashboard-status-grid";
import { OperationalSummaryCard } from "./operational-summary-card";
import { DashboardErrorState } from "./ui/dashboard-error-state";
import { DashboardLoadingState } from "./ui/dashboard-loading-state";
import { calculateAverageEstimatedValue, formatDashboardCurrency } from "./utils/dashboard-metrics";

export function DashboardPage() {
  const { isReady, token } = useAuthenticatedSession();
  const { error, isLoading, metrics } = useDashboardMetrics(token, isReady);

  const statusCards = useMemo(() => {
    if (!metrics) {
      return [];
    }

    return buildDashboardStatusCards(metrics);
  }, [metrics]);

  const averageEstimatedValue = useMemo(() => {
    if (!metrics) {
      return 0;
    }

    return calculateAverageEstimatedValue(
      metrics.totalEstimatedValue,
      metrics.totalOrders,
    );
  }, [metrics]);

  return (
    <>
      {isLoading ? (
        <DashboardLoadingState />
      ) : error ? (
        <DashboardErrorState error={error} />
      ) : metrics ? (
        <div className="space-y-6">
          <DashboardOverviewGrid
            averageEstimatedValue={formatDashboardCurrency(averageEstimatedValue)}
            recentOrdersLastThreeDays={metrics.recentOrdersLastThreeDays}
            totalEstimatedValue={formatDashboardCurrency(metrics.totalEstimatedValue)}
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
