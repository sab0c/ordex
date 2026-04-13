import { ApiRequestError } from "@/lib/api";
import type {
  CreateOrderPayload,
  DashboardMetricsResponse,
  GetOrdersParams,
  LoginSuccessResponse,
  Order,
  OrdersResponse,
  UpdateOrderPayload,
} from "@/lib/api";
import {
  applyOrdersFilters,
  buildDashboardMetrics,
  MOCK_PASSWORD,
  MOCK_NETWORK_DELAY_MS,
  MOCK_TOKEN,
  MOCK_USERNAME,
  paginateOrders,
  readStoredOrders,
  toPersistedOrder,
  writeStoredOrders,
} from "@/lib/mock/mock-api.client";

const DEFAULT_API_URL = "http://localhost:3000";
const MOCK_API_URL = "/mock-api";
const ORDERS_REQUEST_DEDUP_TTL_MS = 3000;

const inFlightOrdersRequests = new Map<string, Promise<OrdersResponse>>();
const cachedOrdersResponses = new Map<
  string,
  { expiresAt: number; response: OrdersResponse }
>();

type ApiErrorResponse = {
  message?: string | string[];
};

function getApiUrl(): string {
  if (process.env.NEXT_PUBLIC_API_MODE?.trim().toLowerCase() !== "real") {
    return MOCK_API_URL;
  }

  return process.env.NEXT_PUBLIC_API_URL?.trim() || DEFAULT_API_URL;
}

function isMockApiModeEnabled(): boolean {
  return process.env.NEXT_PUBLIC_API_MODE?.trim().toLowerCase() !== "real";
}

function ensureMockToken(token: string): void {
  if (token.trim() !== MOCK_TOKEN) {
    throw new ApiRequestError("Sessão inválida. Faça login novamente.", 401);
  }
}

async function simulateMockDelay(): Promise<void> {
  await new Promise((resolve) => {
    window.setTimeout(resolve, MOCK_NETWORK_DELAY_MS);
  });
}

function resolveMockLogin(
  payload: Pick<LoginSuccessResponse, never> & {
    username: string;
    password: string;
  },
): LoginSuccessResponse {
  if (
    payload.username.trim() !== MOCK_USERNAME ||
    payload.password !== MOCK_PASSWORD
  ) {
    throw new ApiRequestError("Credenciais inválidas.", 401);
  }

  return {
    access_token: MOCK_TOKEN,
  };
}

async function resolveMockOrders(params?: GetOrdersParams): Promise<OrdersResponse> {
  await simulateMockDelay();
  const filteredOrders = applyOrdersFilters(await readStoredOrders(), params);
  return paginateOrders(filteredOrders, params);
}

async function resolveMockDashboardMetrics(): Promise<DashboardMetricsResponse> {
  await simulateMockDelay();
  return buildDashboardMetrics(await readStoredOrders());
}

async function resolveMockOrder(orderId: number): Promise<Order> {
  await simulateMockDelay();
  const order = (await readStoredOrders()).find((item) => item.id === orderId);

  if (!order) {
    throw new ApiRequestError("Ordem de serviço não encontrada.", 404);
  }

  return order;
}

async function resolveMockCreateOrder(payload: CreateOrderPayload): Promise<Order> {
  await simulateMockDelay();
  const currentOrders = await readStoredOrders();
  const nextId =
    currentOrders.reduce((highestId, order) => Math.max(highestId, order.id), 0) + 1;
  const now = new Date().toISOString();
  const nextOrder = toPersistedOrder(payload, nextId, now);

  await writeStoredOrders([nextOrder, ...currentOrders]);
  return nextOrder;
}

async function resolveMockUpdateOrder(
  orderId: number,
  payload: UpdateOrderPayload,
): Promise<Order> {
  await simulateMockDelay();
  const currentOrders = await readStoredOrders();
  const targetOrder = currentOrders.find((order) => order.id === orderId);

  if (!targetOrder) {
    throw new ApiRequestError("Ordem de serviço não encontrada.", 404);
  }

  if (targetOrder.status === "Cancelada") {
    throw new ApiRequestError("Ordens canceladas não podem ser alteradas.", 400);
  }

  if (payload.status === "Concluída" && targetOrder.status !== "Em andamento") {
    throw new ApiRequestError(
      "Uma ordem só pode ser concluída se estiver Em andamento.",
      400,
    );
  }

  const nextStatus = payload.status ?? targetOrder.status;
  const nextEstimatedValue = payload.valor_estimado.toFixed(2);
  const hasChanges =
    targetOrder.cliente !== payload.cliente.trim() ||
    targetOrder.descricao !== payload.descricao.trim() ||
    targetOrder.valor_estimado !== nextEstimatedValue ||
    targetOrder.status !== nextStatus;
  const updatedOrder: Order = {
    ...targetOrder,
    cliente: payload.cliente.trim(),
    descricao: payload.descricao.trim(),
    valor_estimado: nextEstimatedValue,
    status: nextStatus,
    data_atualizacao: hasChanges ? new Date().toISOString() : targetOrder.data_atualizacao,
  };

  await writeStoredOrders(
    currentOrders.map((order) => (order.id === orderId ? updatedOrder : order)),
  );

  return updatedOrder;
}

function buildOrdersRequestKey(token: string, url: string): string {
  return `${token}:${url}`;
}

function readCachedOrdersResponse(key: string): OrdersResponse | null {
  const cachedEntry = cachedOrdersResponses.get(key);

  if (!cachedEntry) {
    return null;
  }

  if (cachedEntry.expiresAt < Date.now()) {
    cachedOrdersResponses.delete(key);
    return null;
  }

  return cachedEntry.response;
}

function writeCachedOrdersResponse(key: string, response: OrdersResponse): void {
  cachedOrdersResponses.set(key, {
    expiresAt: Date.now() + ORDERS_REQUEST_DEDUP_TTL_MS,
    response,
  });
}

function clearOrdersRequestCaches(): void {
  inFlightOrdersRequests.clear();
  cachedOrdersResponses.clear();
}

async function parseError(response: Response): Promise<never> {
  const errorBody = (await response.json().catch(() => null)) as
    | ApiErrorResponse
    | null;
  const message = Array.isArray(errorBody?.message)
    ? errorBody.message.join(", ")
    : errorBody?.message;

  throw new ApiRequestError(
    message || "Não foi possível concluir a solicitação.",
    response.status,
  );
}

function buildOrdersUrl(params?: GetOrdersParams): string {
  const searchParams = new URLSearchParams();

  Object.entries(params ?? {}).forEach(([key, value]) => {
    if (value !== undefined) {
      searchParams.set(key, String(value));
    }
  });

  return `${getApiUrl()}/orders${
    searchParams.size > 0 ? `?${searchParams.toString()}` : ""
  }`;
}

export const httpApiClient = {
  async login(payload: {
    username: string;
    password: string;
  }): Promise<LoginSuccessResponse> {
    if (isMockApiModeEnabled() && typeof window !== "undefined") {
      await simulateMockDelay();
      return resolveMockLogin(payload);
    }

    try {
      const response = await fetch(`${getApiUrl()}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        if (isMockApiModeEnabled() && response.status >= 500) {
          return resolveMockLogin(payload);
        }

        await parseError(response);
      }

      return (await response.json()) as LoginSuccessResponse;
    } catch (error) {
      if (isMockApiModeEnabled()) {
        return resolveMockLogin(payload);
      }

      throw error;
    }
  },

  async getOrders(token: string, params?: GetOrdersParams): Promise<OrdersResponse> {
    if (isMockApiModeEnabled() && typeof window !== "undefined") {
      ensureMockToken(token);
      return resolveMockOrders(params);
    }

    const url = buildOrdersUrl(params);
    const requestKey = buildOrdersRequestKey(token, url);
    const cachedResponse = readCachedOrdersResponse(requestKey);

    if (cachedResponse) {
      return cachedResponse;
    }

    const inFlightRequest = inFlightOrdersRequests.get(requestKey);

    if (inFlightRequest) {
      return inFlightRequest;
    }

    const requestPromise = (async () => {
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      });

      if (!response.ok) {
        await parseError(response);
      }

      const parsedResponse = (await response.json()) as OrdersResponse;
      writeCachedOrdersResponse(requestKey, parsedResponse);
      return parsedResponse;
    })();

    inFlightOrdersRequests.set(requestKey, requestPromise);

    try {
      return await requestPromise;
    } finally {
      inFlightOrdersRequests.delete(requestKey);
    }
  },

  async getDashboardMetrics(token: string): Promise<DashboardMetricsResponse> {
    if (isMockApiModeEnabled() && typeof window !== "undefined") {
      ensureMockToken(token);
      return resolveMockDashboardMetrics();
    }

    const response = await fetch(`${getApiUrl()}/orders/metrics`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      await parseError(response);
    }

    return (await response.json()) as DashboardMetricsResponse;
  },

  async getOrder(token: string, orderId: number): Promise<Order> {
    if (isMockApiModeEnabled() && typeof window !== "undefined") {
      ensureMockToken(token);
      return resolveMockOrder(orderId);
    }

    const response = await fetch(`${getApiUrl()}/orders/${orderId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      await parseError(response);
    }

    return (await response.json()) as Order;
  },

  async createOrder(
    token: string,
    payload: CreateOrderPayload,
  ): Promise<Order> {
    if (isMockApiModeEnabled() && typeof window !== "undefined") {
      ensureMockToken(token);
      const createdOrder = await resolveMockCreateOrder(payload);
      clearOrdersRequestCaches();
      return createdOrder;
    }

    const response = await fetch(`${getApiUrl()}/orders`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      await parseError(response);
    }

    clearOrdersRequestCaches();

    return (await response.json()) as Order;
  },

  async updateOrder(
    token: string,
    orderId: number,
    payload: UpdateOrderPayload,
  ): Promise<Order> {
    if (isMockApiModeEnabled() && typeof window !== "undefined") {
      ensureMockToken(token);
      const updatedOrder = await resolveMockUpdateOrder(orderId, payload);
      clearOrdersRequestCaches();
      return updatedOrder;
    }

    const response = await fetch(`${getApiUrl()}/orders/${orderId}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      await parseError(response);
    }

    clearOrdersRequestCaches();

    return (await response.json()) as Order;
  },
};
