import { Card } from "@/components/ui/card";

function DashboardStatCardSkeleton() {
  return (
    <Card className="p-5">
      <div className="mb-4 h-2 w-16 rounded-full bg-surface-elevated/80" />
      <div className="h-4 w-28 rounded-full bg-surface-elevated/70" />
      <div className="mt-3 h-10 w-32 rounded-full bg-surface-elevated/80" />
      <div className="mt-3 space-y-2">
        <div className="h-3 w-full rounded-full bg-surface-elevated/60" />
        <div className="h-3 w-4/5 rounded-full bg-surface-elevated/60" />
      </div>
    </Card>
  );
}

function DashboardSummarySkeleton() {
  return (
    <Card className="space-y-6">
      <div className="h-7 w-52 rounded-full bg-surface-elevated/70" />
      <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(220px,1fr))]">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="rounded-2xl border border-border bg-surface-elevated/70 p-4"
          >
            <div className="h-4 w-40 rounded-full bg-surface/80" />
            <div className="mt-3 h-10 w-20 rounded-full bg-surface/90" />
          </div>
        ))}
      </div>
    </Card>
  );
}

export function DashboardLoadingState() {
  return (
    <div className="space-y-6 animate-pulse">
      <section className="grid gap-4 md:grid-cols-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <DashboardStatCardSkeleton key={`overview-${index}`} />
        ))}
      </section>

      <DashboardSummarySkeleton />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <DashboardStatCardSkeleton key={`status-${index}`} />
        ))}
      </section>
    </div>
  );
}
