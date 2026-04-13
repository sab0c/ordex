export const appRoutes = {
  home: "/",
  dashboard: "/dashboard",
  orders: "/orders",
  newOrder: "/dashboard/new-order",
  orderEdit: (orderId: number | string) => `/orders/${orderId}`,
} as const;
