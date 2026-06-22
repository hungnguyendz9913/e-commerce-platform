import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { AdminEmpty, AdminPageHeader, AdminPanel } from "@/components/admin/admin-ui";
import { getAdminDashboard } from "@/lib/admin/service";

export const metadata = {
  title: "Tổng quan admin",
};

export default async function AdminDashboardPage() {
  const dashboard = await getAdminDashboard();

  return (
    <>
      <AdminPageHeader
        title="Tổng quan"
        description="Các số liệu backend-backed sẽ xuất hiện tại đây khi API dashboard sẵn sàng."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {dashboard.metrics.map((metric) => (
          <AdminPanel key={metric.label} className="p-4">
            <p className="text-sm font-semibold text-slate-500">{metric.label}</p>
            <p className="mt-2 text-xl font-bold text-slate-950">{metric.value}</p>
            {metric.href ? (
              <Link
                href={metric.href}
                className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-blue-700 hover:text-blue-800"
              >
                Mở trang <ArrowRight className="size-4" />
              </Link>
            ) : null}
          </AdminPanel>
        ))}
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-2">
        <AdminPanel>
          <div className="border-b border-slate-200 p-4">
            <h3 className="font-bold text-slate-950">Đơn gần đây</h3>
          </div>
          <AdminEmpty
            title="Chưa có API dashboard"
            description="Recent orders cần hợp đồng dashboard hoặc admin order list trước khi hiển thị dữ liệu sản xuất."
            actionHref="/admin/orders"
            actionLabel="Xem trạng thái API đơn hàng"
          />
        </AdminPanel>

        <AdminPanel>
          <div className="border-b border-slate-200 p-4">
            <h3 className="font-bold text-slate-950">Sản phẩm sắp hết hàng</h3>
          </div>
          <AdminEmpty
            title="Chưa có API tồn kho riêng"
            description="Thông tin low-stock riêng sẽ được bật khi backend có inventory list hoặc dashboard summary."
            actionHref="/admin/inventory"
            actionLabel="Xem tồn kho"
          />
        </AdminPanel>
      </div>
    </>
  );
}
