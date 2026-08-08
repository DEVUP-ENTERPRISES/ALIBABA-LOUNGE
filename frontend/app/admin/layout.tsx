import { AdminLayoutClient } from "@/components/admin/layout/AdminLayoutClient";

export const metadata = {
  title: "Admin | Alibaba Hookah Lounge",
  robots: { index: false, follow: false },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminLayoutClient>{children}</AdminLayoutClient>;
}
