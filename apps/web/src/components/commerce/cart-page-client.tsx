"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  Loader2,
  Minus,
  PackageOpen,
  Plus,
  Trash2,
} from "lucide-react";
import {
  clearCart,
  getCart,
  removeCartItem,
  updateCartItemQuantity,
} from "@/lib/commerce/cart";
import { formatVnd } from "@/lib/commerce/normalizers";
import type { CartItemView, CartView } from "@/lib/commerce/types";

type ItemErrors = Record<string, string>;

export default function CartPageClient() {
  const [cart, setCart] = useState<CartView | null>(null);
  const [loading, setLoading] = useState(true);
  const [busyAction, setBusyAction] = useState("");
  const [pageError, setPageError] = useState("");
  const [itemErrors, setItemErrors] = useState<ItemErrors>({});

  const loadCart = async () => {
    setLoading(true);
    setPageError("");

    try {
      setCart(await getCart());
    } catch (error) {
      setPageError(
        error instanceof Error
          ? error.message
          : "Không thể tải giỏ hàng. Vui lòng thử lại.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadCart();
  }, []);

  const updateQuantity = async (item: CartItemView, quantity: number) => {
    if (quantity < 1) {
      return;
    }

    setBusyAction(`quantity:${item.id}`);
    setItemErrors((current) => ({ ...current, [item.id]: "" }));

    try {
      setCart(await updateCartItemQuantity(item.id, quantity));
    } catch (error) {
      setItemErrors((current) => ({
        ...current,
        [item.id]:
          error instanceof Error
            ? error.message
            : "Không thể cập nhật số lượng.",
      }));
    } finally {
      setBusyAction("");
    }
  };

  const removeItem = async (item: CartItemView) => {
    setBusyAction(`remove:${item.id}`);
    setItemErrors((current) => ({ ...current, [item.id]: "" }));

    try {
      setCart(await removeCartItem(item.id));
    } catch (error) {
      setItemErrors((current) => ({
        ...current,
        [item.id]:
          error instanceof Error ? error.message : "Không thể xóa sản phẩm.",
      }));
    } finally {
      setBusyAction("");
    }
  };

  const handleClearCart = async () => {
    if (!cart || cart.isEmpty || !window.confirm("Xóa toàn bộ giỏ hàng?")) {
      return;
    }

    setBusyAction("clear");
    setPageError("");

    try {
      setCart(await clearCart());
    } catch (error) {
      setPageError(
        error instanceof Error ? error.message : "Không thể xóa giỏ hàng.",
      );
    } finally {
      setBusyAction("");
    }
  };

  if (loading) {
    return (
      <main className="mx-auto flex min-h-[420px] max-w-[1180px] items-center justify-center px-4 py-10 sm:px-6">
        <Loader2 className="mr-2 size-5 animate-spin text-blue-600" />
        <span className="text-sm font-medium text-slate-600">Đang tải giỏ hàng...</span>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-[1180px] px-4 py-8 sm:px-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-950">Giỏ hàng</h1>
          <p className="mt-1 text-sm text-slate-500">
            Kiểm tra sản phẩm và số lượng trước khi thanh toán.
          </p>
        </div>
        <Link
          href="/products"
          className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Tiếp tục mua sắm
        </Link>
      </div>

      {pageError ? (
        <div className="mb-5 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <p>{pageError}</p>
        </div>
      ) : null}

      {!cart || cart.isEmpty ? (
        <section className="grid min-h-[360px] place-items-center rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center">
          <div>
            <PackageOpen className="mx-auto size-12 text-slate-400" />
            <h2 className="mt-4 text-lg font-bold text-slate-900">
              Giỏ hàng đang trống
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Chọn sản phẩm yêu thích và thêm vào giỏ để bắt đầu.
            </p>
            <Link
              href="/products"
              className="mt-5 inline-flex rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Xem sản phẩm
            </Link>
          </div>
        </section>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            <div className="divide-y divide-slate-100">
              {cart.items.map((item) => {
                const quantityBusy = busyAction === `quantity:${item.id}`;
                const removeBusy = busyAction === `remove:${item.id}`;

                return (
                  <article
                    key={item.id}
                    className="grid gap-4 p-4 sm:grid-cols-[88px_minmax(0,1fr)_auto]"
                  >
                    <div className="size-22 overflow-hidden rounded-lg bg-slate-100">
                      {item.product.imageUrl ? (
                        <img
                          src={item.product.imageUrl}
                          alt={item.product.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="grid h-full w-full place-items-center text-slate-400">
                          <PackageOpen className="size-7" />
                        </div>
                      )}
                    </div>

                    <div className="min-w-0">
                      <h2 className="truncate text-sm font-bold text-slate-900">
                        {item.product.name}
                      </h2>
                      {item.product.sku ? (
                        <p className="mt-1 text-xs text-slate-500">
                          SKU: {item.product.sku}
                        </p>
                      ) : null}
                      <p className="mt-2 font-semibold text-blue-600">
                        {formatVnd(item.unitPrice)}
                      </p>
                      {itemErrors[item.id] ? (
                        <p className="mt-2 text-xs font-medium text-red-600">
                          {itemErrors[item.id]}
                        </p>
                      ) : null}
                    </div>

                    <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end">
                      <div className="flex h-10 items-center rounded-lg border border-slate-200">
                        <button
                          type="button"
                          disabled={quantityBusy || item.quantity <= 1}
                          onClick={() => updateQuantity(item, item.quantity - 1)}
                          className="grid size-9 place-items-center text-slate-600 hover:bg-slate-50 disabled:text-slate-300"
                          aria-label="Giảm số lượng"
                        >
                          <Minus className="size-4" />
                        </button>
                        <span className="w-10 text-center text-sm font-bold">
                          {quantityBusy ? (
                            <Loader2 className="mx-auto size-4 animate-spin" />
                          ) : (
                            item.quantity
                          )}
                        </span>
                        <button
                          type="button"
                          disabled={quantityBusy}
                          onClick={() => updateQuantity(item, item.quantity + 1)}
                          className="grid size-9 place-items-center text-slate-600 hover:bg-slate-50 disabled:text-slate-300"
                          aria-label="Tăng số lượng"
                        >
                          <Plus className="size-4" />
                        </button>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-slate-900">
                          {formatVnd(item.totalPrice)}
                        </span>
                        <button
                          type="button"
                          disabled={removeBusy}
                          onClick={() => removeItem(item)}
                          className="grid size-9 place-items-center rounded-lg text-red-600 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:text-red-300"
                          aria-label="Xóa sản phẩm"
                        >
                          {removeBusy ? (
                            <Loader2 className="size-4 animate-spin" />
                          ) : (
                            <Trash2 className="size-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>

          <aside className="h-fit rounded-xl border border-slate-200 bg-white p-5">
            <h2 className="text-base font-bold text-slate-950">Tóm tắt đơn hàng</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <SummaryRow label="Tạm tính" value={cart.totals.subtotal} />
              <SummaryRow label="Giảm giá" value={-cart.totals.discount} />
              <SummaryRow label="Phí vận chuyển" value={cart.totals.shippingFee} />
              <div className="border-t border-slate-200 pt-3">
                <SummaryRow label="Tổng cộng" value={cart.totals.total} strong />
              </div>
            </dl>
            <Link
              href="/checkout"
              className="mt-5 inline-flex w-full justify-center rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Thanh toán
            </Link>
            <button
              type="button"
              disabled={busyAction === "clear"}
              onClick={handleClearCart}
              className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:text-red-300"
            >
              {busyAction === "clear" ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Trash2 className="size-4" />
              )}
              Xóa giỏ hàng
            </button>
          </aside>
        </div>
      )}
    </main>
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
