import AdminGapPage from "@/components/admin/gap-page";
import { adminBackendGaps } from "@/lib/admin/service";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;

  return {
    title: `Đơn hàng ${orderId}`,
  };
}

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;

  return (
    <AdminGapPage
      title={`Đơn hàng ${orderId}`}
      description="Chi tiết đơn hàng admin cần endpoint không customer-scoped trước khi hiển thị dữ liệu sản xuất."
      gap={adminBackendGaps.orders}
    />
  );
}
