"use client";

import { useState } from "react";
import { useAuthenticatedSession } from "@/contexts/authenticated-session-context";
import { combinedSortOptions } from "./config/orders-filter-options";
import { useOrdersList } from "./hooks/use-orders-list";
import { useOrdersUrlSync } from "./hooks/use-orders-url-sync";
import type { CombinedSortOption } from "./types/orders-filters.types";
import { OrdersFiltersBar } from "./ui/orders-filters-bar";
import { OrdersPagination } from "./ui/orders-pagination";
import { OrdersTable } from "./ui/orders-table";
import { Card } from "../ui/card";

export function OrdersPage() {
  const { token } = useAuthenticatedSession();
  const {
    filters,
    handleClearFilters: resetOrdersFilters,
    pageInput,
    queryState,
    setFilters,
    setPageInput,
    updateUrl,
  } = useOrdersUrlSync();
  const { error, isLoading, orders, total, totalPages } = useOrdersList(
    token,
    queryState,
  );
  const [openFilterId, setOpenFilterId] = useState<string | null>(null);

  function handleClearFilters() {
    setOpenFilterId(null);
    resetOrdersFilters();
  }

  function handlePageChange(nextPage: number) {
    updateUrl(filters, nextPage);
  }

  function handlePageSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const parsedPage = Number(pageInput);
    const targetPage = Number.isNaN(parsedPage)
      ? queryState.page
      : Math.min(Math.max(parsedPage, 1), Math.max(totalPages, 1));

    setPageInput(String(targetPage));

    if (targetPage !== queryState.page) {
      updateUrl(filters, targetPage);
    }
  }

  function handleSortChange(value: CombinedSortOption) {
    const selectedOption =
      combinedSortOptions.find((option) => option.value === value) ??
      combinedSortOptions[0];

    setFilters((currentValue) => ({
      ...currentValue,
      sortBy: selectedOption.sortBy,
      sortOrder: selectedOption.sortOrder,
    }));
  }

  return (
    <div className="space-y-6">
      <OrdersFiltersBar
        filters={filters}
        openFilterId={openFilterId}
        onClearFilters={handleClearFilters}
        onClienteChange={(value) =>
          setFilters((currentValue) => ({
            ...currentValue,
            cliente: value,
          }))
        }
        onOpenFilterChange={setOpenFilterId}
        onSortChange={handleSortChange}
        onStatusChange={(value) =>
          setFilters((currentValue) => ({
            ...currentValue,
            status: value,
          }))
        }
      />

      <Card className="relative z-0 overflow-hidden p-0">
        <OrdersTable error={error} isLoading={isLoading} orders={orders} total={total} />
        <OrdersPagination
          currentPage={queryState.page}
          isLoading={isLoading}
          pageInput={pageInput}
          totalPages={totalPages}
          onNextPage={() => handlePageChange(queryState.page + 1)}
          onPageInputChange={setPageInput}
          onPreviousPage={() => handlePageChange(queryState.page - 1)}
          onSubmit={handlePageSubmit}
        />
      </Card>
    </div>
  );
}
