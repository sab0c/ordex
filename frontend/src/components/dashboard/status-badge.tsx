"use client";

import type { CSSProperties } from "react";
import type { OrderStatus } from "@/lib/api";
import { dashboardStatusColorTokens } from "@/app/themes/dashboard-color-tokens";

export function StatusBadge({ status }: Readonly<{ status: OrderStatus }>) {
  const badgeColors = dashboardStatusColorTokens[status].badge;

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
      {status}
    </span>
  );
}
