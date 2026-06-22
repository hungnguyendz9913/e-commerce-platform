import AdminShell from "@/components/admin/admin-shell";
import { getCurrentUserFromCookies } from "@/lib/auth/server";

export const metadata = {
  title: "Admin | ShopVN",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getCurrentUserFromCookies();

  return <AdminShell currentUser={session.user}>{children}</AdminShell>;
}
