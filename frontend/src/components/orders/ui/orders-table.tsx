import type { Order } from "@/lib/api";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { formatOrderCurrency, formatOrderDate } from "../utils/orders-format";

type OrdersTableProps = {
  error: string | null;
  isLoading: boolean;
  orders: Order[];
  total: number;
};

export function OrdersTable({
  error,
  isLoading,
  orders,
  total,
}: Readonly<OrdersTableProps>) {
  return (
    <>
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
                orders.map((order) => {
                  const createdAt = formatOrderDate(order.data_criacao);

                  return (
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
                          <span>{createdAt.date}</span>
                          <span>{createdAt.time}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right font-medium text-foreground">
                        {formatOrderCurrency(order.valor_estimado)}
                      </td>
                    </tr>
                  );
                })
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
      )}
    </>
  );
}
