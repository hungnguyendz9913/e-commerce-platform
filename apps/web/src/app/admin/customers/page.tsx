import AdminGapPage from "@/components/admin/gap-page";
import { adminBackendGaps } from "@/lib/admin/service";

export const metadata = {
  title: "Khách hàng",
};

export default function AdminCustomersPage() {
  return (
    <AdminGapPage
      title="Khách hàng"
      description="Danh sách khách hàng và thao tác trạng thái không hiển thị trường credential nhạy cảm."
      gap={adminBackendGaps.customers}
    />
  );
}
