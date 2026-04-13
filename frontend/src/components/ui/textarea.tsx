import { cn } from "@/lib/utils";
import {
  Field,
  FieldLabel,
  FieldMessage,
  fieldControlBaseClassName,
} from "./field";

type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string;
  error?: string;
};

export function Textarea({
  className,
  error,
  id,
  label,
  ...props
}: Readonly<TextareaProps>) {
  return (
    <Field htmlFor={id}>
      <FieldLabel>{label}</FieldLabel>
      <textarea
        id={id}
        className={cn(
          fieldControlBaseClassName,
          "min-h-32 rounded-3xl px-4 py-3 leading-6 resize-none placeholder:text-muted-foreground/70",
          error && "border-danger focus:border-danger focus:ring-danger/30",
          className,
        )}
        {...props}
      />
      {error ? <FieldMessage className="text-danger">{error}</FieldMessage> : null}
    </Field>
  );
}
