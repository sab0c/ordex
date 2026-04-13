"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { FILTER_DEBOUNCE_MS } from "../constants/orders-page.constants";
import type { OrdersFilters } from "../types/orders-filters.types";
import {
  buildOrdersQueryState,
  normalizeOrdersFilters,
  ordersFiltersAreEqual,
} from "../utils/orders-url-state";

type OrdersUrlLocalState = {
  sourceKey: string;
  filters: OrdersFilters;
  pageInput: string;
};

function buildLocalState(
  queryKey: string,
  queryState: ReturnType<typeof buildOrdersQueryState>,
): OrdersUrlLocalState {
  return {
    sourceKey: queryKey,
    filters: {
      cliente: queryState.cliente,
      status: queryState.status,
      sortBy: queryState.sortBy,
      sortOrder: queryState.sortOrder,
    },
    pageInput: String(queryState.page),
  };
}

export function useOrdersUrlSync() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const queryState = useMemo(
    () => buildOrdersQueryState(new URLSearchParams(searchParams.toString())),
    [searchParams],
  );
  const queryKey = searchParams.toString();
  const [localState, setLocalState] = useState<OrdersUrlLocalState>(() =>
    buildLocalState(queryKey, queryState),
  );
  const resolvedState =
    localState.sourceKey === queryKey
      ? localState
      : buildLocalState(queryKey, queryState);
  const { filters, pageInput } = resolvedState;

  const setFilters: Dispatch<SetStateAction<OrdersFilters>> = useCallback(
    (value) => {
      setLocalState((currentValue) => {
        const baseState =
          currentValue.sourceKey === queryKey
            ? currentValue
            : buildLocalState(queryKey, queryState);
        const nextFilters =
          typeof value === "function" ? value(baseState.filters) : value;

        return {
          ...baseState,
          filters: nextFilters,
        };
      });
    },
    [queryKey, queryState],
  );

  const setPageInput = useCallback(
    (value: string) => {
      setLocalState((currentValue) => {
        const baseState =
          currentValue.sourceKey === queryKey
            ? currentValue
            : buildLocalState(queryKey, queryState);

        return {
          ...baseState,
          pageInput: value,
        };
      });
    },
    [queryKey, queryState],
  );

  const updateUrl = useCallback(
    (nextFilters: OrdersFilters, page: number) => {
      const nextParams = new URLSearchParams();
      const normalizedFilters = normalizeOrdersFilters(nextFilters);

      if (normalizedFilters.cliente) {
        nextParams.set("cliente", normalizedFilters.cliente);
      }

      if (normalizedFilters.status) {
        nextParams.set("status", normalizedFilters.status);
      }

      nextParams.set("sort_by", normalizedFilters.sortBy);
      nextParams.set("sort_order", normalizedFilters.sortOrder);
      nextParams.set("page", String(page));

      router.replace(`${pathname}?${nextParams.toString()}`);
    },
    [pathname, router],
  );

  useEffect(() => {
    const normalizedFilters = normalizeOrdersFilters(filters);
    const normalizedQueryFilters = normalizeOrdersFilters({
      cliente: queryState.cliente,
      status: queryState.status,
      sortBy: queryState.sortBy,
      sortOrder: queryState.sortOrder,
    });

    if (ordersFiltersAreEqual(normalizedFilters, normalizedQueryFilters)) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      updateUrl(normalizedFilters, 1);
    }, FILTER_DEBOUNCE_MS);

    return () => window.clearTimeout(timeoutId);
  }, [
    filters,
    queryState.cliente,
    queryState.sortBy,
    queryState.sortOrder,
    queryState.status,
    updateUrl,
  ]);

  function handleClearFilters() {
    const nextFilters: OrdersFilters = {
      cliente: "",
      status: "",
      sortBy: "data_criacao",
      sortOrder: "desc",
    };

    setFilters(nextFilters);
    updateUrl(nextFilters, 1);
  }

  return {
    filters,
    handleClearFilters,
    pageInput,
    queryState,
    setFilters,
    setPageInput,
    updateUrl,
  };
}
