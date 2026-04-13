import type { OrderStatus } from "@/lib/api";

export type NewOrderFormValues = {
  cliente: string;
  descricao: string;
  valorEstimado: string;
  status: OrderStatus;
};

export type NewOrderFormErrors = Partial<Record<keyof NewOrderFormValues, string>> & {
  form?: string;
};
