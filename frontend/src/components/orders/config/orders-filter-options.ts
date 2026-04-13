import type { OrderSortBy, OrderStatus, SortOrder } from "@/lib/api";
import type { CombinedSortOption, FilterOption } from "../types/orders-filters.types";

export const statusOptions: FilterOption<OrderStatus>[] = [
  { label: "Aberta", value: "Aberta" },
  { label: "Em andamento", value: "Em andamento" },
  { label: "Concluída", value: "Concluída" },
  { label: "Cancelada", value: "Cancelada" },
];

export const combinedSortOptions: Array<{
  label: string;
  value: CombinedSortOption;
  sortBy: OrderSortBy;
  sortOrder: SortOrder;
}> = [
  {
    label: "Data de criação mais recente",
    value: "data_criacao_desc",
    sortBy: "data_criacao",
    sortOrder: "desc",
  },
  {
    label: "Data de criação mais antiga",
    value: "data_criacao_asc",
    sortBy: "data_criacao",
    sortOrder: "asc",
  },
  {
    label: "Valor estimado maior",
    value: "valor_estimado_desc",
    sortBy: "valor_estimado",
    sortOrder: "desc",
  },
  {
    label: "Valor estimado menor",
    value: "valor_estimado_asc",
    sortBy: "valor_estimado",
    sortOrder: "asc",
  },
];
