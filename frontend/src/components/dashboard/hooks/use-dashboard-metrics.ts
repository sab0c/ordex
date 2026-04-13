import { useEffect, useState } from "react";
import { ApiRequestError, getDashboardMetricsRequest } from "@/lib/api";
import type { DashboardMetrics } from "../types/dashboard.types";

const DASHBOARD_METRICS_CACHE_KEY = "ordex-dashboard-metrics";
const DASHBOARD_RETRY_DELAYS_MS = [800, 1600, 3200, 6400];

function readDashboardMetricsCache(): DashboardMetrics | null {
  if (typeof window === "undefined") {
    return null;
  }

  const rawValue = window.sessionStorage.getItem(DASHBOARD_METRICS_CACHE_KEY);

  if (!rawValue) {
    return null;
  }

  try {
    return JSON.parse(rawValue) as DashboardMetrics;
  } catch {
    window.sessionStorage.removeItem(DASHBOARD_METRICS_CACHE_KEY);
    return null;
  }
}

function writeDashboardMetricsCache(metrics: DashboardMetrics): void {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.setItem(
    DASHBOARD_METRICS_CACHE_KEY,
    JSON.stringify(metrics),
  );
}

function isTooManyRequestsError(error: unknown): boolean {
  return error instanceof ApiRequestError && error.status === 429;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

async function loadDashboardMetricsWithRetry(token: string): Promise<DashboardMetrics> {
  for (let attempt = 0; attempt <= DASHBOARD_RETRY_DELAYS_MS.length; attempt += 1) {
    try {
      return await getDashboardMetricsRequest(token);
    } catch (error) {
      const nextDelay = DASHBOARD_RETRY_DELAYS_MS[attempt];

      if (!isTooManyRequestsError(error) || nextDelay === undefined) {
        throw error;
      }

      await sleep(nextDelay);
    }
  }

  throw new Error("Não foi possível carregar o dashboard.");
}

export function useDashboardMetrics(token: string | null, isReady: boolean) {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(() =>
    readDashboardMetricsCache(),
  );
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(!isReady || metrics === null);

  useEffect(() => {
    if (!isReady || !token) {
      setError(null);
      setIsLoading(true);
      return;
    }

    const authToken = token;
    let isMounted = true;

    async function loadDashboard() {
      setIsLoading(readDashboardMetricsCache() === null);
      setError(null);

      try {
        const nextMetrics = await loadDashboardMetricsWithRetry(authToken);

        if (!isMounted) {
          return;
        }

        writeDashboardMetricsCache(nextMetrics);
        setMetrics(nextMetrics);
      } catch (requestError) {
        if (!isMounted) {
          return;
        }

        const cachedMetrics = readDashboardMetricsCache();

        if (cachedMetrics) {
          setMetrics(cachedMetrics);
          setError(null);
          setIsLoading(false);
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
  }, [isReady, token]);

  return {
    metrics,
    error,
    isLoading,
  };
}
