import Link from "next/link";
import {
  PRICE_FILTERS,
  buildProductsHref,
  type CatalogCategory,
  type CatalogQuery,
} from "@/lib/storefront/catalog";

export default function CatalogFilterPanel({
  categories,
  query,
}: {
  categories: CatalogCategory[];
  query: CatalogQuery;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="font-bold text-slate-900">Bộ lọc</h2>
        <Link
          href="/products"
          className="text-xs font-semibold text-blue-600 transition hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Xóa tất cả
        </Link>
      </div>

      <FilterGroup title="Danh mục">
        <FilterLink href={buildProductsHref({ ...query, category: "", page: 1 })} active={!query.category}>
          Tất cả
        </FilterLink>
        {categories.map((category) => (
          <FilterLink
            key={category.id}
            href={buildProductsHref({ ...query, category: category.id, page: 1 })}
            active={query.category === category.id}
          >
            <span>{category.name}</span>
            <span className="text-slate-400">({category.productCount})</span>
          </FilterLink>
        ))}
      </FilterGroup>

      <FilterGroup title="Khoảng giá">
        {PRICE_FILTERS.map((filter) => {
          const active =
            query.minPrice === filter.minPrice &&
            query.maxPrice ===
              ("maxPrice" in filter ? filter.maxPrice : undefined);

          return (
            <FilterLink
              key={filter.label}
              href={buildProductsHref({
                ...query,
                minPrice: filter.minPrice,
                maxPrice: "maxPrice" in filter ? filter.maxPrice : undefined,
                page: 1,
              })}
              active={active}
            >
              {filter.label}
            </FilterLink>
          );
        })}
      </FilterGroup>

      <FilterGroup title="Tình trạng">
        <FilterLink
          href={buildProductsHref({ ...query, inStock: !query.inStock, page: 1 })}
          active={query.inStock}
        >
          Chỉ hàng còn
        </FilterLink>
      </FilterGroup>
    </div>
  );
}

function FilterGroup({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-t border-slate-100 py-4 first:border-t-0 first:pt-0">
      <h3 className="mb-2 text-sm font-bold text-slate-700">{title}</h3>
      <div className="grid gap-1">{children}</div>
    </section>
  );
}

function FilterLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`flex min-h-9 items-center justify-between gap-2 rounded-lg px-2 py-2 text-left text-sm transition focus:outline-none focus:ring-2 focus:ring-blue-500 ${
        active
          ? "bg-blue-50 font-bold text-blue-600"
          : "text-slate-600 hover:bg-slate-50 hover:text-blue-600"
      }`}
    >
      {children}
    </Link>
  );
}
