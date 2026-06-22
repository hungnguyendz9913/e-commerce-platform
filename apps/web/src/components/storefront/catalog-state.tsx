import Link from "next/link";
import { AlertCircle, PackageSearch } from "lucide-react";

export function ProductCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="aspect-square animate-pulse bg-slate-200" />
      <div className="space-y-3 p-4">
        <div className="h-3 w-20 animate-pulse rounded bg-slate-200" />
        <div className="h-4 w-full animate-pulse rounded bg-slate-200" />
        <div className="h-4 w-2/3 animate-pulse rounded bg-slate-200" />
        <div className="h-5 w-24 animate-pulse rounded bg-slate-200" />
      </div>
    </div>
  );
}

export function EmptyCatalogState() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-6 py-16 text-center">
      <PackageSearch className="mx-auto size-10 text-slate-400" aria-hidden="true" />
      <h2 className="mt-4 text-lg font-bold text-slate-900">
        Không tìm thấy sản phẩm
      </h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
        Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm để xem thêm sản phẩm.
      </p>
      <Link
        href="/products"
        className="mt-5 inline-flex rounded-lg font-semibold text-blue-600 transition hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        Xóa tất cả bộ lọc
      </Link>
    </div>
  );
}

export function CatalogErrorState({
  title = "Không tải được catalog",
  description = "Có lỗi xảy ra khi tải dữ liệu. Vui lòng thử lại.",
  reset,
}: {
  title?: string;
  description?: string;
  reset?: () => void;
}) {
  return (
    <div className="mx-auto max-w-[1280px] px-4 py-16 sm:px-6">
      <div className="rounded-xl border border-red-100 bg-white px-6 py-12 text-center shadow-sm">
        <AlertCircle className="mx-auto size-10 text-red-500" aria-hidden="true" />
        <h1 className="mt-4 text-xl font-bold text-slate-900">{title}</h1>
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
          {description}
        </p>
        <div className="mt-6 flex justify-center gap-3">
          {reset ? (
            <button
              type="button"
              onClick={reset}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Thử lại
            </button>
          ) : null}
          <Link
            href="/products"
            className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Về danh sách
          </Link>
        </div>
      </div>
    </div>
  );
}
