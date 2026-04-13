import { AuthenticatedAppLayout } from "@/components/auth/authenticated-app-layout";

export default function OrdersLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <AuthenticatedAppLayout>{children}</AuthenticatedAppLayout>;
}
