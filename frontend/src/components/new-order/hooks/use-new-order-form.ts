"use client";

import { useMemo, useState } from "react";
import { createOrderRequest } from "@/lib/api";
import type { OrderStatus } from "@/lib/api";
import { clearDashboardMetricsCache } from "@/components/dashboard/hooks/use-dashboard-metrics";
import { clearOrdersListCache } from "@/components/orders/hooks/use-orders-list";
import type {
  NewOrderFormErrors,
  NewOrderFormValues,
} from "../types/new-order.types";
import { formatCurrencyInput, parseCurrencyInput } from "../utils/new-order-format";
import {
  initialOrderFormValues,
  validateOrderForm,
} from "../utils/order-form";

export function useNewOrderForm(token: string | null) {
  const [values, setValues] = useState<NewOrderFormValues>(initialOrderFormValues);
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
    setValues(initialOrderFormValues);
    setErrors({});
    setCreatedOrderId(null);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!token) {
      setErrors({
        form: "A autenticação ainda está sendo carregada. Tente novamente em instantes.",
      });
      return;
    }

    const nextErrors = validateOrderForm(values);

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

      clearOrdersListCache();
      clearDashboardMetricsCache();
      setCreatedOrderId(createdOrder.id);
      setValues(initialOrderFormValues);
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
