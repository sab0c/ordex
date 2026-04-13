"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { createPortal } from "react-dom";
import {
  getOrdersRequest,
  type GetOrdersParams,
  type Order,
  type OrderSortBy,
  type OrderStatus,
  type SortOrder,
} from "@/lib/api";
import { useAuthenticatedSession } from "@/contexts/authenticated-session-context";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Input } from "../ui/input";
import { StatusBadge } from "../dashboard/status-badge";

const PAGE_SIZE = 10;
const FILTER_DEBOUNCE_MS = 300;

type FilterOption<T extends string> = {
  label: string;
  value: T;
};

const statusOptions: FilterOption<OrderStatus>[] = [
  { label: "Aberta", value: "Aberta" },
  { label: "Em andamento", value: "Em andamento" },
  { label: "Concluída", value: "Concluída" },
  { label: "Cancelada", value: "Cancelada" },
];

type CombinedSortOption =
  | "data_criacao_desc"
  | "data_criacao_asc"
  | "valor_estimado_desc"
  | "valor_estimado_asc";

const combinedSortOptions: Array<{
  label: string;
  value: CombinedSortOption;
  sortBy: OrderSortBy;
  sortOrder: SortOrder;
}> = [
  {
    label: "Data de criação mais recente",
    value: "data_criacao_desc",
    sortBy: "data_criacao",
    sortOrder: "desc",
  },
  {
    label: "Data de criação mais antiga",
    value: "data_criacao_asc",
    sortBy: "data_criacao",
    sortOrder: "asc",
  },
  {
    label: "Valor estimado maior",
    value: "valor_estimado_desc",
    sortBy: "valor_estimado",
    sortOrder: "desc",
  },
  {
    label: "Valor estimado menor",
    value: "valor_estimado_asc",
    sortBy: "valor_estimado",
    sortOrder: "asc",
  },
];

type OrdersFilters = {
  cliente: string;
  status: "" | OrderStatus;
  sortBy: OrderSortBy;
  sortOrder: SortOrder;
};

type OrdersQueryState = OrdersFilters & {
  page: number;
};

function formatDate(value: string): { date: string; time: string } {
  const date = new Date(value);

  return {
    date: new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date),
    time: new Intl.DateTimeFormat("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(date),
  };
}

function formatCurrency(value: string): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number(value));
}

function buildQueryState(searchParams: URLSearchParams): OrdersQueryState {
  const page = Number(searchParams.get("page") ?? "1");
  const status = searchParams.get("status");
  const sortBy = searchParams.get("sort_by");
  const sortOrder = searchParams.get("sort_order");

  const resolvedStatus = statusOptions.some((option) => option.value === status)
    ? (status as OrderStatus)
    : "";
  const resolvedCombinedSort = combinedSortOptions.find(
    (option) => option.sortBy === sortBy && option.sortOrder === sortOrder,
  );

  return {
    cliente: searchParams.get("cliente") ?? "",
    status: resolvedStatus,
    sortBy: resolvedCombinedSort?.sortBy ?? "data_criacao",
    sortOrder: resolvedCombinedSort?.sortOrder ?? "desc",
    page: Number.isNaN(page) || page < 1 ? 1 : page,
  };
}

function normalizeFilters(filters: OrdersFilters): OrdersFilters {
  return {
    cliente: filters.cliente.trim(),
    status: filters.status,
    sortBy: filters.sortBy,
    sortOrder: filters.sortOrder,
  };
}

function filtersAreEqual(left: OrdersFilters, right: OrdersFilters): boolean {
  return (
    left.cliente === right.cliente &&
    left.status === right.status &&
    left.sortBy === right.sortBy &&
    left.sortOrder === right.sortOrder
  );
}

function resolveCombinedSortOption(
  sortBy: OrderSortBy,
  sortOrder: SortOrder,
): CombinedSortOption {
  return (
    combinedSortOptions.find(
      (option) => option.sortBy === sortBy && option.sortOrder === sortOrder,
    )?.value ?? "data_criacao_desc"
  );
}

function ChevronDownIcon({ isOpen }: { isOpen: boolean }) {
  return (
    <svg
      aria-hidden="true"
      className={`h-4 w-4 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
      fill="none"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M6 9L12 15L18 9"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

type FilterSelectProps<T extends string> = {
  id: string;
  label: string;
  options: FilterOption<T>[];
  placeholder?: string;
  allowEmpty?: boolean;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  value: "" | T;
  onChange: (value: "" | T) => void;
};

function FilterSelect<T extends string>({
  id,
  label,
  allowEmpty = true,
  isOpen,
  onChange,
  onOpenChange,
  options,
  placeholder,
  value,
}: FilterSelectProps<T>) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const onOpenChangeRef = useRef(onOpenChange);
  const [menuStyle, setMenuStyle] = useState<{
    top: number;
    left: number;
    width: number;
  } | null>(null);

  useEffect(() => {
    onOpenChangeRef.current = onOpenChange;
  }, [onOpenChange]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handlePointerDown(event: MouseEvent) {
      const target = event.target as Node;

      if (
        !containerRef.current?.contains(target) &&
        !menuRef.current?.contains(target)
      ) {
        onOpenChangeRef.current(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onOpenChangeRef.current(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  useLayoutEffect(() => {
    if (!isOpen || !triggerRef.current) {
      return;
    }

    function updateMenuPosition() {
      const rect = triggerRef.current?.getBoundingClientRect();

      if (!rect) {
        return;
      }

      setMenuStyle({
        top: rect.bottom + 10,
        left: rect.left,
        width: rect.width,
      });
    }

    updateMenuPosition();

    window.addEventListener("resize", updateMenuPosition);
    window.addEventListener("scroll", updateMenuPosition, true);

    return () => {
      window.removeEventListener("resize", updateMenuPosition);
      window.removeEventListener("scroll", updateMenuPosition, true);
    };
  }, [isOpen]);

  const selectedOption = options.find((option) => option.value === value);
  const resolvedLabel = selectedOption?.label ?? placeholder ?? "";

  return (
    <div className="flex w-full flex-col gap-2 text-sm text-foreground">
      <span className="font-medium text-muted-foreground">{label}</span>
      <div className="relative z-30" ref={containerRef}>
        <button
          aria-controls={`${id}-listbox`}
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          className="themed-input flex h-12 w-full items-center justify-between rounded-[1.6rem] border border-transparent bg-input-surface px-4 text-left text-sm text-foreground outline-none backdrop-blur-md transition-[border-color,box-shadow,background-color,transform] hover:border-primary/40 hover:bg-surface-elevated/80 focus:border-primary focus:ring-2 focus:ring-ring"
          id={id}
          ref={triggerRef}
          type="button"
          onClick={() => onOpenChange(!isOpen)}
        >
          <span className="truncate">{resolvedLabel}</span>
          <span className="ml-3 shrink-0 text-muted-foreground">
            <ChevronDownIcon isOpen={isOpen} />
          </span>
        </button>

        {isOpen && menuStyle
          ? createPortal(
              <div
                className="fixed z-[90] overflow-hidden rounded-[1.75rem] border border-border/80 bg-surface/95 p-2 shadow-[0_24px_70px_var(--app-sidebar-shadow)] backdrop-blur-2xl"
                id={`${id}-listbox`}
                ref={menuRef}
                role="listbox"
                style={{
                  top: menuStyle.top,
                  left: menuStyle.left,
                  width: menuStyle.width,
                }}
              >
                {allowEmpty ? (
                  <button
                    aria-selected={value === ""}
                    className={`flex w-full items-center rounded-[1.15rem] px-4 py-3 text-left text-sm transition-colors ${
                      value === ""
                        ? "bg-primary/14 text-foreground"
                        : "text-muted-foreground hover:bg-surface/80 hover:text-foreground"
                    }`}
                    role="option"
                    type="button"
                    onClick={() => {
                      onChange("");
                      onOpenChange(false);
                    }}
                  >
                    {placeholder}
                  </button>
                ) : null}

                {options.map((option) => {
                  const isSelected = option.value === value;

                  return (
                    <button
                      key={option.value}
                      aria-selected={isSelected}
                      className={`mt-1 flex w-full items-center rounded-[1.15rem] px-4 py-3 text-left text-sm transition-colors ${
                        isSelected
                          ? "bg-primary/14 text-foreground"
                          : "text-muted-foreground hover:bg-surface/80 hover:text-foreground"
                      }`}
                      role="option"
                      type="button"
                      onClick={() => {
                        onChange(option.value);
                        onOpenChange(false);
                      }}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>,
              document.body,
            )
          : null}
      </div>
    </div>
  );
}

export function OrdersPage() {
  const { token } = useAuthenticatedSession();
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const queryState = useMemo(
    () => buildQueryState(new URLSearchParams(searchParams.toString())),
    [searchParams],
  );

  const [filters, setFilters] = useState<OrdersFilters>({
    cliente: queryState.cliente,
    status: queryState.status,
    sortBy: queryState.sortBy,
    sortOrder: queryState.sortOrder,
  });
  const [orders, setOrders] = useState<Order[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pageInput, setPageInput] = useState(String(queryState.page));
  const [openFilterId, setOpenFilterId] = useState<string | null>(null);

  useEffect(() => {
    setFilters({
      cliente: queryState.cliente,
      status: queryState.status,
      sortBy: queryState.sortBy,
      sortOrder: queryState.sortOrder,
    });
    setPageInput(String(queryState.page));
  }, [
    queryState.cliente,
    queryState.page,
    queryState.sortBy,
    queryState.sortOrder,
    queryState.status,
  ]);

  useEffect(() => {
    let isMounted = true;

    async function loadOrders() {
      setIsLoading(true);
      setError(null);

      try {
        const params: GetOrdersParams = {
          page: queryState.page,
          limit: PAGE_SIZE,
          cliente: queryState.cliente || undefined,
          status: queryState.status || undefined,
          sort_by: queryState.sortBy,
          sort_order: queryState.sortOrder,
        };

        const response = await getOrdersRequest(token, params);

        if (!isMounted) {
          return;
        }

        setOrders(response.data);
        setTotal(response.pagination.total);
        setTotalPages(response.pagination.totalPages);
      } catch (requestError) {
        if (!isMounted) {
          return;
        }

        setError(
          requestError instanceof Error
            ? requestError.message
            : "Não foi possível carregar as ordens.",
        );
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadOrders();

    return () => {
      isMounted = false;
    };
  }, [queryState.cliente, queryState.page, queryState.sortBy, queryState.sortOrder, queryState.status, token]);

  const updateUrl = useCallback((nextFilters: OrdersFilters, page: number) => {
    const nextParams = new URLSearchParams();
    const normalizedFilters = normalizeFilters(nextFilters);

    if (normalizedFilters.cliente) {
      nextParams.set("cliente", normalizedFilters.cliente);
    }

    if (normalizedFilters.status) {
      nextParams.set("status", normalizedFilters.status);
    }

    nextParams.set("sort_by", normalizedFilters.sortBy);
    nextParams.set("sort_order", normalizedFilters.sortOrder);
    nextParams.set("page", String(page));

    router.replace(`${pathname}?${nextParams.toString()}`);
  }, [pathname, router]);

  useEffect(() => {
    const normalizedFilters = normalizeFilters(filters);
    const normalizedQueryFilters = normalizeFilters({
      cliente: queryState.cliente,
      status: queryState.status,
      sortBy: queryState.sortBy,
      sortOrder: queryState.sortOrder,
    });

    if (filtersAreEqual(normalizedFilters, normalizedQueryFilters)) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      updateUrl(normalizedFilters, 1);
    }, FILTER_DEBOUNCE_MS);

    return () => window.clearTimeout(timeoutId);
  }, [
    filters,
    queryState.cliente,
    queryState.sortBy,
    queryState.sortOrder,
    queryState.status,
    updateUrl,
  ]);

  function handleClearFilters() {
    const nextFilters: OrdersFilters = {
      cliente: "",
      status: "",
      sortBy: "data_criacao",
      sortOrder: "desc",
    };

    setOpenFilterId(null);
    setFilters(nextFilters);
    updateUrl(nextFilters, 1);
  }

  function handlePageChange(nextPage: number) {
    updateUrl(filters, nextPage);
  }

  function handlePageSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const parsedPage = Number(pageInput);
    const targetPage = Number.isNaN(parsedPage)
      ? queryState.page
      : Math.min(Math.max(parsedPage, 1), Math.max(totalPages, 1));

    setPageInput(String(targetPage));

    if (targetPage !== queryState.page) {
      updateUrl(filters, targetPage);
    }
  }

  return (
    <div className="space-y-6">
      <Card
        className="relative z-20 space-y-8 overflow-hidden"
      >
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold text-foreground">Ordens</h1>
          <p className="text-sm text-muted-foreground">
            Liste, filtre e ordene as ordens de serviço.
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,1fr)_auto] lg:items-end">
          <Input
            clearable
            className="h-11 rounded-[1.6rem]"
            id="cliente"
            label="Cliente"
            onClear={() =>
              setFilters((currentValue) => ({
                ...currentValue,
                cliente: "",
              }))
            }
            placeholder="Filtrar por cliente"
            value={filters.cliente}
            onChange={(event) =>
              setFilters((currentValue) => ({
                ...currentValue,
                cliente: event.target.value,
              }))
            }
          />

          <FilterSelect
            id="status"
            isOpen={openFilterId === "status"}
            label="Status"
            options={statusOptions}
            onOpenChange={(isOpen) => setOpenFilterId(isOpen ? "status" : null)}
            placeholder="Todos os status"
            value={filters.status}
            onChange={(value) =>
              setFilters((currentValue) => ({
                ...currentValue,
                status: value as OrdersFilters["status"],
              }))
            }
          />

          <FilterSelect
            id="sort-by"
            label="Ordenar por"
            allowEmpty={false}
            isOpen={openFilterId === "sort-by"}
            options={combinedSortOptions.map((option) => ({
              label: option.label,
              value: option.value,
            }))}
            onOpenChange={(isOpen) => setOpenFilterId(isOpen ? "sort-by" : null)}
            value={resolveCombinedSortOption(filters.sortBy, filters.sortOrder)}
            onChange={(value) => {
              const selectedOption =
                combinedSortOptions.find((option) => option.value === value) ??
                combinedSortOptions[0];

              setFilters((currentValue) => ({
                ...currentValue,
                sortBy: selectedOption.sortBy,
                sortOrder: selectedOption.sortOrder,
              }));
            }}
          />

          <Button
            className="h-12 rounded-[1.6rem] px-5 lg:self-end"
            type="button"
            variant="secondary"
            onClick={handleClearFilters}
          >
            Limpar filtros
          </Button>
        </div>
      </Card>

      <Card className="relative z-0 overflow-hidden p-0">
        <div className="flex items-center justify-between gap-3 px-6 py-5">
          <div>
            <h2 className="text-xl font-semibold text-foreground">Listagem de ordens</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {isLoading ? "Carregando resultados..." : `${total} ordem(ns) encontrada(s).`}
            </p>
          </div>
        </div>

        {error ? (
          <div className="px-6 pb-6">
            <div className="rounded-2xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
              {error}
            </div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse">
                <thead>
                  <tr className="border-b border-border bg-surface-elevated/50 text-left text-xs uppercase tracking-[0.18em] text-muted-foreground">
                    <th className="w-28 px-6 py-4">Ordem</th>
                    <th className="w-48 px-6 py-4">Cliente</th>
                    <th className="px-6 py-4">Descrição</th>
                    <th className="w-44 px-6 py-4">Status</th>
                    <th className="w-44 px-6 py-4">Criação</th>
                    <th className="w-48 px-6 py-4 text-right whitespace-nowrap">
                      Valor estimado
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    Array.from({ length: 6 }).map((_, index) => (
                      <tr
                        key={`orders-skeleton-${index + 1}`}
                        className="border-b border-border/70 last:border-b-0"
                      >
                        <td className="px-6 py-4" colSpan={6}>
                          <div className="h-10 animate-pulse rounded-2xl bg-surface-elevated/60" />
                        </td>
                      </tr>
                    ))
                  ) : orders.length > 0 ? (
                    orders.map((order) => (
                      <tr
                        key={order.id}
                        className="border-b border-border/70 text-sm text-foreground last:border-b-0"
                      >
                        <td className="px-6 py-4 font-semibold text-primary">#{order.id}</td>
                        <td className="px-6 py-4">{order.cliente}</td>
                        <td className="max-w-[20rem] px-6 py-4 text-muted-foreground xl:max-w-[24rem]">
                          <div className="group relative">
                            <div className="line-clamp-2 break-words leading-relaxed">
                              {order.descricao}
                            </div>
                            <div className="pointer-events-none absolute left-full top-1/2 z-30 ml-3 w-max max-w-[26rem] -translate-y-1/2 translate-x-1 rounded-[1.35rem] border border-border/80 bg-surface/96 px-4 py-3 text-sm text-foreground opacity-0 shadow-[0_18px_50px_var(--app-sidebar-shadow)] backdrop-blur-2xl transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100">
                              <p className="whitespace-normal break-words leading-relaxed">
                                {order.descricao}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <StatusBadge status={order.status} />
                        </td>
                        <td className="px-6 py-4 text-muted-foreground">
                          <div className="flex flex-col leading-relaxed">
                            <span>{formatDate(order.data_criacao).date}</span>
                            <span>{formatDate(order.data_criacao).time}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right font-medium text-foreground">
                          {formatCurrency(order.valor_estimado)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td className="px-6 py-12 text-center text-sm text-muted-foreground" colSpan={6}>
                        Nenhuma ordem encontrada para os filtros informados.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col gap-4 border-t border-border/70 px-6 py-5 md:flex-row md:items-center md:justify-between">
              <p className="text-sm text-muted-foreground">
                Página {queryState.page} de {Math.max(totalPages, 1)}
              </p>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <form className="flex items-center gap-3" onSubmit={handlePageSubmit}>
                  <label
                    className="text-sm text-muted-foreground"
                    htmlFor="orders-page-input"
                  >
                    Ir para a página
                  </label>
                  <input
                    id="orders-page-input"
                    inputMode="numeric"
                    min={1}
                    max={Math.max(totalPages, 1)}
                    className="themed-input h-10 w-24 rounded-[1.4rem] border border-transparent bg-input-surface px-4 text-sm text-foreground outline-none backdrop-blur-md transition-[border-color,box-shadow,background-color] focus:border-primary focus:ring-2 focus:ring-ring"
                    value={pageInput}
                    onChange={(event) => setPageInput(event.target.value.replace(/\D/g, ""))}
                  />
                  <Button
                    className="h-10 rounded-[1.4rem] px-4"
                    disabled={isLoading}
                    type="submit"
                    variant="secondary"
                  >
                    Ir
                  </Button>
                </form>
                <Button
                  className="h-10 rounded-[1.4rem] px-5"
                  disabled={queryState.page <= 1 || isLoading}
                  type="button"
                  variant="secondary"
                  onClick={() => handlePageChange(queryState.page - 1)}
                >
                  Anterior
                </Button>
                <Button
                  className="h-10 rounded-[1.4rem] px-5"
                  disabled={queryState.page >= totalPages || isLoading}
                  type="button"
                  variant="secondary"
                  onClick={() => handlePageChange(queryState.page + 1)}
                >
                  Próxima
                </Button>
              </div>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
