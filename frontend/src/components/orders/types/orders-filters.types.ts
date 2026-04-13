import type { OrderSortBy, OrderStatus, SortOrder } from "@/lib/api";

export type FilterOption<T extends string> = {
  label: string;
  value: T;
};

export type CombinedSortOption =
  | "data_criacao_desc"
  | "data_criacao_asc"
  | "valor_estimado_desc"
  | "valor_estimado_asc";

export type OrdersFilters = {
  cliente: string;
  status: "" | OrderStatus;
  sortBy: OrderSortBy;
  sortOrder: SortOrder;
};

export type OrdersQueryState = OrdersFilters & {
  page: number;
};
