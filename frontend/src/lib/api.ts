import { httpApiClient } from "@/lib/http-api.client";
import { mockApiClient } from "@/lib/mock/mock-api.client";
import type { DashboardMetricsResponse } from "@/lib/mock/mock-api.types";

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
  return getApiClient().login(payload);
}

export async function getOrdersRequest(
  token: string,
  params?: GetOrdersParams,
): Promise<OrdersResponse> {
  return getApiClient().getOrders(token, params);
}

export async function getDashboardMetricsRequest(
  token: string,
): Promise<DashboardMetricsResponse> {
  return getApiClient().getDashboardMetrics(token);
}

export async function createOrderRequest(
  token: string,
  payload: CreateOrderPayload,
): Promise<Order> {
  return getApiClient().createOrder(token, payload);
}

function getApiMode(): "mock" | "real" {
  return process.env.NEXT_PUBLIC_API_MODE?.trim().toLowerCase() === "real"
    ? "real"
    : "mock";
}

function getApiClient() {
  return getApiMode() === "real" ? httpApiClient : mockApiClient;
}

export type { DashboardMetricsResponse };
