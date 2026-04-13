"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { clearDashboardMetricsCache } from "@/components/dashboard/hooks/use-dashboard-metrics";
import { clearOrdersListCache } from "@/components/orders/hooks/use-orders-list";
import {
  getOrderRequest,
  updateOrderRequest,
  type OrderStatus,
} from "@/lib/api";
import type {
  NewOrderFormErrors,
  NewOrderFormValues,
} from "@/components/new-order/types/new-order.types";
import { formatCurrencyInput, parseCurrencyInput } from "@/components/new-order/utils/new-order-format";
import {
  initialOrderFormValues,
  toOrderFormValues,
  validateOrderForm,
} from "@/components/new-order/utils/order-form";

type UseEditOrderFormParams = {
  isReady: boolean;
  orderId: number;
  token: string | null;
};

export function useEditOrderForm({
  isReady,
  orderId,
  token,
}: Readonly<UseEditOrderFormParams>) {
  const [values, setValues] = useState<NewOrderFormValues>(initialOrderFormValues);
  const [initialValues, setInitialValues] = useState<NewOrderFormValues>(initialOrderFormValues);
  const [errors, setErrors] = useState<NewOrderFormErrors>({});
  const [isLoadingOrder, setIsLoadingOrder] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [updatedOrderId, setUpdatedOrderId] = useState<number | null>(null);

  useEffect(() => {
    if (!isReady) {
      setIsLoadingOrder(true);
      return;
    }

    if (!token) {
      setErrors({
        form: "A autenticação ainda está sendo carregada. Tente novamente em instantes.",
      });
      setIsLoadingOrder(false);
      return;
    }

    const authToken = token;
    let isMounted = true;

    async function loadOrder() {
      setIsLoadingOrder(true);
      setErrors({});
      setUpdatedOrderId(null);

      try {
        const order = await getOrderRequest(authToken, orderId);

        if (!isMounted) {
          return;
        }

        const nextValues = toOrderFormValues(order);
        setInitialValues(nextValues);
        setValues(nextValues);
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setErrors({
          form:
            error instanceof Error
              ? error.message
              : "Não foi possível carregar a ordem de serviço.",
        });
      } finally {
        if (isMounted) {
          setIsLoadingOrder(false);
        }
      }
    }

    void loadOrder();

    return () => {
      isMounted = false;
    };
  }, [isReady, orderId, token]);

  function setFieldValue<K extends keyof NewOrderFormValues>(
    field: K,
    value: NewOrderFormValues[K],
  ) {
    setUpdatedOrderId(null);
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

  const getStatusError = useCallback(
    (nextStatus: OrderStatus): string | undefined => {
      if (initialValues.status === "Cancelada" && nextStatus !== initialValues.status) {
        return "Ordens canceladas não podem ser alteradas.";
      }

      if (nextStatus === "Concluída" && initialValues.status !== "Em andamento") {
        return "Ordens só podem ser concluídas se já estiverem em andamento.";
      }

      return undefined;
    },
    [initialValues.status],
  );

  function handleCurrencyChange(value: string) {
    setFieldValue("valorEstimado", formatCurrencyInput(value));
  }

  function handleStatusChange(value: "" | OrderStatus) {
    if (!value) {
      return;
    }

    setUpdatedOrderId(null);
    setValues((currentValue) => ({
      ...currentValue,
      status: value,
    }));

    setErrors((currentErrors) => ({
      ...currentErrors,
      status: getStatusError(value),
      form: undefined,
    }));
  }

  const hasChanges = useMemo(
    () =>
      values.cliente !== initialValues.cliente ||
      values.descricao !== initialValues.descricao ||
      values.valorEstimado !== initialValues.valorEstimado ||
      values.status !== initialValues.status,
    [initialValues, values],
  );

  const hasValidationErrors = useMemo(() => {
    const nextErrors = validateOrderForm(values);
    const statusError = getStatusError(values.status);

    if (statusError) {
      nextErrors.status = statusError;
    }

    return Object.keys(nextErrors).length > 0;
  }, [getStatusError, values]);

  const isSubmitDisabled =
    !hasChanges ||
    hasValidationErrors ||
    Boolean(errors.form) ||
    isSubmitting ||
    isLoadingOrder;

  function handleReset() {
    setValues(initialValues);
    setErrors({});
    setUpdatedOrderId(null);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!token) {
      setErrors({
        form: "A autenticação ainda está sendo carregada. Tente novamente em instantes.",
      });
      return;
    }

    const authToken = token;
    const nextErrors = validateOrderForm(values);
    const statusError = getStatusError(values.status);

    if (statusError) {
      nextErrors.status = statusError;
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const updatedOrder = await updateOrderRequest(authToken, orderId, {
        cliente: values.cliente.trim(),
        descricao: values.descricao.trim(),
        valor_estimado: parseCurrencyInput(values.valorEstimado),
        status: values.status,
      });

      clearOrdersListCache();
      clearDashboardMetricsCache();
      const nextValues = toOrderFormValues(updatedOrder);
      setInitialValues(nextValues);
      setUpdatedOrderId(updatedOrder.id);
      setValues(nextValues);
    } catch (error) {
      setErrors({
        form:
          error instanceof Error
            ? error.message
            : "Não foi possível atualizar a ordem de serviço.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return {
    errors,
    handleCurrencyChange,
    handleReset,
    handleStatusChange,
    handleSubmit,
    hasChanges,
    isLoadingOrder,
    isSubmitting,
    isSubmitDisabled,
    setFieldValue,
    updatedOrderId,
    values,
  };
}
