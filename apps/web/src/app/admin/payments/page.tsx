import AdminGapPage from "@/components/admin/gap-page";
import { adminBackendGaps } from "@/lib/admin/service";

export const metadata = {
  title: "Thanh toán admin",
};

export default function AdminPaymentsPage() {
  return (
    <AdminGapPage
      title="Thanh toán"
      description="Lịch sử thanh toán sẽ hiển thị provider, method, amount, status, timestamp và context đơn/khách khi API có."
      gap={adminBackendGaps.payments}
    />
  );
}
