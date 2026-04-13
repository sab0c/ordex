const DEFAULT_API_URL = "http://localhost:3000";

type LoginPayload = {
  username: string;
  password: string;
};

export type LoginSuccessResponse = {
  access_token: string;
};

type ApiErrorResponse = {
  message?: string | string[];
};

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

function getApiUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL?.trim() || DEFAULT_API_URL;
}

async function parseError(response: Response): Promise<never> {
  const errorBody = (await response.json().catch(() => null)) as
    | ApiErrorResponse
    | null;
  const message = Array.isArray(errorBody?.message)
    ? errorBody.message.join(", ")
    : errorBody?.message;

  throw new Error(message || "Não foi possível concluir a solicitação.");
}

export async function loginRequest(
  payload: LoginPayload,
): Promise<LoginSuccessResponse> {
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
}

export async function getOrdersRequest(
  token: string,
  params?: GetOrdersParams,
): Promise<OrdersResponse> {
  const searchParams = new URLSearchParams();

  Object.entries(params ?? {}).forEach(([key, value]) => {
    if (value !== undefined) {
      searchParams.set(key, String(value));
    }
  });

  const url = `${getApiUrl()}/orders${
    searchParams.size > 0 ? `?${searchParams.toString()}` : ""
  }`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    await parseError(response);
  }

  return (await response.json()) as OrdersResponse;
}
