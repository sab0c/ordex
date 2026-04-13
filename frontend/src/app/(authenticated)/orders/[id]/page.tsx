import { notFound } from "next/navigation";
import { EditOrderPage } from "@/components/edit-order/edit-order-page";

type EditOrderRouteProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditOrderRoute({
  params,
}: Readonly<EditOrderRouteProps>) {
  const { id } = await params;
  const orderId = Number(id);

  if (!Number.isInteger(orderId) || orderId <= 0) {
    notFound();
  }

  return <EditOrderPage orderId={orderId} />;
}
