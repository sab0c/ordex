import { Card } from "@/components/ui/card";

export function DashboardLoadingState() {
  return (
    <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
      <Card className="min-h-[260px] animate-pulse bg-surface/70" />
      <Card className="min-h-[260px] animate-pulse bg-surface/70" />
    </div>
  );
}
