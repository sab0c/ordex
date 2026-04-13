import { useRef, useState } from "react";
import { cn } from "@/lib/utils";

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
  clearable?: boolean;
  onClear?: () => void;
};

function EyeOpenIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-4 w-4"
      fill="none"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M2 12C3.73 7.61 7.52 5 12 5C16.48 5 20.27 7.61 22 12C20.27 16.39 16.48 19 12 19C7.52 19 3.73 16.39 2 12Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

function EyeClosedIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-4 w-4"
      fill="none"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M3 3L21 21"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
      <path
        d="M10.58 10.58C10.21 10.95 10 11.46 10 12C10 13.1 10.9 14 12 14C12.54 14 13.05 13.79 13.42 13.42"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
      <path
        d="M9.88 5.09C10.56 5.03 11.27 5 12 5C16.48 5 20.27 7.61 22 12C21.18 14.08 19.83 15.88 18.12 17.25"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
      <path
        d="M6.71 6.72C4.76 7.95 3.17 9.76 2 12C3.73 16.39 7.52 19 12 19C13.82 19 15.53 18.57 17.04 17.82"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function ClearIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-4 w-4"
      fill="none"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M6 6L18 18"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
      <path
        d="M18 6L6 18"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

export function Input({
  className,
  clearable = false,
  error,
  id,
  label,
  onClear,
  type,
  ...props
}: InputProps) {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const isPasswordField = type === "password";
  const resolvedType = isPasswordField && isPasswordVisible ? "text" : type;
  const hasStringValue = typeof props.value === "string" && props.value.length > 0;
  const showClearButton = clearable && !isPasswordField && hasStringValue;

  function handleClear() {
    onClear?.();
    inputRef.current?.focus();
  }

  return (
    <label className="flex w-full flex-col gap-2 text-sm text-foreground" htmlFor={id}>
      <span className="font-medium text-muted-foreground">{label}</span>
      <div className="relative">
        <input
          id={id}
          ref={inputRef}
          type={resolvedType}
          className={cn(
            "themed-input h-12 w-full rounded-2xl border border-transparent bg-input-surface px-4 text-sm text-foreground outline-none backdrop-blur-md transition-[border-color,box-shadow,background-color] placeholder:text-muted-foreground/70 focus:border-primary focus:ring-2 focus:ring-ring",
            (isPasswordField || showClearButton) && "pr-12",
            error && "border-danger focus:border-danger focus:ring-danger/30",
            className,
          )}
          {...props}
        />
        {showClearButton ? (
          <button
            aria-label="Limpar campo"
            className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
            type="button"
            onClick={handleClear}
          >
            <ClearIcon />
          </button>
        ) : null}
        {isPasswordField ? (
          <button
            aria-label={isPasswordVisible ? "Ocultar senha" : "Mostrar senha"}
            className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
            type="button"
            onClick={() => setIsPasswordVisible((currentValue) => !currentValue)}
          >
            {isPasswordVisible ? <EyeClosedIcon /> : <EyeOpenIcon />}
          </button>
        ) : null}
      </div>
      {error ? <span className="text-xs text-danger">{error}</span> : null}
    </label>
  );
}
