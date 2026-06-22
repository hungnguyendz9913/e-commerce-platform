import Link from "next/link";
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  RotateCcw,
  XCircle,
} from "lucide-react";
import { paymentResultFromSearchParams } from "@/lib/commerce/payment-result";
import type { PaymentResultStatus } from "@/lib/commerce/types";

type PaymentResultPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export const metadata = {
  title: "Kết quả thanh toán | ShopVN",
};

const statusIcon: Record<PaymentResultStatus, typeof CheckCircle2> = {
  success: CheckCircle2,
  failed: XCircle,
  canceled: AlertTriangle,
  pending: Clock3,
};

const statusClass: Record<PaymentResultStatus, string> = {
  success: "bg-emerald-50 text-emerald-700",
  failed: "bg-red-50 text-red-700",
  canceled: "bg-amber-50 text-amber-700",
  pending: "bg-blue-50 text-blue-700",
};

export default async function PaymentResultPage({
  searchParams,
}: PaymentResultPageProps) {
  const params = await searchParams;
  const result = paymentResultFromSearchParams(params);
  const Icon = statusIcon[result.status];

  return (
    <main className="mx-auto grid min-h-[520px] max-w-[760px] place-items-center px-4 py-10 sm:px-6">
      <section className="w-full rounded-xl border border-slate-200 bg-white p-6 text-center shadow-sm sm:p-8">
        <div
          className={`mx-auto grid size-16 place-items-center rounded-full ${statusClass[result.status]}`}
        >
          <Icon className="size-8" aria-hidden="true" />
        </div>
        <h1 className="mt-5 text-2xl font-bold text-slate-950">
          {result.title}
        </h1>
        <p className="mx-auto mt-3 max-w-[560px] text-sm leading-6 text-slate-600">
          {result.message}
        </p>

        {result.orderReference || result.paymentProvider ? (
          <dl className="mx-auto mt-6 grid max-w-[460px] gap-3 rounded-lg bg-slate-50 p-4 text-left text-sm">
            {result.orderReference ? (
              <div className="flex items-center justify-between gap-4">
                <dt className="text-slate-500">Mã đơn</dt>
                <dd className="font-semibold text-slate-900">
                  {result.orderReference}
                </dd>
              </div>
            ) : null}
            {result.paymentProvider ? (
              <div className="flex items-center justify-between gap-4">
                <dt className="text-slate-500">Thanh toán</dt>
                <dd className="font-semibold text-slate-900">
                  {result.paymentProvider}
                </dd>
              </div>
            ) : null}
          </dl>
        ) : null}

        <div className="mt-7 flex flex-wrap justify-center gap-3">
          {result.status === "success" ? (
            <Link
              href="/products"
              className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Tiếp tục mua sắm
            </Link>
          ) : (
            <>
              <Link
                href={result.retryHref}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <RotateCcw className="size-4" />
                Thử lại
              </Link>
              <Link
                href="/cart"
                className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Về giỏ hàng
              </Link>
            </>
          )}
        </div>
      </section>
    </main>
  );
}
