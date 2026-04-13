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

function notFoundResponse(): HttpResponse<ApiErrorBody> {
  return HttpResponse.json(
    { message: "Ordem de serviço não encontrada." },
    { status: 404 },
  );
}

function badRequestResponse(message: string): HttpResponse<ApiErrorBody> {
  return HttpResponse.json({ message }, { status: 400 });
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

  http.get("*/mock-api/orders/:id", async ({ request, params }) => {
    await delay(MOCK_NETWORK_DELAY_MS);

    const token = readBearerToken(request);

    if (!isValidMockToken(token)) {
      return unauthorizedResponse();
    }

    const orderId = Number(params.id);
    const order = (await readStoredOrders()).find((item) => item.id === orderId);

    if (!order) {
      return notFoundResponse();
    }

    return HttpResponse.json(order);
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

  http.patch("*/mock-api/orders/:id", async ({ request, params }) => {
    await delay(MOCK_NETWORK_DELAY_MS);

    const token = readBearerToken(request);

    if (!isValidMockToken(token)) {
      return unauthorizedResponse();
    }

    const orderId = Number(params.id);
    const payload = (await request.json()) as CreateOrderPayload;
    const currentOrders = await readStoredOrders();
    const targetOrder = currentOrders.find((order) => order.id === orderId);

    if (!targetOrder) {
      return notFoundResponse();
    }

    if (targetOrder.status === "Cancelada") {
      return badRequestResponse("Ordens canceladas não podem ser alteradas.");
    }

    if (payload.status === "Concluída" && targetOrder.status !== "Em andamento") {
      return badRequestResponse(
        "Uma ordem só pode ser concluída se estiver Em andamento.",
      );
    }

    const nextStatus = payload.status ?? targetOrder.status;
    const hasChanges =
      targetOrder.cliente !== payload.cliente.trim() ||
      targetOrder.descricao !== payload.descricao.trim() ||
      targetOrder.valor_estimado !== payload.valor_estimado.toFixed(2) ||
      targetOrder.status !== nextStatus;
    const nextUpdatedAt = hasChanges
      ? new Date().toISOString()
      : targetOrder.data_atualizacao;

    const updatedOrder = {
      ...targetOrder,
      cliente: payload.cliente.trim(),
      descricao: payload.descricao.trim(),
      valor_estimado: payload.valor_estimado.toFixed(2),
      status: nextStatus,
      data_atualizacao: nextUpdatedAt,
    };

    await writeStoredOrders(
      currentOrders.map((order) => (order.id === orderId ? updatedOrder : order)),
    );

    return HttpResponse.json(updatedOrder);
  }),
];
