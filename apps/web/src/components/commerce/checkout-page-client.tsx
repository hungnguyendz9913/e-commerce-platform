"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, CreditCard, Loader2, PackageOpen, Ticket } from "lucide-react";
import { getCart } from "@/lib/commerce/cart";
import {
  applyVoucher,
  createOrder,
  validateCheckout,
} from "@/lib/commerce/checkout";
import { formatVnd } from "@/lib/commerce/normalizers";
import type {
  CartView,
  CheckoutPaymentProvider,
  CheckoutSummary,
  DeliveryForm,
} from "@/lib/commerce/types";
import { CHECKOUT_PAYMENT_PROVIDERS } from "@/lib/commerce/types";

const PAYMENT_LABELS: Record<CheckoutPaymentProvider, string> = {
  COD: "Thanh toán khi nhận hàng",
  MOMO: "Ví MoMo",
  VNPAY: "VNPay",
};

const initialDelivery: DeliveryForm = {
  recipientName: "",
  recipientPhone: "",
  addressLine: "",
  ward: "",
  district: "",
  city: "",
  country: "Việt Nam",
};

export default function CheckoutPageClient() {
  const router = useRouter();
  const [cart, setCart] = useState<CartView | null>(null);
  const [summary, setSummary] = useState<CheckoutSummary | null>(null);
  const [delivery, setDelivery] = useState<DeliveryForm>(initialDelivery);
  const [paymentProvider, setPaymentProvider] =
    useState<CheckoutPaymentProvider>("COD");
  const [voucherCode, setVoucherCode] = useState("");
  const [appliedVoucher, setAppliedVoucher] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loadingCart, setLoadingCart] = useState(true);
  const [validating, setValidating] = useState(false);
  const [applyingVoucher, setApplyingVoucher] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loadCart = async () => {
      setLoadingCart(true);

      try {
        setCart(await getCart());
      } catch (error) {
        setFormError(
          error instanceof Error
            ? error.message
            : "Không thể tải giỏ hàng thanh toán.",
        );
      } finally {
        setLoadingCart(false);
      }
    };

    void loadCart();
  }, []);

  const displayTotals = useMemo(
    () =>
      summary
        ? {
            subtotal: summary.subtotal,
            discount: summary.discount,
            shippingFee: summary.shippingFee,
            total: summary.total,
          }
        : cart?.totals,
    [cart?.totals, summary],
  );

  const updateDelivery = (field: keyof DeliveryForm, value: string) => {
    setDelivery((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: "" }));
    setFormError("");
    setSuccessMessage("");
  };

  const validateFields = () => {
    const nextErrors: Record<string, string> = {};

    if (!delivery.recipientName.trim()) {
      nextErrors.recipientName = "Nhập tên người nhận.";
    }

    if (!delivery.recipientPhone.trim()) {
      nextErrors.recipientPhone = "Nhập số điện thoại.";
    }

    if (!delivery.addressLine.trim()) {
      nextErrors.addressLine = "Nhập địa chỉ nhận hàng.";
    }

    if (!delivery.district.trim()) {
      nextErrors.district = "Nhập quận/huyện.";
    }

    if (!delivery.city.trim()) {
      nextErrors.city = "Nhập tỉnh/thành phố.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleValidate = async () => {
    if (!validateFields()) {
      return null;
    }

    setValidating(true);
    setFormError("");
    setSuccessMessage("");

    try {
      const nextSummary = await validateCheckout(
        delivery,
        paymentProvider,
        appliedVoucher,
      );
      setSummary(nextSummary);
      setSuccessMessage("Thông tin đơn hàng đã được kiểm tra.");
      return nextSummary;
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : "Không thể kiểm tra đơn hàng. Vui lòng thử lại.",
      );
      return null;
    } finally {
      setValidating(false);
    }
  };

  const handleVoucher = async () => {
    if (!voucherCode.trim()) {
      setErrors((current) => ({ ...current, voucherCode: "Nhập mã ưu đãi." }));
      return;
    }

    if (!validateFields()) {
      return;
    }

    setApplyingVoucher(true);
    setFormError("");
    setSuccessMessage("");
    setErrors((current) => ({ ...current, voucherCode: "" }));

    try {
      const nextSummary = await applyVoucher(delivery, voucherCode);
      setSummary(nextSummary);
      setAppliedVoucher(nextSummary.voucherCode || voucherCode.trim());
      setSuccessMessage("Mã ưu đãi đã được áp dụng.");
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : "Mã ưu đãi không thể áp dụng.",
      );
    } finally {
      setApplyingVoucher(false);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!cart || cart.isEmpty) {
      setFormError("Giỏ hàng đang trống.");
      return;
    }

    const validSummary = summary ?? (await handleValidate());

    if (!validSummary) {
      return;
    }

    setSubmitting(true);
    setFormError("");
    setSuccessMessage("");

    try {
      const result = await createOrder(delivery, paymentProvider, appliedVoucher);

      if (result.paymentUrl) {
        window.location.href = result.paymentUrl;
        return;
      }

      const params = new URLSearchParams({
        status: paymentProvider === "COD" ? "success" : "pending",
        paymentProvider: result.paymentProvider,
      });

      if (result.orderNumber) {
        params.set("orderNumber", result.orderNumber);
      } else if (result.orderId) {
        params.set("orderId", result.orderId);
      }

      router.push(`/payment-result?${params.toString()}`);
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : "Không thể tạo đơn hàng. Giỏ hàng của bạn vẫn được giữ nguyên.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingCart) {
    return (
      <main className="mx-auto flex min-h-[420px] max-w-[1180px] items-center justify-center px-4 py-10 sm:px-6">
        <Loader2 className="mr-2 size-5 animate-spin text-blue-600" />
        <span className="text-sm font-medium text-slate-600">Đang tải checkout...</span>
      </main>
    );
  }

  if (!cart || cart.isEmpty) {
    return (
      <main className="mx-auto max-w-[900px] px-4 py-10 text-center sm:px-6">
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8">
          <PackageOpen className="mx-auto size-12 text-slate-400" />
          <h1 className="mt-4 text-xl font-bold text-slate-950">
            Chưa có sản phẩm để thanh toán
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Thêm sản phẩm vào giỏ hàng trước khi tạo đơn.
          </p>
          <Link
            href="/products"
            className="mt-5 inline-flex rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Xem sản phẩm
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-[1180px] px-4 py-8 sm:px-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-950">Thanh toán</h1>
        <p className="mt-1 text-sm text-slate-500">
          Nhập thông tin giao hàng và chọn phương thức thanh toán.
        </p>
      </div>

      <form
        className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]"
        onSubmit={handleSubmit}
        noValidate
      >
        <div className="space-y-6">
          <section className="rounded-xl border border-slate-200 bg-white p-5">
            <h2 className="text-base font-bold text-slate-950">
              Thông tin giao hàng
            </h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field
                label="Người nhận"
                value={delivery.recipientName}
                error={errors.recipientName}
                onChange={(value) => updateDelivery("recipientName", value)}
              />
              <Field
                label="Số điện thoại"
                value={delivery.recipientPhone}
                error={errors.recipientPhone}
                onChange={(value) => updateDelivery("recipientPhone", value)}
              />
              <Field
                label="Địa chỉ"
                value={delivery.addressLine}
                error={errors.addressLine}
                onChange={(value) => updateDelivery("addressLine", value)}
                className="sm:col-span-2"
              />
              <Field
                label="Phường/xã"
                value={delivery.ward}
                error={errors.ward}
                onChange={(value) => updateDelivery("ward", value)}
              />
              <Field
                label="Quận/huyện"
                value={delivery.district}
                error={errors.district}
                onChange={(value) => updateDelivery("district", value)}
              />
              <Field
                label="Tỉnh/thành phố"
                value={delivery.city}
                error={errors.city}
                onChange={(value) => updateDelivery("city", value)}
              />
              <Field
                label="Quốc gia"
                value={delivery.country}
                error={errors.country}
                onChange={(value) => updateDelivery("country", value)}
              />
            </div>
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-5">
            <h2 className="text-base font-bold text-slate-950">
              Phương thức thanh toán
            </h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {CHECKOUT_PAYMENT_PROVIDERS.map((provider) => (
                <label
                  key={provider}
                  className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 text-sm transition ${
                    paymentProvider === provider
                      ? "border-blue-500 bg-blue-50"
                      : "border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentProvider"
                    value={provider}
                    checked={paymentProvider === provider}
                    onChange={() => {
                      setPaymentProvider(provider);
                      setSummary(null);
                      setSuccessMessage("");
                    }}
                    className="mt-1 text-blue-600 focus:ring-blue-500"
                  />
                  <span>
                    <span className="block font-semibold text-slate-900">
                      {provider}
                    </span>
                    <span className="text-slate-500">{PAYMENT_LABELS[provider]}</span>
                  </span>
                </label>
              ))}
            </div>
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-5">
            <h2 className="text-base font-bold text-slate-950">Giỏ hàng</h2>
            <div className="mt-4 divide-y divide-slate-100">
              {cart.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-4 py-3 text-sm"
                >
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-slate-900">
                      {item.product.name}
                    </p>
                    <p className="text-slate-500">Số lượng: {item.quantity}</p>
                  </div>
                  <span className="shrink-0 font-semibold text-slate-900">
                    {formatVnd(item.totalPrice)}
                  </span>
                </div>
              ))}
            </div>
          </section>
        </div>

        <aside className="h-fit rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="text-base font-bold text-slate-950">Tóm tắt</h2>

          {formError ? (
            <div className="mt-4 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              <AlertCircle className="mt-0.5 size-4 shrink-0" />
              <p>{formError}</p>
            </div>
          ) : null}

          {successMessage ? (
            <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm font-medium text-emerald-700">
              {successMessage}
            </div>
          ) : null}

          <div className="mt-4 flex gap-2">
            <div className="min-w-0 flex-1">
              <label className="sr-only" htmlFor="voucher-code">
                Mã ưu đãi
              </label>
              <input
                id="voucher-code"
                value={voucherCode}
                onChange={(event) => {
                  setVoucherCode(event.target.value);
                  setErrors((current) => ({ ...current, voucherCode: "" }));
                }}
                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                placeholder="Mã ưu đãi"
              />
              {errors.voucherCode ? (
                <p className="mt-1 text-xs text-red-600">{errors.voucherCode}</p>
              ) : null}
            </div>
            <button
              type="button"
              disabled={applyingVoucher}
              onClick={handleVoucher}
              className="inline-flex size-11 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:text-slate-300"
              aria-label="Áp dụng mã ưu đãi"
            >
              {applyingVoucher ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Ticket className="size-4" />
              )}
            </button>
          </div>

          <dl className="mt-5 space-y-3 text-sm">
            <SummaryRow label="Tạm tính" value={displayTotals?.subtotal ?? 0} />
            <SummaryRow label="Giảm giá" value={-(displayTotals?.discount ?? 0)} />
            <SummaryRow label="Phí vận chuyển" value={displayTotals?.shippingFee ?? 0} />
            <div className="border-t border-slate-200 pt-3">
              <SummaryRow label="Tổng cộng" value={displayTotals?.total ?? 0} strong />
            </div>
          </dl>

          <button
            type="button"
            disabled={validating}
            onClick={handleValidate}
            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:text-slate-300"
          >
            {validating ? <Loader2 className="size-4 animate-spin" /> : null}
            Kiểm tra đơn hàng
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-400"
          >
            {submitting ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <CreditCard className="size-4" />
            )}
            Đặt hàng
          </button>
        </aside>
      </form>
    </main>
  );
}

function Field({
  label,
  value,
  error,
  className = "",
  onChange,
}: {
  label: string;
  value: string;
  error?: string;
  className?: string;
  onChange: (value: string) => void;
}) {
  const id = `checkout-${label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;

  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1 block text-sm font-medium text-slate-700">
        {label}
      </label>
      <input
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={`w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition focus:ring-2 ${
          error
            ? "border-red-400 focus:ring-red-200"
            : "border-slate-200 focus:border-blue-500 focus:ring-blue-200"
        }`}
      />
      {error ? <p className="mt-1 text-xs text-red-600">{error}</p> : null}
    </div>
  );
}

function SummaryRow({
  label,
  value,
  strong = false,
}: {
  label: string;
  value: number;
  strong?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between gap-3 ${
        strong ? "text-base font-bold text-slate-950" : "text-slate-600"
      }`}
    >
      <dt>{label}</dt>
      <dd>{formatVnd(value)}</dd>
    </div>
  );
}
