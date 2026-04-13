"use client";

import { useEffect, useState } from "react";
import {
  ApiRequestError,
  getOrdersRequest,
  type GetOrdersParams,
  type Order,
} from "@/lib/api";
import { PAGE_SIZE } from "../constants/orders-page.constants";
import type { OrdersQueryState } from "../types/orders-filters.types";

const ORDERS_CACHE_KEY_PREFIX = "ordex-orders-list";
const ORDERS_RETRY_DELAYS_MS = [500, 1000, 2000, 4000];

type OrdersListCacheEntry = {
  orders: Order[];
  total: number;
  totalPages: number;
};

function buildOrdersCacheKey(queryState: OrdersQueryState): string {
  return `${ORDERS_CACHE_KEY_PREFIX}:${JSON.stringify(queryState)}`;
}

function readOrdersCache(cacheKey: string): OrdersListCacheEntry | null {
  if (typeof window === "undefined") {
    return null;
  }

  const rawValue = window.sessionStorage.getItem(cacheKey);

  if (!rawValue) {
    return null;
  }

  try {
    return JSON.parse(rawValue) as OrdersListCacheEntry;
  } catch {
    window.sessionStorage.removeItem(cacheKey);
    return null;
  }
}

function writeOrdersCache(cacheKey: string, value: OrdersListCacheEntry): void {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.setItem(cacheKey, JSON.stringify(value));
}

function isTooManyRequestsError(error: unknown): boolean {
  return error instanceof ApiRequestError && error.status === 429;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

async function loadOrdersWithRetry(
  token: string,
  params: GetOrdersParams,
): Promise<OrdersListCacheEntry> {
  for (let attempt = 0; attempt <= ORDERS_RETRY_DELAYS_MS.length; attempt += 1) {
    try {
      const response = await getOrdersRequest(token, params);

      return {
        orders: response.data,
        total: response.pagination.total,
        totalPages: response.pagination.totalPages,
      };
    } catch (error) {
      const nextDelay = ORDERS_RETRY_DELAYS_MS[attempt];

      if (!isTooManyRequestsError(error) || nextDelay === undefined) {
        throw error;
      }

      await sleep(nextDelay);
    }
  }

  throw new Error("Não foi possível carregar as ordens.");
}

export function useOrdersList(token: string, queryState: OrdersQueryState) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const requestParams: GetOrdersParams = {
      page: queryState.page,
      limit: PAGE_SIZE,
      cliente: queryState.cliente || undefined,
      status: queryState.status || undefined,
      sort_by: queryState.sortBy,
      sort_order: queryState.sortOrder,
    };
    const cacheKey = buildOrdersCacheKey(queryState);

    async function loadOrders() {
      const cachedOrders = readOrdersCache(cacheKey);

      setIsLoading(cachedOrders === null);
      setError(null);

      try {
        const nextData = await loadOrdersWithRetry(token, requestParams);

        if (!isMounted) {
          return;
        }

        writeOrdersCache(cacheKey, nextData);
        setOrders(nextData.orders);
        setTotal(nextData.total);
        setTotalPages(nextData.totalPages);
      } catch (requestError) {
        if (!isMounted) {
          return;
        }

        const cachedOrders = readOrdersCache(cacheKey);

        if (cachedOrders) {
          setOrders(cachedOrders.orders);
          setTotal(cachedOrders.total);
          setTotalPages(cachedOrders.totalPages);
          setError(null);
          setIsLoading(false);
          return;
        }

        setError(
          requestError instanceof Error
            ? requestError.message
            : "Não foi possível carregar as ordens.",
        );
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadOrders();

    return () => {
      isMounted = false;
    };
  }, [queryState, token]);

  return {
    error,
    isLoading,
    orders,
    total,
    totalPages,
  };
}
