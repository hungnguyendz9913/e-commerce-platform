import { AdminFilterBar, AdminInput, AdminPageHeader, AdminPagination, AdminPanel, AdminSelect, AdminStatusBadge, AdminTable } from "@/components/admin/admin-ui";
import { ProductDeleteButton, ProductFormButton } from "@/components/admin/admin-actions";
import { getAdminCategories, getAdminProducts } from "@/lib/admin/service";
import { adminStatus } from "@/lib/admin/status";
import { formatVnd } from "@/lib/commerce/normalizers";

export const metadata = {
  title: "Sản phẩm admin",
};

type PageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function stringParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function AdminProductsPage({ searchParams }: PageProps) {
  const params = (await searchParams) ?? {};
  const page = Number(stringParam(params.page) ?? 1);
  const result = await getAdminProducts({
    page,
    q: stringParam(params.q),
    status: stringParam(params.status),
    approvalStatus: stringParam(params.approvalStatus),
    sortBy: stringParam(params.sortBy),
    sortOrder: stringParam(params.sortOrder) as "asc" | "desc" | undefined,
  });
  const categories = await getAdminCategories();

  return (
    <>
      <AdminPageHeader
        title="Sản phẩm"
        description="Danh sách sản phẩm dùng hợp đồng admin products hiện có."
        action={<ProductFormButton categories={categories} />}
      />

      <AdminPanel>
        <form action="/admin/products">
          <AdminFilterBar>
            <AdminInput name="q" placeholder="Tìm tên hoặc SKU" defaultValue={stringParam(params.q)} />
            <AdminSelect name="status" defaultValue={stringParam(params.status) ?? "all"} aria-label="Trạng thái sản phẩm">
              <option value="all">Mọi trạng thái</option>
              <option value="ACTIVE">Đang bán</option>
              <option value="INACTIVE">Tạm ẩn</option>
              <option value="ARCHIVED">Lưu trữ</option>
            </AdminSelect>
            <AdminSelect name="approvalStatus" defaultValue={stringParam(params.approvalStatus) ?? "all"} aria-label="Trạng thái duyệt">
              <option value="all">Mọi trạng thái duyệt</option>
              <option value="PENDING">Chờ duyệt</option>
              <option value="APPROVED">Đã duyệt</option>
              <option value="REJECTED">Từ chối</option>
            </AdminSelect>
            <button type="submit" className="min-h-10 rounded-lg bg-slate-950 px-4 text-sm font-bold text-white transition hover:bg-slate-800">
              Lọc
            </button>
          </AdminFilterBar>
        </form>

        <AdminTable columns={["Sản phẩm", "SKU", "Danh mục", "Giá", "Tồn kho", "Trạng thái", "Duyệt", "Thao tác"]}>
          {result.items.map((product) => (
            <tr key={product.id} className="align-top">
              <td className="px-4 py-3">
                <div className="font-bold text-slate-950">{product.name}</div>
                <div className="mt-1 line-clamp-1 max-w-xs text-xs text-slate-500">{product.slug}</div>
              </td>
              <td className="px-4 py-3 font-mono text-xs text-slate-600">{product.sku}</td>
              <td className="px-4 py-3 text-slate-600">{product.categoryName || "Chưa phân loại"}</td>
              <td className="px-4 py-3 font-semibold text-slate-950">{formatVnd(product.price)}</td>
              <td className="px-4 py-3 text-slate-600">
                {product.inventory.availableQuantity}/{product.inventory.stockQuantity}
              </td>
              <td className="px-4 py-3"><AdminStatusBadge status={adminStatus.product(product.status)} /></td>
              <td className="px-4 py-3"><AdminStatusBadge status={adminStatus.approval(product.approvalStatus)} /></td>
              <td className="px-4 py-3">
                <div className="flex gap-3">
                  <ProductFormButton product={product} categories={categories} />
                  <ProductDeleteButton product={product} />
                </div>
              </td>
            </tr>
          ))}
        </AdminTable>
        <AdminPagination page={result.meta.page} totalPages={result.meta.totalPages} basePath="/admin/products" />
      </AdminPanel>
    </>
  );
}
