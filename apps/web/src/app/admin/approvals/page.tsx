import { AdminEmpty, AdminPageHeader, AdminPanel } from "@/components/admin/admin-ui";

export const metadata = {
  title: "Duyệt hàng",
};

export default function AdminApprovalsPage() {
  return (
    <>
      <AdminPageHeader
        title="Duyệt hàng"
        description="Hàng chờ duyệt có thể được vận hành qua bộ lọc sản phẩm `approvalStatus=PENDING` và cập nhật sản phẩm."
      />
      <AdminPanel>
        <AdminEmpty
          title="Dùng danh sách sản phẩm để duyệt"
          description="Backend chưa có approval queue riêng; thao tác duyệt/từ chối được giới hạn ở hợp đồng update product."
          actionHref="/admin/products?approvalStatus=PENDING"
          actionLabel="Xem sản phẩm chờ duyệt"
        />
      </AdminPanel>
    </>
  );
}
