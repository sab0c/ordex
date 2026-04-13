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
  createdOrderId: number | null;
  errors: NewOrderFormErrors;
  isOpen: boolean;
  isSubmitting: boolean;
  values: NewOrderFormValues;
  onClienteChange: (value: string) => void;
  onDescricaoChange: (value: string) => void;
  onOpenStatusChange: (isOpen: boolean) => void;
  onReset: () => void;
  onStatusChange: (value: "" | OrderStatus) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onValorEstimadoChange: (value: string) => void;
};

export function NewOrderForm({
  createdOrderId,
  errors,
  isOpen,
  isSubmitting,
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
        <h1 className="text-2xl font-semibold text-foreground">Nova Ordem</h1>
        <p className="text-sm text-muted-foreground">
          Cadastre uma nova ordem de serviço com os dados iniciais da operação.
        </p>
      </div>

      {createdOrderId ? (
        <div className="rounded-3xl border border-primary/20 bg-primary/10 px-4 py-4 text-sm text-foreground">
          Ordem <span className="font-semibold">#{createdOrderId}</span> criada com sucesso.
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

          <Input
            error={errors.valorEstimado}
            id="new-order-valor-estimado"
            inputMode="decimal"
            label="Valor estimado"
            placeholder="R$ 0,00"
            value={values.valorEstimado}
            onChange={(event) => onValorEstimadoChange(event.target.value)}
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
          <FilterSelect
            id="new-order-status"
            allowEmpty={false}
            isOpen={isOpen}
            label="Status inicial"
            options={initialStatusOptions}
            value={values.status}
            onChange={(value) => onStatusChange(value as OrderStatus)}
            onOpenChange={onOpenStatusChange}
          />

          <Button
            className="h-12 rounded-[1.6rem] px-5"
            disabled={isSubmitting}
            type="button"
            variant="secondary"
            onClick={onReset}
          >
            Limpar
          </Button>

          <Button
            className="h-12 rounded-[1.6rem] px-6"
            disabled={isSubmitting}
            type="submit"
          >
            {isSubmitting ? "Criando..." : "Criar ordem"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
