import Link from "next/link";
import { X } from "lucide-react";
import {
  PRICE_FILTERS,
  buildProductsHref,
  type CatalogCategory,
  type CatalogQuery,
} from "@/lib/storefront/catalog";

export default function CatalogActiveFilters({
  query,
  selectedCategory,
}: {
  query: CatalogQuery;
  selectedCategory?: CatalogCategory;
}) {
  const priceLabel = PRICE_FILTERS.find(
    (filter) =>
      filter.minPrice === (query.minPrice ?? 0) &&
      ("maxPrice" in filter ? filter.maxPrice : undefined) === query.maxPrice,
  )?.label;
  const chips = [
    query.search
      ? {
          label: `Tìm: ${query.search}`,
          href: buildProductsHref({ ...query, search: "", page: 1 }),
        }
      : null,
    selectedCategory
      ? {
          label: selectedCategory.name,
          href: buildProductsHref({ ...query, category: "", page: 1 }),
        }
      : null,
    priceLabel
      ? {
          label: priceLabel,
          href: buildProductsHref({
            ...query,
            minPrice: undefined,
            maxPrice: undefined,
            page: 1,
          }),
        }
      : null,
    query.inStock
      ? {
          label: "Còn hàng",
          href: buildProductsHref({ ...query, inStock: false, page: 1 }),
        }
      : null,
  ].filter((chip): chip is { label: string; href: string } => chip !== null);

  if (chips.length === 0) {
    return null;
  }

  return (
    <div className="mb-4 flex flex-wrap items-center gap-2">
      {chips.map((chip) => (
        <Link
          key={chip.label}
          href={chip.href}
          className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700 transition hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          {chip.label}
          <X className="size-3" aria-hidden="true" />
        </Link>
      ))}
      <Link
        href="/products"
        className="rounded-full px-3 py-1 text-xs font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        Xóa tất cả
      </Link>
    </div>
  );
}
