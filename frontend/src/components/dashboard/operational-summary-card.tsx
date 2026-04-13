import { Card } from "../ui/card";

type OperationalSummaryCardProps = {
  cancelledOrders: number;
  concludedOrders: number;
  inProgressOrders: number;
  openOrders: number;
  totalOrders: number;
};

export function OperationalSummaryCard({
  cancelledOrders,
  concludedOrders,
  inProgressOrders,
  openOrders,
  totalOrders,
}: Readonly<OperationalSummaryCardProps>) {
  const summaryItems = [
    {
      label: "Ordens em aberto e em andamento",
      value: openOrders + inProgressOrders,
    },
    {
      label: "Ordens encerradas",
      value: concludedOrders + cancelledOrders,
    },
    {
      label: "Taxa de conclusão",
      value:
        totalOrders === 0 ? "0%" : `${Math.round((concludedOrders / totalOrders) * 100)}%`,
    },
  ] as const;

  return (
    <Card className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground">Resumo operacional</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-1 2xl:grid-cols-3">
        {summaryItems.map((item) => (
          <div
            key={item.label}
            className="rounded-2xl border border-border bg-surface-elevated/70 p-4"
          >
            <p className="text-sm text-muted-foreground">{item.label}</p>
            <p className="mt-3 text-3xl font-semibold tracking-tight text-foreground">
              {item.value}
            </p>
          </div>
        ))}
      </div>
    </Card>
  );
}
