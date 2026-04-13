import { httpApiClient } from "@/lib/http-api.client";

type LoginPayload = {
  username: string;
  password: string;
};

export type CreateOrderPayload = {
  cliente: string;
  descricao: string;
  valor_estimado: number;
  status?: OrderStatus;
};

export type UpdateOrderPayload = CreateOrderPayload;

export type LoginSuccessResponse = {
  access_token: string;
};

export class ApiRequestError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiRequestError";
    this.status = status;
  }
}

export type OrderStatus =
  | "Aberta"
  | "Em andamento"
  | "Concluída"
  | "Cancelada";

export type Order = {
  id: number;
  cliente: string;
  descricao: string;
  valor_estimado: string;
  status: OrderStatus;
  data_criacao: string;
  data_atualizacao: string;
};

export type OrdersResponse = {
  data: Order[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type DashboardMetricsResponse = {
  totalOrders: number;
  openOrders: number;
  inProgressOrders: number;
  concludedOrders: number;
  cancelledOrders: number;
  totalEstimatedValue: number;
  recentOrdersLastThreeDays: number;
};

export type OrderSortBy = "data_criacao" | "valor_estimado";
export type SortOrder = "asc" | "desc";

export type GetOrdersParams = {
  cliente?: string;
  status?: OrderStatus;
  page?: number;
  limit?: number;
  sort_by?: OrderSortBy;
  sort_order?: SortOrder;
};

export async function loginRequest(
  payload: LoginPayload,
): Promise<LoginSuccessResponse> {
  return httpApiClient.login(payload);
}

export async function getOrdersRequest(
  token: string,
  params?: GetOrdersParams,
): Promise<OrdersResponse> {
  return httpApiClient.getOrders(token, params);
}

export async function getDashboardMetricsRequest(
  token: string,
): Promise<DashboardMetricsResponse> {
  return httpApiClient.getDashboardMetrics(token);
}

export async function getOrderRequest(
  token: string,
  orderId: number,
): Promise<Order> {
  return httpApiClient.getOrder(token, orderId);
}

export async function createOrderRequest(
  token: string,
  payload: CreateOrderPayload,
): Promise<Order> {
  return httpApiClient.createOrder(token, payload);
}

export async function updateOrderRequest(
  token: string,
  orderId: number,
  payload: UpdateOrderPayload,
): Promise<Order> {
  return httpApiClient.updateOrder(token, orderId, payload);
}

function getApiMode(): "mock" | "real" {
  return process.env.NEXT_PUBLIC_API_MODE?.trim().toLowerCase() === "real"
    ? "real"
    : "mock";
}

export function isMockApiMode(): boolean {
  return getApiMode() === "mock";
}
