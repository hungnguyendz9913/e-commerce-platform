import { AdminFilterBar, AdminInput, AdminPageHeader, AdminPagination, AdminPanel, AdminStatusBadge, AdminTable } from "@/components/admin/admin-ui";
import { VoucherDeactivateButton, VoucherFormButton } from "@/components/admin/admin-actions";
import { getAdminVouchers } from "@/lib/admin/service";
import { adminStatus } from "@/lib/admin/status";
import { formatVnd } from "@/lib/commerce/normalizers";

export const metadata = {
  title: "Voucher",
};

type PageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function stringParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function AdminVouchersPage({ searchParams }: PageProps) {
  const params = (await searchParams) ?? {};
  const page = Number(stringParam(params.page) ?? 1);
  const result = await getAdminVouchers({ page, q: stringParam(params.q) });

  return (
    <>
      <AdminPageHeader
        title="Voucher"
        description="Danh sách voucher dùng hợp đồng admin vouchers hiện có; thao tác hard-delete không được hiển thị."
        action={<VoucherFormButton />}
      />
      <AdminPanel>
        <form action="/admin/vouchers">
          <AdminFilterBar>
            <AdminInput name="q" placeholder="Tìm mã voucher" defaultValue={stringParam(params.q)} />
            <button type="submit" className="min-h-10 rounded-lg bg-slate-950 px-4 text-sm font-bold text-white transition hover:bg-slate-800 md:col-start-4">
              Lọc
            </button>
          </AdminFilterBar>
        </form>
        <AdminTable columns={["Mã", "Loại", "Giá trị", "Đơn tối thiểu", "Sử dụng", "Hết hạn", "Trạng thái", "Thao tác"]}>
          {result.items.map((voucher) => (
            <tr key={voucher.id}>
              <td className="px-4 py-3 font-mono text-sm font-bold text-slate-950">{voucher.code}</td>
              <td className="px-4 py-3 text-slate-600">{voucher.discountType}</td>
              <td className="px-4 py-3 font-semibold text-slate-950">{voucher.discountType === "PERCENTAGE" ? `${voucher.discountValue}%` : formatVnd(voucher.discountValue)}</td>
              <td className="px-4 py-3 text-slate-600">{formatVnd(voucher.minimumOrderAmount)}</td>
              <td className="px-4 py-3 text-slate-600">{voucher.usedCount ?? 0}/{voucher.usageLimit ?? "∞"}</td>
              <td className="px-4 py-3 text-slate-600">{voucher.expiresAt ? new Date(voucher.expiresAt).toLocaleDateString("vi-VN") : "Không giới hạn"}</td>
              <td className="px-4 py-3"><AdminStatusBadge status={adminStatus.voucher(voucher.status)} /></td>
              <td className="px-4 py-3">
                <div className="flex gap-3">
                  <VoucherFormButton voucher={voucher} />
                  <VoucherDeactivateButton voucher={voucher} />
                </div>
              </td>
            </tr>
          ))}
        </AdminTable>
        <AdminPagination page={result.meta.page} totalPages={result.meta.totalPages} basePath="/admin/vouchers" />
      </AdminPanel>
    </>
  );
}
