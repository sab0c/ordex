"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  Field,
  FieldLabel,
  FieldMessage,
  fieldControlBaseClassName,
  fieldSizeClassNames,
} from "@/components/ui/field";
import { cn } from "@/lib/utils";
import type { FilterOption } from "../types/orders-filters.types";

function ChevronDownIcon({ isOpen }: Readonly<{ isOpen: boolean }>) {
  return (
    <svg
      aria-hidden="true"
      className={`h-4 w-4 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
      fill="none"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M6 9L12 15L18 9"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

type FilterSelectProps<T extends string> = {
  id: string;
  label: string;
  options: FilterOption<T>[];
  placeholder?: string;
  allowEmpty?: boolean;
  disabled?: boolean;
  error?: string;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  value: "" | T;
  onChange: (value: "" | T) => void;
};

export function FilterSelect<T extends string>({
  id,
  label,
  allowEmpty = true,
  disabled = false,
  error,
  isOpen,
  onChange,
  onOpenChange,
  options,
  placeholder,
  value,
}: Readonly<FilterSelectProps<T>>) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const onOpenChangeRef = useRef(onOpenChange);
  const [menuStyle, setMenuStyle] = useState<{
    top: number;
    left: number;
    width: number;
  } | null>(null);

  useEffect(() => {
    onOpenChangeRef.current = onOpenChange;
  }, [onOpenChange]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handlePointerDown(event: MouseEvent) {
      const target = event.target as Node;

      if (
        !containerRef.current?.contains(target) &&
        !menuRef.current?.contains(target)
      ) {
        onOpenChangeRef.current(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onOpenChangeRef.current(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  useLayoutEffect(() => {
    if (!isOpen || !triggerRef.current) {
      return;
    }

    function updateMenuPosition() {
      const rect = triggerRef.current?.getBoundingClientRect();

      if (!rect) {
        return;
      }

      setMenuStyle({
        top: rect.bottom + 10,
        left: rect.left,
        width: rect.width,
      });
    }

    updateMenuPosition();

    window.addEventListener("resize", updateMenuPosition);
    window.addEventListener("scroll", updateMenuPosition, true);

    return () => {
      window.removeEventListener("resize", updateMenuPosition);
      window.removeEventListener("scroll", updateMenuPosition, true);
    };
  }, [isOpen]);

  const selectedOption = options.find((option) => option.value === value);
  const resolvedLabel = selectedOption?.label ?? placeholder ?? "";

  return (
    <Field>
      <FieldLabel>{label}</FieldLabel>
      <div className="relative z-30" ref={containerRef}>
        <button
          aria-controls={`${id}-listbox`}
          aria-disabled={disabled}
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          className={cn(
            fieldControlBaseClassName,
            fieldSizeClassNames.default,
            "flex items-center justify-between rounded-[1.6rem] text-left transition-[border-color,box-shadow,background-color,transform] hover:border-primary/40 hover:bg-surface-elevated/80 disabled:cursor-not-allowed disabled:opacity-60",
            error && "border-danger focus:border-danger focus:ring-danger/30",
          )}
          disabled={disabled}
          id={id}
          ref={triggerRef}
          type="button"
          onClick={() => {
            if (!disabled) {
              onOpenChange(!isOpen);
            }
          }}
        >
          <span className="truncate">{resolvedLabel}</span>
          <span className="ml-3 shrink-0 text-muted-foreground">
            <ChevronDownIcon isOpen={isOpen} />
          </span>
        </button>

        {isOpen && menuStyle
          ? createPortal(
              <div
                className="fixed z-[90] overflow-hidden rounded-[1.75rem] border border-border/80 bg-surface/95 p-2 shadow-[0_24px_70px_var(--app-sidebar-shadow)] backdrop-blur-2xl"
                id={`${id}-listbox`}
                ref={menuRef}
                role="listbox"
                style={{
                  top: menuStyle.top,
                  left: menuStyle.left,
                  width: menuStyle.width,
                }}
              >
                {allowEmpty ? (
                  <button
                    aria-selected={value === ""}
                    className={`flex w-full items-center rounded-[1.15rem] px-4 py-3 text-left text-sm transition-colors ${
                      value === ""
                        ? "bg-primary/14 text-foreground"
                        : "text-muted-foreground hover:bg-surface/80 hover:text-foreground"
                    }`}
                    role="option"
                    type="button"
                    onClick={() => {
                      onChange("");
                      onOpenChange(false);
                    }}
                  >
                    {placeholder}
                  </button>
                ) : null}

                {options.map((option) => {
                  const isSelected = option.value === value;

                  return (
                    <button
                      key={option.value}
                      aria-selected={isSelected}
                      className={`mt-1 flex w-full items-center rounded-[1.15rem] px-4 py-3 text-left text-sm transition-colors ${
                        isSelected
                          ? "bg-primary/14 text-foreground"
                          : "text-muted-foreground hover:bg-surface/80 hover:text-foreground"
                      }`}
                      role="option"
                      type="button"
                      onClick={() => {
                        onChange(option.value);
                        onOpenChange(false);
                      }}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>,
              document.body,
            )
          : null}
      </div>
      {error ? <FieldMessage className="text-danger">{error}</FieldMessage> : null}
    </Field>
  );
}
