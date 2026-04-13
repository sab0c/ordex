import { appRoutes } from "@/lib/routes";
import { StatCard } from "../ui/stat-card";
import type { DashboardStatusCard } from "./types/dashboard.types";

export function DashboardStatusGrid({
  cards,
}: Readonly<{
  cards: DashboardStatusCard[];
}>) {
  return (
    <section className="grid auto-rows-fr gap-4 md:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <StatCard
          key={card.key}
          accent={card.accent}
          helper={card.helper}
          href={`${appRoutes.orders}?status=${encodeURIComponent(card.status)}`}
          label={card.label}
          value={String(card.value)}
        />
      ))}
    </section>
  );
}
