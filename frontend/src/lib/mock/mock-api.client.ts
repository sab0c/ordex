import type {
  CreateOrderPayload,
  DashboardMetricsResponse,
  GetOrdersParams,
  Order,
  OrderStatus,
} from "@/lib/api";
import { mockOrdersSeed } from "./mock-orders.seed";

const MOCK_DB_NAME = "ordex-mock-db";
const MOCK_DB_VERSION = 1;
const MOCK_STORE_NAME = "mock-storage";
const MOCK_ORDERS_STORAGE_KEY = "orders";
const MOCK_ORDERS_STORAGE_VERSION = 1;
export const MOCK_TOKEN = "ordex-mock-admin-token";
export const MOCK_USERNAME = "admin";
export const MOCK_PASSWORD = "admin";
export const MOCK_NETWORK_DELAY_MS = 180;

type StoredOrder = Order;
type StoredOrdersSnapshot = {
  version: number;
  orders: StoredOrder[];
};

function openMockDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(MOCK_DB_NAME, MOCK_DB_VERSION);

    request.onupgradeneeded = () => {
      const database = request.result;

      if (!database.objectStoreNames.contains(MOCK_STORE_NAME)) {
        database.createObjectStore(MOCK_STORE_NAME);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function readSnapshot(): Promise<StoredOrdersSnapshot | null> {
  const database = await openMockDatabase();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(MOCK_STORE_NAME, "readonly");
    const store = transaction.objectStore(MOCK_STORE_NAME);
    const request = store.get(MOCK_ORDERS_STORAGE_KEY);

    request.onsuccess = () => {
      resolve((request.result as StoredOrdersSnapshot | undefined) ?? null);
    };
    request.onerror = () => reject(request.error);
    transaction.oncomplete = () => database.close();
  });
}

async function writeSnapshot(snapshot: StoredOrdersSnapshot): Promise<void> {
  const database = await openMockDatabase();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(MOCK_STORE_NAME, "readwrite");
    const store = transaction.objectStore(MOCK_STORE_NAME);

    store.put(snapshot, MOCK_ORDERS_STORAGE_KEY);
    transaction.oncomplete = () => {
      database.close();
      resolve();
    };
    transaction.onerror = () => reject(transaction.error);
  });
}

function normalizeText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
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

export async function readStoredOrders(): Promise<StoredOrder[]> {
  const snapshot = await readSnapshot();

  if (
    snapshot &&
    snapshot.version === MOCK_ORDERS_STORAGE_VERSION &&
    Array.isArray(snapshot.orders) &&
    snapshot.orders.length >= 36
  ) {
    return snapshot.orders;
  }

  const seedOrders = buildSeedOrders();
  await writeStoredOrders(seedOrders);
  return seedOrders;
}

export async function writeStoredOrders(orders: StoredOrder[]): Promise<void> {
  await writeSnapshot({
    version: MOCK_ORDERS_STORAGE_VERSION,
    orders,
  });
}

export function isValidMockToken(token: string): boolean {
  return token.trim() === MOCK_TOKEN;
}

export function applyOrdersFilters(
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

export function paginateOrders(
  orders: StoredOrder[],
  params?: GetOrdersParams,
): {
  data: StoredOrder[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
} {
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

export function buildDashboardMetrics(
  orders: StoredOrder[],
): DashboardMetricsResponse {
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

export function toPersistedOrder(
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
