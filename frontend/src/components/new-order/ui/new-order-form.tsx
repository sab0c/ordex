"use client";

import type { OrderStatus } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FilterSelect } from "@/components/orders/ui/filter-select";
import { initialStatusOptions } from "../config/new-order-options";
import type {
  NewOrderFormErrors,
  NewOrderFormValues,
} from "../types/new-order.types";

type NewOrderFormProps = {
  errors: NewOrderFormErrors;
  isOpen: boolean;
  isSubmitting: boolean;
  isSubmitDisabled?: boolean;
  pageDescription?: string;
  pageTitle: string;
  resetLabel: string;
  statusLabel: string;
  submitLabel: string;
  submitLoadingLabel: string;
  successOrderId: number | null;
  successMessage: string;
  values: NewOrderFormValues;
  onClienteChange: (value: string) => void;
  onDescricaoChange: (value: string) => void;
  onOpenStatusChange: (isOpen: boolean) => void;
  onReset: () => void;
  onStatusChange: (value: "" | OrderStatus) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onValorEstimadoChange: (value: string) => void;
};

export function OrderFormCard({
  errors,
  isOpen,
  isSubmitting,
  isSubmitDisabled = false,
  pageDescription,
  pageTitle,
  resetLabel,
  statusLabel,
  submitLabel,
  submitLoadingLabel,
  successOrderId,
  successMessage,
  values,
  onClienteChange,
  onDescricaoChange,
  onOpenStatusChange,
  onReset,
  onStatusChange,
  onSubmit,
  onValorEstimadoChange,
}: Readonly<NewOrderFormProps>) {
  return (
    <Card className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold text-foreground">{pageTitle}</h1>
        {pageDescription ? (
          <p className="text-sm text-muted-foreground">{pageDescription}</p>
        ) : null}
      </div>

      {successOrderId ? (
        <div className="rounded-3xl border border-primary/20 bg-primary/10 px-4 py-4 text-sm text-foreground">
          {successMessage} <span className="font-semibold">#{successOrderId}</span>.
        </div>
      ) : null}

      {errors.form ? (
        <div className="rounded-3xl border border-danger/30 bg-danger/10 px-4 py-4 text-sm text-danger">
          {errors.form}
        </div>
      ) : null}

      <form className="space-y-5" onSubmit={onSubmit}>
        <div className="grid gap-4 lg:grid-cols-2">
          <Input
            error={errors.cliente}
            id="new-order-cliente"
            label="Cliente"
            placeholder="Nome do cliente"
            value={values.cliente}
            onChange={(event) => onClienteChange(event.target.value)}
          />

          <FilterSelect
            error={errors.status}
            id="new-order-status"
            allowEmpty={false}
            isOpen={isOpen}
            label={statusLabel}
            options={initialStatusOptions}
            value={values.status}
            onChange={(value) => onStatusChange(value as OrderStatus)}
            onOpenChange={onOpenStatusChange}
          />
        </div>

        <Textarea
          error={errors.descricao}
          id="new-order-descricao"
          label="Descrição"
          placeholder="Descreva o serviço solicitado, contexto e observações importantes"
          value={values.descricao}
          onChange={(event) => onDescricaoChange(event.target.value)}
        />

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto_auto] lg:items-end">
          <Input
            error={errors.valorEstimado}
            id="new-order-valor-estimado"
            inputMode="decimal"
            label="Valor estimado"
            placeholder="R$ 0,00"
            value={values.valorEstimado}
            onChange={(event) => onValorEstimadoChange(event.target.value)}
          />

          <Button
            className="h-12 rounded-[1.6rem] px-5"
            disabled={isSubmitting}
            type="button"
            variant="secondary"
            onClick={onReset}
          >
            {resetLabel}
          </Button>

          <Button
            className="h-12 rounded-[1.6rem] px-6"
            disabled={isSubmitting || isSubmitDisabled}
            type="submit"
          >
            {isSubmitting ? submitLoadingLabel : submitLabel}
          </Button>
        </div>
      </form>
    </Card>
  );
}
