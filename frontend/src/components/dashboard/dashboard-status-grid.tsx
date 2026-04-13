import { StatCard } from "../ui/stat-card";
import type { DashboardStatusCard } from "./types/dashboard.types";

export function DashboardStatusGrid({
  cards,
}: Readonly<{
  cards: DashboardStatusCard[];
}>) {
  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <StatCard
          key={card.key}
          accent={card.accent}
          helper={card.helper}
          label={card.label}
          value={String(card.value)}
        />
      ))}
    </section>
  );
}
