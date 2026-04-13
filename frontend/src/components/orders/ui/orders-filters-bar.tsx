"use client";

import type { OrderStatus } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { combinedSortOptions, statusOptions } from "../config/orders-filter-options";
import type { CombinedSortOption, OrdersFilters } from "../types/orders-filters.types";
import { resolveCombinedSortOption } from "../utils/orders-url-state";
import { FilterSelect } from "./filter-select";

type OrdersFiltersBarProps = {
  filters: OrdersFilters;
  openFilterId: string | null;
  onClearFilters: () => void;
  onClienteChange: (value: string) => void;
  onOpenFilterChange: (id: string | null) => void;
  onSortChange: (value: CombinedSortOption) => void;
  onStatusChange: (value: "" | OrderStatus) => void;
};

export function OrdersFiltersBar({
  filters,
  openFilterId,
  onClearFilters,
  onClienteChange,
  onOpenFilterChange,
  onSortChange,
  onStatusChange,
}: Readonly<OrdersFiltersBarProps>) {
  return (
    <Card className="relative z-20 space-y-8 overflow-hidden">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold text-foreground">Ordens</h1>
        <p className="text-sm text-muted-foreground">
          Liste, filtre e ordene as ordens de serviço.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,1fr)_auto] lg:items-end">
        <Input
          clearable
          className="h-11 rounded-[1.6rem]"
          id="cliente"
          label="Cliente"
          onClear={() => onClienteChange("")}
          placeholder="Filtrar por cliente"
          value={filters.cliente}
          onChange={(event) => onClienteChange(event.target.value)}
        />

        <FilterSelect
          id="status"
          isOpen={openFilterId === "status"}
          label="Status"
          options={statusOptions}
          placeholder="Todos os status"
          value={filters.status}
          onChange={(value) => onStatusChange(value as "" | OrderStatus)}
          onOpenChange={(isOpen) => onOpenFilterChange(isOpen ? "status" : null)}
        />

        <FilterSelect
          id="sort-by"
          allowEmpty={false}
          isOpen={openFilterId === "sort-by"}
          label="Ordenar por"
          options={combinedSortOptions.map((option) => ({
            label: option.label,
            value: option.value,
          }))}
          value={resolveCombinedSortOption(filters.sortBy, filters.sortOrder)}
          onChange={(value) => onSortChange(value as CombinedSortOption)}
          onOpenChange={(isOpen) => onOpenFilterChange(isOpen ? "sort-by" : null)}
        />

        <Button
          className="h-12 rounded-[1.6rem] px-5 lg:self-end"
          type="button"
          variant="secondary"
          onClick={onClearFilters}
        >
          Limpar filtros
        </Button>
      </div>
    </Card>
  );
}
