import { AdminEmpty, AdminPageHeader, AdminPanel, AdminTable } from "@/components/admin/admin-ui";
import { adminBackendGaps } from "@/lib/admin/service";

export const metadata = {
  title: "Doanh thu",
};

export default function AdminRevenuePage() {
  return (
    <>
      <AdminPageHeader
        title="Doanh thu"
        description="Báo cáo ưu tiên bảng số liệu; biểu đồ chỉ bật khi có dependency được phê duyệt."
      />
      <AdminPanel>
        <AdminEmpty title="Chờ API doanh thu" description={adminBackendGaps.revenue} />
        <AdminTable columns={["Kỳ", "Doanh thu", "Đơn hàng", "AOV"]}>
          <tr>
            <td className="px-4 py-3 text-slate-500" colSpan={4}>Chưa có dữ liệu backend.</td>
          </tr>
        </AdminTable>
      </AdminPanel>
    </>
  );
}
