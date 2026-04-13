import type { FormEvent } from "react";
import { Button } from "@/components/ui/button";
import {
  fieldControlBaseClassName,
  fieldSizeClassNames,
} from "@/components/ui/field";
import { cn } from "@/lib/utils";

type OrdersPaginationProps = {
  currentPage: number;
  isLoading: boolean;
  pageInput: string;
  totalPages: number;
  onNextPage: () => void;
  onPageInputChange: (value: string) => void;
  onPreviousPage: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

export function OrdersPagination({
  currentPage,
  isLoading,
  pageInput,
  totalPages,
  onNextPage,
  onPageInputChange,
  onPreviousPage,
  onSubmit,
}: Readonly<OrdersPaginationProps>) {
  return (
    <div className="flex flex-col gap-4 border-t border-border/70 px-6 py-5 md:flex-row md:items-center md:justify-between">
      <p className="text-sm text-muted-foreground">
        Página {currentPage} de {Math.max(totalPages, 1)}
      </p>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <form className="flex items-center gap-2" onSubmit={onSubmit}>
          <label
            className="whitespace-nowrap text-sm text-muted-foreground"
            htmlFor="orders-page-input"
          >
            Ir para a página
          </label>
          <input
            className={cn(
              fieldControlBaseClassName,
              fieldSizeClassNames.compact,
              "!w-16 rounded-[1.2rem] px-3 text-center",
            )}
            id="orders-page-input"
            inputMode="numeric"
            max={Math.max(totalPages, 1)}
            min={1}
            value={pageInput}
            onChange={(event) => onPageInputChange(event.target.value.replace(/\D/g, ""))}
          />
          <Button
            className="h-10 rounded-[1.2rem] px-3"
            disabled={isLoading}
            type="submit"
            variant="secondary"
          >
            Ir
          </Button>
        </form>
        <Button
          className="h-10 rounded-[1.4rem] px-5"
          disabled={currentPage <= 1 || isLoading}
          type="button"
          variant="secondary"
          onClick={onPreviousPage}
        >
          Anterior
        </Button>
        <Button
          className="h-10 rounded-[1.4rem] px-5"
          disabled={currentPage >= totalPages || isLoading}
          type="button"
          variant="secondary"
          onClick={onNextPage}
        >
          Próxima
        </Button>
      </div>
    </div>
  );
}
