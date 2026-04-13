import type { OrderSortBy, OrderStatus, SortOrder } from "@/lib/api";
import { combinedSortOptions, statusOptions } from "../config/orders-filter-options";
import type { CombinedSortOption, OrdersFilters, OrdersQueryState } from "../types/orders-filters.types";

export function buildOrdersQueryState(searchParams: URLSearchParams): OrdersQueryState {
  const page = Number(searchParams.get("page") ?? "1");
  const status = searchParams.get("status");
  const sortBy = searchParams.get("sort_by");
  const sortOrder = searchParams.get("sort_order");

  const resolvedStatus = statusOptions.some((option) => option.value === status)
    ? (status as OrderStatus)
    : "";
  const resolvedCombinedSort = combinedSortOptions.find(
    (option) => option.sortBy === sortBy && option.sortOrder === sortOrder,
  );

  return {
    cliente: searchParams.get("cliente") ?? "",
    status: resolvedStatus,
    sortBy: resolvedCombinedSort?.sortBy ?? "data_criacao",
    sortOrder: resolvedCombinedSort?.sortOrder ?? "desc",
    page: Number.isNaN(page) || page < 1 ? 1 : page,
  };
}

export function normalizeOrdersFilters(filters: OrdersFilters): OrdersFilters {
  return {
    cliente: filters.cliente.trim(),
    status: filters.status,
    sortBy: filters.sortBy,
    sortOrder: filters.sortOrder,
  };
}

export function ordersFiltersAreEqual(
  left: OrdersFilters,
  right: OrdersFilters,
): boolean {
  return (
    left.cliente === right.cliente &&
    left.status === right.status &&
    left.sortBy === right.sortBy &&
    left.sortOrder === right.sortOrder
  );
}

export function resolveCombinedSortOption(
  sortBy: OrderSortBy,
  sortOrder: SortOrder,
): CombinedSortOption {
  return (
    combinedSortOptions.find(
      (option) => option.sortBy === sortBy && option.sortOrder === sortOrder,
    )?.value ?? "data_criacao_desc"
  );
}
