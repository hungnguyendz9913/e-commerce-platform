import Link from "next/link";
import { LockKeyhole } from "lucide-react";

export const metadata = {
  title: "Cần đăng nhập | ShopVN",
};

export default function UnauthorizedPage() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-slate-50 px-4 py-12">
      <div className="max-w-md text-center">
        <LockKeyhole className="mx-auto mb-5 size-16 rounded-2xl bg-blue-100 p-4 text-blue-600" />
        <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
          401
        </p>
        <h1 className="mt-2 text-3xl font-bold text-slate-950">
          Bạn cần đăng nhập
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-500">
          Vui lòng đăng nhập để tiếp tục truy cập khu vực này của ShopVN.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link
            href="/login"
            className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Đăng nhập
          </Link>
          <Link
            href="/"
            className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Trang chủ
          </Link>
        </div>
      </div>
    </main>
  );
}
