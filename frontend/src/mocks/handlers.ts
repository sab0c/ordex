import { delay, http, HttpResponse } from "msw";
import type { CreateOrderPayload, GetOrdersParams, LoginSuccessResponse } from "@/lib/api";
import {
  MOCK_NETWORK_DELAY_MS,
  MOCK_PASSWORD,
  MOCK_TOKEN,
  MOCK_USERNAME,
  applyOrdersFilters,
  buildDashboardMetrics,
  isValidMockToken,
  paginateOrders,
  readStoredOrders,
  toPersistedOrder,
  writeStoredOrders,
} from "@/lib/mock/mock-api.client";

type ApiErrorBody = {
  message: string;
};

function unauthorizedResponse(): HttpResponse<ApiErrorBody> {
  return HttpResponse.json(
    { message: "Sessão inválida. Faça login novamente." },
    { status: 401 },
  );
}

function readBearerToken(request: Request): string {
  const authorizationHeader = request.headers.get("Authorization") ?? "";
  return authorizationHeader.replace(/^Bearer\s+/i, "").trim();
}

export const handlers = [
  http.post("*/mock-api/auth/login", async ({ request }) => {
    await delay(MOCK_NETWORK_DELAY_MS);

    const payload = (await request.json()) as {
      username: string;
      password: string;
    };

    if (
      payload.username.trim() !== MOCK_USERNAME ||
      payload.password !== MOCK_PASSWORD
    ) {
      return HttpResponse.json(
        { message: "Credenciais inválidas." },
        { status: 401 },
      );
    }

    return HttpResponse.json<LoginSuccessResponse>({
      access_token: MOCK_TOKEN,
    });
  }),

  http.get("*/mock-api/orders/metrics", async ({ request }) => {
    await delay(MOCK_NETWORK_DELAY_MS);

    const token = readBearerToken(request);

    if (!isValidMockToken(token)) {
      return unauthorizedResponse();
    }

    return HttpResponse.json(buildDashboardMetrics(await readStoredOrders()));
  }),

  http.get("*/mock-api/orders", async ({ request }) => {
    await delay(MOCK_NETWORK_DELAY_MS);

    const token = readBearerToken(request);

    if (!isValidMockToken(token)) {
      return unauthorizedResponse();
    }

    const url = new URL(request.url);
    const rawStatus = url.searchParams.get("status");
    const rawSortBy = url.searchParams.get("sort_by");
    const rawSortOrder = url.searchParams.get("sort_order");
    const params: GetOrdersParams = {
      cliente: url.searchParams.get("cliente") || undefined,
      status:
        rawStatus === "Aberta" ||
        rawStatus === "Em andamento" ||
        rawStatus === "Concluída" ||
        rawStatus === "Cancelada"
          ? rawStatus
          : undefined,
      page: url.searchParams.get("page")
        ? Number(url.searchParams.get("page"))
        : undefined,
      limit: url.searchParams.get("limit")
        ? Number(url.searchParams.get("limit"))
        : undefined,
      sort_by:
        rawSortBy === "data_criacao" || rawSortBy === "valor_estimado"
          ? rawSortBy
          : undefined,
      sort_order:
        rawSortOrder === "asc" || rawSortOrder === "desc"
          ? rawSortOrder
          : undefined,
    };

    const filteredOrders = applyOrdersFilters(await readStoredOrders(), params);
    return HttpResponse.json(paginateOrders(filteredOrders, params));
  }),

  http.post("*/mock-api/orders", async ({ request }) => {
    await delay(MOCK_NETWORK_DELAY_MS);

    const token = readBearerToken(request);

    if (!isValidMockToken(token)) {
      return unauthorizedResponse();
    }

    const payload = (await request.json()) as CreateOrderPayload;
    const currentOrders = await readStoredOrders();
    const nextId =
      currentOrders.reduce(
        (highestId, order) => Math.max(highestId, order.id),
        0,
      ) + 1;
    const now = new Date().toISOString();
    const nextOrder = toPersistedOrder(payload, nextId, now);

    await writeStoredOrders([nextOrder, ...currentOrders]);

    return HttpResponse.json(nextOrder, { status: 201 });
  }),
];
