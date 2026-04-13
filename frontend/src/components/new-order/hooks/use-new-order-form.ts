"use client";

import { useMemo, useState } from "react";
import { createOrderRequest } from "@/lib/api";
import type { OrderStatus } from "@/lib/api";
import type {
  NewOrderFormErrors,
  NewOrderFormValues,
} from "../types/new-order.types";
import { formatCurrencyInput, parseCurrencyInput } from "../utils/new-order-format";

const initialFormValues: NewOrderFormValues = {
  cliente: "",
  descricao: "",
  valorEstimado: "",
  status: "Aberta",
};

function validateForm(values: NewOrderFormValues): NewOrderFormErrors {
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

export function useNewOrderForm(token: string) {
  const [values, setValues] = useState<NewOrderFormValues>(initialFormValues);
  const [errors, setErrors] = useState<NewOrderFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdOrderId, setCreatedOrderId] = useState<number | null>(null);

  const previewValue = useMemo(
    () => values.valorEstimado || "R$ 0,00",
    [values.valorEstimado],
  );

  function setFieldValue<K extends keyof NewOrderFormValues>(
    field: K,
    value: NewOrderFormValues[K],
  ) {
    setValues((currentValue) => ({
      ...currentValue,
      [field]: value,
    }));

    setErrors((currentErrors) => {
      if (!currentErrors[field] && !currentErrors.form) {
        return currentErrors;
      }

      return {
        ...currentErrors,
        [field]: undefined,
        form: undefined,
      };
    });
  }

  function handleCurrencyChange(value: string) {
    setFieldValue("valorEstimado", formatCurrencyInput(value));
  }

  function handleStatusChange(value: "" | OrderStatus) {
    if (!value) {
      return;
    }

    setFieldValue("status", value);
  }

  function handleReset() {
    setValues(initialFormValues);
    setErrors({});
    setCreatedOrderId(null);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors = validateForm(values);

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const createdOrder = await createOrderRequest(token, {
        cliente: values.cliente.trim(),
        descricao: values.descricao.trim(),
        valor_estimado: parseCurrencyInput(values.valorEstimado),
        status: values.status,
      });

      setCreatedOrderId(createdOrder.id);
      setValues(initialFormValues);
    } catch (error) {
      setErrors({
        form:
          error instanceof Error
            ? error.message
            : "Não foi possível criar a ordem de serviço.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return {
    createdOrderId,
    errors,
    handleCurrencyChange,
    handleReset,
    handleStatusChange,
    handleSubmit,
    isSubmitting,
    previewValue,
    setFieldValue,
    values,
  };
}
