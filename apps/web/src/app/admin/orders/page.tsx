import AdminGapPage from "@/components/admin/gap-page";
import { adminBackendGaps } from "@/lib/admin/service";

export const metadata = {
  title: "Đơn hàng",
};

export default function AdminOrdersPage() {
  return (
    <AdminGapPage
      title="Đơn hàng"
      description="Danh sách đơn, bộ lọc trạng thái/thanh toán và điều hướng chi tiết sẽ dùng admin order API khi có."
      gap={adminBackendGaps.orders}
    />
  );
}
