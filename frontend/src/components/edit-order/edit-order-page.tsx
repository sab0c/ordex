"use client";

import { useState } from "react";
import { useAuthenticatedSession } from "@/contexts/authenticated-session-context";
import { OrderFormCard } from "@/components/new-order/ui/new-order-form";
import { useEditOrderForm } from "./hooks/use-edit-order-form";
import { EditOrderFormSkeleton } from "./ui/edit-order-form-skeleton";

type EditOrderPageProps = {
  orderId: number;
};

export function EditOrderPage({ orderId }: Readonly<EditOrderPageProps>) {
  const { isReady, token } = useAuthenticatedSession();
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const {
    errors,
    handleCurrencyChange,
    handleReset,
    handleStatusChange,
    handleSubmit,
    isLoadingOrder,
    isSubmitting,
    isSubmitDisabled,
    setFieldValue,
    updatedOrderId,
    values,
  } = useEditOrderForm({
    isReady,
    orderId,
    token,
  });

  if (isLoadingOrder) {
    return <EditOrderFormSkeleton />;
  }

  return (
    <div className="w-full">
      <OrderFormCard
        errors={errors}
        isOpen={isStatusOpen}
        isSubmitting={isSubmitting}
        isSubmitDisabled={isSubmitDisabled}
        pageTitle={`Editar Ordem #${orderId}`}
        resetLabel="Restaurar dados"
        statusLabel="Status"
        submitLabel="Salvar alterações"
        submitLoadingLabel="Salvando..."
        successOrderId={updatedOrderId}
        successMessage="Ordem atualizada com sucesso"
        values={values}
        onClienteChange={(value) => setFieldValue("cliente", value)}
        onDescricaoChange={(value) => setFieldValue("descricao", value)}
        onOpenStatusChange={setIsStatusOpen}
        onReset={() => {
          setIsStatusOpen(false);
          handleReset();
        }}
        onStatusChange={handleStatusChange}
        onSubmit={handleSubmit}
        onValorEstimadoChange={handleCurrencyChange}
      />
    </div>
  );
}
