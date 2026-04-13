import type { Order } from "@/lib/api";
import { Card } from "../ui/card";
import { StatusBadge } from "./status-badge";

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

export function RecentOrdersTable({
  orders,
}: Readonly<{
  orders: Order[];
}>) {
  return (
    <Card className="overflow-hidden p-0 space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground">Últimas ordens</h2>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead>
            <tr className="border-b border-border bg-surface-elevated/50 text-left text-xs uppercase tracking-[0.18em] text-muted-foreground">
              <th className="px-6 py-4">ID</th>
              <th className="px-6 py-4">Cliente</th>
              <th className="px-6 py-4">Descrição</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Criação</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr
                key={order.id}
                className="border-b border-border/70 text-sm text-foreground last:border-b-0"
              >
                <td className="px-6 py-4 font-semibold text-primary">#{order.id}</td>
                <td className="px-6 py-4">{order.cliente}</td>
                <td className="px-6 py-4 text-muted-foreground">{order.descricao}</td>
                <td className="px-6 py-4">
                  <StatusBadge status={order.status} />
                </td>
                <td className="px-6 py-4 text-muted-foreground">
                  {formatDate(order.data_criacao)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
