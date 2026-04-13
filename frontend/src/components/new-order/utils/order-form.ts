import type { Order } from "@/lib/api";
import { parseCurrencyInput } from "./new-order-format";
import type {
  NewOrderFormErrors,
  NewOrderFormValues,
} from "../types/new-order.types";

export const initialOrderFormValues: NewOrderFormValues = {
  cliente: "",
  descricao: "",
  valorEstimado: "",
  status: "Aberta",
};

export function validateOrderForm(values: NewOrderFormValues): NewOrderFormErrors {
  const errors: NewOrderFormErrors = {};

  if (values.cliente.trim().length === 0) {
    errors.cliente = "Informe o nome do cliente.";
  }

  if (values.descricao.trim().length === 0) {
    errors.descricao = "Descreva o serviço solicitado.";
  }

  if (values.valorEstimado.trim().length === 0) {
    errors.valorEstimado = "Informe o valor estimado.";
  } else if (parseCurrencyInput(values.valorEstimado) < 0) {
    errors.valorEstimado = "O valor estimado não pode ser negativo.";
  }

  return errors;
}

export function toOrderFormValues(order: Order): NewOrderFormValues {
  return {
    cliente: order.cliente,
    descricao: order.descricao,
    valorEstimado: new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(Number(order.valor_estimado)),
    status: order.status,
  };
}
