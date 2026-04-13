import { Card } from "@/components/ui/card";

type DashboardErrorStateProps = {
  error: string;
};

export function DashboardErrorState({
  error,
}: Readonly<DashboardErrorStateProps>) {
  return (
    <Card className="max-w-2xl border-danger/30 bg-danger/10">
      <h2 className="text-xl font-semibold text-foreground">
        Não foi possível carregar o dashboard
      </h2>
      <p className="mt-3 text-sm leading-7 text-danger">{error}</p>
    </Card>
  );
}
