"use client";

import { useState } from "react";
import { useAuthenticatedSession } from "@/contexts/authenticated-session-context";
import { useNewOrderForm } from "./hooks/use-new-order-form";
import { OrderFormCard } from "./ui/new-order-form";

export function NewOrderPage() {
  const { token } = useAuthenticatedSession();
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const {
    createdOrderId,
    errors,
    handleCurrencyChange,
    handleReset,
    handleStatusChange,
    handleSubmit,
    isSubmitting,
    setFieldValue,
    values,
  } = useNewOrderForm(token);

  return (
    <div className="w-full">
      <OrderFormCard
        errors={errors}
        isOpen={isStatusOpen}
        isSubmitting={isSubmitting}
        pageTitle="Nova Ordem"
        resetLabel="Limpar"
        statusLabel="Status inicial"
        submitLabel="Criar ordem"
        submitLoadingLabel="Criando..."
        successOrderId={createdOrderId}
        successMessage="Ordem criada com sucesso"
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
