import type { OrderStatus } from "@/lib/api";
import type { FilterOption } from "@/components/orders/types/orders-filters.types";

export const initialStatusOptions: FilterOption<OrderStatus>[] = [
  { label: "Aberta", value: "Aberta" },
  { label: "Em andamento", value: "Em andamento" },
  { label: "Concluída", value: "Concluída" },
  { label: "Cancelada", value: "Cancelada" },
];
