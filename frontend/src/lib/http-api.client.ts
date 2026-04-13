import { ApiRequestError } from "@/lib/api";
import type {
  GetOrdersParams,
  LoginSuccessResponse,
  Order,
  OrdersResponse,
} from "@/lib/api";
import type { ApiClient, DashboardMetricsResponse } from "./mock/mock-api.types";

const DEFAULT_API_URL = "http://localhost:3000";
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
  return process.env.NEXT_PUBLIC_API_URL?.trim() || DEFAULT_API_URL;
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

export const httpApiClient: ApiClient = {
  async login(payload): Promise<LoginSuccessResponse> {
    const response = await fetch(`${getApiUrl()}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      await parseError(response);
    }

    return (await response.json()) as LoginSuccessResponse;
  },

  async getOrders(token, params): Promise<OrdersResponse> {
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

  async getDashboardMetrics(token): Promise<DashboardMetricsResponse> {
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

  async createOrder(token, payload): Promise<Order> {
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
};
