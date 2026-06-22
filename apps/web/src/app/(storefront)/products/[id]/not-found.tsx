import Link from "next/link";
import { PackageSearch } from "lucide-react";

export default function ProductNotFound() {
  return (
    <div className="mx-auto max-w-[1280px] px-4 py-20 text-center sm:px-6">
      <PackageSearch className="mx-auto size-12 text-slate-400" aria-hidden="true" />
      <h1 className="mt-4 text-2xl font-bold text-slate-900">
        Sản phẩm không tồn tại
      </h1>
      <p className="mx-auto mt-2 max-w-md text-slate-500">
        Sản phẩm này có thể đã bị xóa hoặc không còn được bán công khai.
      </p>
      <Link
        href="/products"
        className="mt-6 inline-flex rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        Quay lại danh sách
      </Link>
    </div>
  );
}
