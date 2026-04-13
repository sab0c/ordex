import { ApiRequestError } from "@/lib/api";
import type {
  CreateOrderPayload,
  GetOrdersParams,
  LoginSuccessResponse,
  Order,
  OrderStatus,
  OrdersResponse,
} from "@/lib/api";
import { mockOrdersSeed } from "./mock-orders.seed";
import type { ApiClient, DashboardMetricsResponse } from "./mock-api.types";

const MOCK_ORDERS_STORAGE_KEY = "ordex-mock-orders";
const MOCK_ORDERS_STORAGE_VERSION = 5;
const MOCK_TOKEN = "ordex-mock-admin-token";
const MOCK_USERNAME = "admin";
const MOCK_PASSWORD = "admin";
const NETWORK_DELAY_MS = 180;

type StoredOrder = Order;
type StoredOrdersSnapshot = {
  version: number;
  orders: StoredOrder[];
};

function ensureBrowser(): void {
  if (typeof window === "undefined") {
    throw new Error("A API mockada só pode ser usada no navegador.");
  }
}

function normalizeText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

function buildSeedOrders(): StoredOrder[] {
  return mockOrdersSeed.map((seed, index) => ({
    id: index + 1,
    cliente: seed.cliente,
    descricao: seed.descricao,
    valor_estimado: seed.valor_estimado,
    status: seed.status,
    data_criacao: seed.data_criacao,
    data_atualizacao: seed.data_criacao,
  }));
}

function readStoredOrders(): StoredOrder[] {
  ensureBrowser();

  const rawValue = window.localStorage.getItem(MOCK_ORDERS_STORAGE_KEY);

  if (!rawValue) {
    const initialOrders = buildSeedOrders();
    writeStoredOrders(initialOrders);
    return initialOrders;
  }

  try {
    const parsedSnapshot = JSON.parse(rawValue) as
      | StoredOrdersSnapshot
      | StoredOrder[];

    if (
      !Array.isArray(parsedSnapshot) &&
      parsedSnapshot.version === MOCK_ORDERS_STORAGE_VERSION &&
      Array.isArray(parsedSnapshot.orders) &&
      parsedSnapshot.orders.length >= 36
    ) {
      return parsedSnapshot.orders;
    }
  } catch {
    window.localStorage.removeItem(MOCK_ORDERS_STORAGE_KEY);
  }

  const nextOrders = buildSeedOrders();
  writeStoredOrders(nextOrders);
  return nextOrders;
}

function writeStoredOrders(orders: StoredOrder[]): void {
  ensureBrowser();
  window.localStorage.setItem(
    MOCK_ORDERS_STORAGE_KEY,
    JSON.stringify({
      version: MOCK_ORDERS_STORAGE_VERSION,
      orders,
    } satisfies StoredOrdersSnapshot),
  );
}

function requireToken(token: string): void {
  if (token.trim().length === 0) {
    throw new ApiRequestError("Sessão inválida. Faça login novamente.", 401);
  }
}

function applyOrdersFilters(
  orders: StoredOrder[],
  params?: GetOrdersParams,
): StoredOrder[] {
  const clienteFilter = params?.cliente ? normalizeText(params.cliente) : "";
  const statusFilter = params?.status;
  const sortBy = params?.sort_by ?? "data_criacao";
  const sortOrder = params?.sort_order ?? "desc";

  const filteredOrders = orders.filter((order) => {
    const matchesCliente =
      clienteFilter.length === 0 ||
      normalizeText(order.cliente).includes(clienteFilter) ||
      normalizeText(order.descricao).includes(clienteFilter);
    const matchesStatus = !statusFilter || order.status === statusFilter;

    return matchesCliente && matchesStatus;
  });

  filteredOrders.sort((left, right) => {
    const comparison =
      sortBy === "valor_estimado"
        ? Number(left.valor_estimado) - Number(right.valor_estimado)
        : new Date(left.data_criacao).getTime() -
          new Date(right.data_criacao).getTime();

    return sortOrder === "asc" ? comparison : comparison * -1;
  });

  return filteredOrders;
}

function paginateOrders(
  orders: StoredOrder[],
  params?: GetOrdersParams,
): OrdersResponse {
  const page = Math.max(params?.page ?? 1, 1);
  const limit = Math.max(params?.limit ?? 10, 1);
  const total = orders.length;
  const totalPages = Math.max(Math.ceil(total / limit), 1);
  const safePage = Math.min(page, totalPages);
  const startIndex = (safePage - 1) * limit;

  return {
    data: orders.slice(startIndex, startIndex + limit),
    pagination: {
      page: safePage,
      limit,
      total,
      totalPages,
    },
  };
}

function buildDashboardMetrics(orders: StoredOrder[]): DashboardMetricsResponse {
  const now = Date.now();
  const lastThreeDaysThreshold = now - 3 * 24 * 60 * 60 * 1000;

  return {
    totalOrders: orders.length,
    openOrders: orders.filter((order) => order.status === "Aberta").length,
    inProgressOrders: orders.filter((order) => order.status === "Em andamento")
      .length,
    concludedOrders: orders.filter((order) => order.status === "Concluída")
      .length,
    cancelledOrders: orders.filter((order) => order.status === "Cancelada")
      .length,
    totalEstimatedValue: orders.reduce(
      (accumulator, order) => accumulator + Number(order.valor_estimado),
      0,
    ),
    recentOrdersLastThreeDays: orders.filter(
      (order) => new Date(order.data_criacao).getTime() >= lastThreeDaysThreshold,
    ).length,
  };
}

function toPersistedOrder(
  payload: CreateOrderPayload,
  nextId: number,
  now: string,
): StoredOrder {
  return {
    id: nextId,
    cliente: payload.cliente.trim(),
    descricao: payload.descricao.trim(),
    valor_estimado: payload.valor_estimado.toFixed(2),
    status: (payload.status ?? "Aberta") as OrderStatus,
    data_criacao: now,
    data_atualizacao: now,
  };
}

export const mockApiClient: ApiClient = {
  async login(payload): Promise<LoginSuccessResponse> {
    ensureBrowser();
    await sleep(NETWORK_DELAY_MS);

    if (
      payload.username.trim() !== MOCK_USERNAME ||
      payload.password !== MOCK_PASSWORD
    ) {
      throw new ApiRequestError("Credenciais inválidas.", 401);
    }

    return {
      access_token: MOCK_TOKEN,
    };
  },

  async getOrders(token, params): Promise<OrdersResponse> {
    ensureBrowser();
    requireToken(token);
    await sleep(NETWORK_DELAY_MS);

    const filteredOrders = applyOrdersFilters(readStoredOrders(), params);
    return paginateOrders(filteredOrders, params);
  },

  async getDashboardMetrics(token): Promise<DashboardMetricsResponse> {
    ensureBrowser();
    requireToken(token);
    await sleep(NETWORK_DELAY_MS);

    return buildDashboardMetrics(readStoredOrders());
  },

  async createOrder(token, payload): Promise<Order> {
    ensureBrowser();
    requireToken(token);
    await sleep(NETWORK_DELAY_MS);

    const currentOrders = readStoredOrders();
    const nextId = currentOrders.reduce(
      (highestId, order) => Math.max(highestId, order.id),
      0,
    ) + 1;
    const now = new Date().toISOString();
    const nextOrder = toPersistedOrder(payload, nextId, now);

    writeStoredOrders([nextOrder, ...currentOrders]);
    return nextOrder;
  },
};
