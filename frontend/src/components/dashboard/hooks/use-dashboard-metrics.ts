import { useEffect, useState } from "react";
import { getOrdersRequest } from "@/lib/api";
import { dashboardStatusRequests } from "../constants/dashboard.constants";
import type { DashboardMetrics } from "../types/dashboard.types";
import { countOrdersFromLastDays } from "../utils/dashboard-metrics";

export function useDashboardMetrics(token: string) {
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
          getOrdersRequest(token, dashboardStatusRequests.totalOrders),
          getOrdersRequest(token, dashboardStatusRequests.openOrders),
          getOrdersRequest(token, dashboardStatusRequests.inProgressOrders),
          getOrdersRequest(token, dashboardStatusRequests.concludedOrders),
          getOrdersRequest(token, dashboardStatusRequests.cancelledOrders),
          getOrdersRequest(token, dashboardStatusRequests.valueOrders),
        ]);

        const totalEstimatedValue = valueOrdersResponse.data.reduce(
          (accumulator, order) => accumulator + Number(order.valor_estimado),
          0,
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
          recentOrdersLastThreeDays: countOrdersFromLastDays(valueOrdersResponse.data, 3),
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

  return {
    metrics,
    error,
    isLoading,
  };
}
