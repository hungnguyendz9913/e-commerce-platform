import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  buildProductsHref,
  type CatalogPagination,
  type CatalogQuery,
} from "@/lib/storefront/catalog";

export default function CatalogPagination({
  pagination,
  query,
}: {
  pagination: CatalogPagination;
  query: CatalogQuery;
}) {
  if (pagination.totalPages <= 1) {
    return null;
  }

  const pages = Array.from({ length: pagination.totalPages }, (_, index) => index + 1);

  return (
    <nav aria-label="Phân trang sản phẩm" className="mt-8 flex justify-center">
      <div className="flex items-center gap-2">
        <PageLink
          href={buildProductsHref({ ...query, page: Math.max(1, pagination.page - 1) })}
          disabled={pagination.page === 1}
          label="Trang trước"
        >
          <ChevronLeft className="size-4" aria-hidden="true" />
        </PageLink>

        {pages.map((page) => (
          <PageLink
            key={page}
            href={buildProductsHref({ ...query, page })}
            active={page === pagination.page}
            label={`Trang ${page}`}
          >
            {page}
          </PageLink>
        ))}

        <PageLink
          href={buildProductsHref({
            ...query,
            page: Math.min(pagination.totalPages, pagination.page + 1),
          })}
          disabled={pagination.page === pagination.totalPages}
          label="Trang sau"
        >
          <ChevronRight className="size-4" aria-hidden="true" />
        </PageLink>
      </div>
    </nav>
  );
}

function PageLink({
  href,
  disabled = false,
  active = false,
  label,
  children,
}: {
  href: string;
  disabled?: boolean;
  active?: boolean;
  label: string;
  children: React.ReactNode;
}) {
  if (disabled) {
    return (
      <span
        aria-disabled="true"
        className="grid size-10 place-items-center rounded-lg border border-slate-200 text-sm font-bold text-slate-300"
      >
        {children}
      </span>
    );
  }

  return (
    <Link
      href={href}
      aria-label={label}
      aria-current={active ? "page" : undefined}
      className={`grid size-10 place-items-center rounded-lg border text-sm font-bold transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
        active
          ? "border-blue-600 bg-blue-600 text-white"
          : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
      }`}
    >
      {children}
    </Link>
  );
}
