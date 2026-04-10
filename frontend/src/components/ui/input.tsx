import { cn } from "@/lib/utils";

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
};

export function Input({ className, error, id, label, ...props }: InputProps) {
  return (
    <label className="flex w-full flex-col gap-2 text-sm text-foreground" htmlFor={id}>
      <span className="font-medium text-muted-foreground">{label}</span>
      <input
        id={id}
        className={cn(
          "themed-input h-12 rounded-2xl border border-input-border bg-input-surface px-4 text-sm text-foreground shadow-[0_8px_20px_rgba(18,112,77,0.04),inset_0_1px_0_rgba(255,255,255,0.45)] outline-none backdrop-blur-md transition-colors placeholder:text-muted-foreground/70 focus:border-primary focus:ring-2 focus:ring-ring",
          error && "border-danger focus:border-danger focus:ring-danger/30",
          className,
        )}
        {...props}
      />
      {error ? <span className="text-xs text-danger">{error}</span> : null}
    </label>
  );
}
