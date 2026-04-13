import Link from "next/link";
import { Card } from "./card";

export function StatCard({
  accent,
  href,
  label,
  value,
  helper,
}: Readonly<{
  accent: string;
  href?: string;
  label: string;
  value: string;
  helper: string;
}>) {
  const content = (
    <Card className="flex h-full flex-col p-5">
      <div
        className="mb-4 h-2 w-16 shrink-0 rounded-full"
        style={{ backgroundColor: accent }}
      />
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-3 text-3xl font-semibold tracking-tight text-foreground">
        {value}
      </p>
      <p className="mt-2 min-h-[3rem] text-sm leading-6 text-muted-foreground">
        {helper}
      </p>
    </Card>
  );

  if (!href) {
    return content;
  }

  return (
    <Link
      className="block h-full rounded-[2rem] transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      href={href}
    >
      {content}
    </Link>
  );
}
