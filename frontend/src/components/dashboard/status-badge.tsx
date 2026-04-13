"use client";

import type { CSSProperties } from "react";
import type { OrderStatus } from "@/lib/api";
import { dashboardStatusColorTokens } from "@/app/themes/dashboard-color-tokens";

const fallbackBadgeColors = {
  background: "var(--surface-elevated)",
  border: "var(--border)",
  text: "var(--muted-foreground)",
} as const;

export function StatusBadge({
  status,
}: Readonly<{ status: OrderStatus | string | null | undefined }>) {
  const badgeColors =
    status && status in dashboardStatusColorTokens
      ? dashboardStatusColorTokens[status as OrderStatus].badge
      : fallbackBadgeColors;
  const label = status?.trim() ? status : "Status indisponível";

  const style: CSSProperties = {
    backgroundColor: badgeColors.background,
    borderColor: badgeColors.border,
    color: badgeColors.text,
  };

  return (
    <span
      className="inline-flex items-center justify-center whitespace-nowrap rounded-full border px-4 py-1.5 text-sm font-semibold leading-none"
      style={style}
    >
      {label}
    </span>
  );
}
