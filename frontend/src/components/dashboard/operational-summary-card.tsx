import { Card } from "../ui/card";
import { buildOperationalSummaryItems } from "./utils/dashboard-metrics";

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
  const summaryItems = buildOperationalSummaryItems({
    cancelledOrders,
    concludedOrders,
    inProgressOrders,
    openOrders,
    totalOrders,
  });

  return (
    <Card className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground">Resumo operacional</h2>
      </div>

      <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(220px,1fr))]">
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
