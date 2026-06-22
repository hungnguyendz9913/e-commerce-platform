"use client";

import { useRouter } from "next/navigation";
import {
  CATALOG_SORT_OPTIONS,
  buildProductsHref,
  type CatalogQuery,
  type CatalogSortValue,
} from "@/lib/storefront/catalog";

export default function CatalogSortSelect({ query }: { query: CatalogQuery }) {
  const router = useRouter();

  return (
    <label className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600">
      <span className="sr-only">Sắp xếp</span>
      <select
        value={query.sort}
        onChange={(event) => {
          router.push(
            buildProductsHref({
              ...query,
              sort: event.target.value as CatalogSortValue,
              page: 1,
            }),
          );
        }}
        className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
      >
        {CATALOG_SORT_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
