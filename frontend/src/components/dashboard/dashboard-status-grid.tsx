import { StatCard } from "../ui/stat-card";

export type DashboardStatusCard = {
  key: string;
  accent: string;
  helper: string;
  label: string;
  value: number;
};

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
