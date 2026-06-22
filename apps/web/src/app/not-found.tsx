import Link from "next/link";
import { PackageSearch } from "lucide-react";

export const metadata = {
  title: "Không tìm thấy trang | ShopVN",
};

export default function NotFound() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-slate-50 px-4 py-12">
      <section className="max-w-md text-center" aria-labelledby="not-found-title">
        <PackageSearch
          className="mx-auto mb-5 size-16 rounded-2xl bg-blue-100 p-4 text-blue-600"
          aria-hidden="true"
        />
        <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
          404
        </p>
        <h1 id="not-found-title" className="mt-2 text-3xl font-bold text-slate-950">
          Không tìm thấy trang
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-500">
          Trang bạn cần có thể đã được di chuyển, bị xóa, hoặc không còn khả
          dụng trên ShopVN.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link
            href="/"
            className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Về trang chủ
          </Link>
          <Link
            href="/products"
            className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Xem sản phẩm
          </Link>
        </div>
      </section>
    </main>
  );
}
