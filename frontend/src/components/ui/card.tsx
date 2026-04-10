import { cn } from "@/lib/utils";

export function Card({
  children,
  className,
}: Readonly<{
  children?: React.ReactNode;
  className?: string;
}>) {
  return (
    <section
      className={cn(
        "glass-panel rounded-3xl p-6",
        className,
      )}
    >
      {children}
    </section>
  );
}
