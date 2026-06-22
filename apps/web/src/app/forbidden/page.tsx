import Link from "next/link";
import { ShieldX } from "lucide-react";

export const metadata = {
  title: "Không có quyền | ShopVN",
};

export default function ForbiddenPage() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-slate-50 px-4 py-12">
      <div className="max-w-md text-center">
        <ShieldX className="mx-auto mb-5 size-16 rounded-2xl bg-red-100 p-4 text-red-600" />
        <p className="text-sm font-semibold uppercase tracking-wide text-red-600">
          403
        </p>
        <h1 className="mt-2 text-3xl font-bold text-slate-950">
          Không có quyền truy cập
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-500">
          Tài khoản hiện tại không có vai trò phù hợp để truy cập trang này.
        </p>
        <div className="mt-6 flex justify-center">
          <Link
            href="/"
            className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Về trang chủ
          </Link>
        </div>
      </div>
    </main>
  );
}
