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
      className="inline-flex rounded-full border px-3 py-1 text-xs font-semibold"
      style={style}
    >
      {status}
    </span>
  );
}
