export type DashboardMetrics = {
  totalOrders: number;
  openOrders: number;
  inProgressOrders: number;
  concludedOrders: number;
  cancelledOrders: number;
  totalEstimatedValue: number;
  recentOrdersLastThreeDays: number;
};

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
