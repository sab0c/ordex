import type { DashboardMetricsResponse } from "@/lib/api";

export type DashboardMetrics = DashboardMetricsResponse;

export type DashboardStatusMetricKey =
  | "openOrders"
  | "inProgressOrders"
  | "concludedOrders"
  | "cancelledOrders";

export type DashboardStatusCard = {
  key: DashboardStatusMetricKey;
  accent: string;
  helper: string;
  label: string;
  value: number;
};

export type OperationalSummaryItem = {
  label: string;
  value: number | string;
};
