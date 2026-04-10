import { Card } from "./card";

export function StatCard({
  accent,
  label,
  value,
  helper,
}: Readonly<{
  accent: string;
  label: string;
  value: string;
  helper: string;
}>) {
  return (
    <Card className="p-5">
      <div
        className="mb-4 h-2 w-16 rounded-full"
        style={{ backgroundColor: accent }}
      />
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-3 text-3xl font-semibold tracking-tight text-foreground">
        {value}
      </p>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{helper}</p>
    </Card>
  );
}
