import { cn } from "@/lib/utils";

export const fieldWrapperClassName = "flex w-full flex-col gap-2 text-sm text-foreground";
export const fieldLabelClassName = "font-medium text-muted-foreground";
export const fieldControlBaseClassName =
  "themed-input w-full border border-transparent bg-input-surface text-sm text-foreground outline-none backdrop-blur-md transition-[border-color,box-shadow,background-color] focus:border-primary focus:ring-2 focus:ring-ring";
export const fieldSizeClassNames = {
  default: "h-12 px-4",
  compact: "h-10 px-4",
} as const;

type FieldProps = {
  children: React.ReactNode;
  className?: string;
  htmlFor?: string;
};

type FieldLabelProps = {
  children: React.ReactNode;
  className?: string;
};

type FieldMessageProps = {
  children: React.ReactNode;
  className?: string;
};

export function Field({
  children,
  className,
  htmlFor,
}: Readonly<FieldProps>) {
  return (
    <label className={cn(fieldWrapperClassName, className)} htmlFor={htmlFor}>
      {children}
    </label>
  );
}

export function FieldLabel({
  children,
  className,
}: Readonly<FieldLabelProps>) {
  return <span className={cn(fieldLabelClassName, className)}>{children}</span>;
}

export function FieldMessage({
  children,
  className,
}: Readonly<FieldMessageProps>) {
  return <span className={cn("text-xs", className)}>{children}</span>;
}
