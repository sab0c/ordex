"use client";

import { useEffect, useState } from "react";
import { getOrdersRequest, type GetOrdersParams, type Order } from "@/lib/api";
import { PAGE_SIZE } from "../constants/orders-page.constants";
import type { OrdersQueryState } from "../types/orders-filters.types";

export function useOrdersList(token: string, queryState: OrdersQueryState) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadOrders() {
      setIsLoading(true);
      setError(null);

      try {
        const params: GetOrdersParams = {
          page: queryState.page,
          limit: PAGE_SIZE,
          cliente: queryState.cliente || undefined,
          status: queryState.status || undefined,
          sort_by: queryState.sortBy,
          sort_order: queryState.sortOrder,
        };

        const response = await getOrdersRequest(token, params);

        if (!isMounted) {
          return;
        }

        setOrders(response.data);
        setTotal(response.pagination.total);
        setTotalPages(response.pagination.totalPages);
      } catch (requestError) {
        if (!isMounted) {
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
  }, [
    queryState.cliente,
    queryState.page,
    queryState.sortBy,
    queryState.sortOrder,
    queryState.status,
    token,
  ]);

  return {
    error,
    isLoading,
    orders,
    total,
    totalPages,
  };
}
