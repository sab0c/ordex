import { Suspense } from "react";

import { OrdersPage } from "@/components/orders/orders-page";

export default function OrdersRoute() {
  return (
    <Suspense
      fallback={
        <div className="space-y-6">
          <div className="glass-panel h-24 animate-pulse rounded-3xl" />
          <div className="glass-panel h-[420px] animate-pulse rounded-3xl" />
        </div>
      }
    >
      <OrdersPage />
    </Suspense>
  );
}
