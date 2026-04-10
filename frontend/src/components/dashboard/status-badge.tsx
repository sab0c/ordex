import type { OrderStatus } from "@/lib/api";
import { cn } from "@/lib/utils";

const statusStyles: Record<OrderStatus, string> = {
  Aberta: "bg-sky-500/15 text-sky-300 border-sky-400/20",
  "Em andamento": "bg-amber-500/15 text-amber-300 border-amber-400/20",
  Concluída: "bg-emerald-500/15 text-emerald-300 border-emerald-400/20",
  Cancelada: "bg-rose-500/15 text-rose-300 border-rose-400/20",
};

export function StatusBadge({ status }: Readonly<{ status: OrderStatus }>) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full border px-3 py-1 text-xs font-semibold",
        statusStyles[status],
      )}
    >
      {status}
    </span>
  );
}
