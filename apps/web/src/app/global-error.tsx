"use client";

import { AlertTriangle } from "lucide-react";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body>
        <main className="flex min-h-dvh items-center justify-center bg-slate-50 px-4 py-12">
          <section className="max-w-md text-center" aria-labelledby="global-error-title">
            <AlertTriangle
              className="mx-auto mb-5 size-16 rounded-2xl bg-red-100 p-4 text-red-600"
              aria-hidden="true"
            />
            <p className="text-sm font-semibold uppercase tracking-wide text-red-600">
              500
            </p>
            <h1 id="global-error-title" className="mt-2 text-3xl font-bold text-slate-950">
              ShopVN đang gặp sự cố
            </h1>
            <p className="mt-3 text-sm leading-6 text-slate-500">
              Hệ thống chưa thể hoàn tất yêu cầu hiện tại. Bạn có thể thử lại
              mà không cần rời khỏi trang.
            </p>
            <button
              type="button"
              onClick={reset}
              className="mt-6 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Thử lại
            </button>
          </section>
        </main>
      </body>
    </html>
  );
}
