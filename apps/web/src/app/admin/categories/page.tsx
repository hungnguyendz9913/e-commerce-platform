import { AdminEmpty, AdminPageHeader, AdminPanel, AdminStatusBadge } from "@/components/admin/admin-ui";
import { CategoryDeleteButton, CategoryFormButton } from "@/components/admin/admin-actions";
import { getAdminCategories } from "@/lib/admin/service";
import { adminStatus } from "@/lib/admin/status";

export const metadata = {
  title: "Danh mục",
};

function CategoryNode({ category, depth = 0 }: { category: Awaited<ReturnType<typeof getAdminCategories>>[number]; depth?: number }) {
  return (
    <li className="border-b border-slate-100 last:border-b-0">
      <div className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between" style={{ paddingLeft: `${16 + depth * 20}px` }}>
        <div>
          <p className="font-bold text-slate-950">{category.name}</p>
          <p className="text-xs text-slate-500">{category.slug}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-slate-500">{category.productCount ?? 0} sản phẩm</span>
          <AdminStatusBadge status={adminStatus.product(category.status)} />
          <CategoryFormButton category={category} />
          <CategoryDeleteButton category={category} />
        </div>
      </div>
      {category.children.length ? (
        <ul>{category.children.map((child) => <CategoryNode key={child.id} category={child} depth={depth + 1} />)}</ul>
      ) : null}
    </li>
  );
}

export default async function AdminCategoriesPage() {
  const categories = await getAdminCategories();

  return (
    <>
      <AdminPageHeader
        title="Danh mục"
        description="Quản lý cây danh mục bằng hợp đồng admin categories hiện có."
        action={<CategoryFormButton />}
      />
      <AdminPanel>
        {categories.length ? (
          <ul>{categories.map((category) => <CategoryNode key={category.id} category={category} />)}</ul>
        ) : (
          <AdminEmpty title="Chưa có danh mục" description="Danh mục sẽ xuất hiện sau khi backend trả dữ liệu." />
        )}
      </AdminPanel>
    </>
  );
}
