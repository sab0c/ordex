import type {
  CreateOrderPayload,
  GetOrdersParams,
  LoginSuccessResponse,
  Order,
  OrderStatus,
  OrdersResponse,
} from "@/lib/api";

export type DashboardMetricsResponse = {
  totalOrders: number;
  openOrders: number;
  inProgressOrders: number;
  concludedOrders: number;
  cancelledOrders: number;
  totalEstimatedValue: number;
  recentOrdersLastThreeDays: number;
};

export type ApiClient = {
  createOrder: (token: string, payload: CreateOrderPayload) => Promise<Order>;
  getDashboardMetrics: (token: string) => Promise<DashboardMetricsResponse>;
  getOrders: (token: string, params?: GetOrdersParams) => Promise<OrdersResponse>;
  login: (payload: {
    username: string;
    password: string;
  }) => Promise<LoginSuccessResponse>;
};

export type MockOrderSeed = {
  cliente: string;
  descricao: string;
  valor_estimado: string;
  status: OrderStatus;
  data_criacao: string;
};
