"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { RotateCcw } from "lucide-react";
import { AccountError, AccountLoading, ConfirmDialog } from "./account-states";
import {
  isCancelableOrderStatus,
  OrderStatusBadge,
  OrderTimeline,
  PaymentStatusBadge,
} from "./status";
import {
  cancelCustomerOrder,
  getCustomerOrderDetail,
} from "@/lib/customer/account";
import {
  formatCustomerAmount,
  formatCustomerDate,
} from "@/lib/customer/normalizers";
import type { CustomerOrderDetail } from "@/lib/customer/types";

export default function OrderDetailClient({ orderId }: { orderId: string }) {
  const [order, setOrder] = useState<CustomerOrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [canceling, setCanceling] = useState(false);
  const [showCancel, setShowCancel] = useState(false);
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  const loadOrder = async () => {
    setLoading(true);
    setError("");

    try {
      setOrder(await getCustomerOrderDetail(orderId));
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Không thể tải chi tiết đơn hàng.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadOrder();
  }, [orderId]);

  const cancelOrder = async () => {
    setCanceling(true);
    setError("");

    try {
      await cancelCustomerOrder(orderId, { reason: reason.trim() || undefined });
      setShowCancel(false);
      setReason("");
      setOrder(await getCustomerOrderDetail(orderId));
    } catch (cancelError) {
      setError(
        cancelError instanceof Error ? cancelError.message : "Không thể hủy đơn hàng.",
      );
    } finally {
      setCanceling(false);
    }
  };

  if (loading) {
    return <AccountLoading label="Đang tải chi tiết đơn hàng..." />;
  }

  if (error && !order) {
    return <AccountError message={error} onRetry={loadOrder} />;
  }

  if (!order) {
    return <AccountError message="Không tìm thấy đơn hàng hoặc bạn không có quyền truy cập." />;
  }

  const canCancel = isCancelableOrderStatus(order.status);

  return (
    <div className="space-y-6">
      {error ? <AccountError message={error} onRetry={loadOrder} /> : null}

      <section className="rounded-lg border border-slate-200 bg-white p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-slate-500">Mã đơn hàng</p>
            <h2 className="mt-1 text-2xl font-bold text-slate-950">{order.orderNumber}</h2>
            <p className="mt-1 text-sm text-slate-500">{formatCustomerDate(order.createdAt)}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <OrderStatusBadge status={order.status} />
            <PaymentStatusBadge status={order.paymentStatus} />
          </div>
        </div>

        {canCancel ? (
          <button
            type="button"
            onClick={() => setShowCancel(true)}
            className="mt-5 inline-flex min-h-10 items-center gap-2 rounded-lg border border-red-200 px-4 py-2 text-sm font-bold text-red-700 transition hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <RotateCcw className="size-4" />
            Hủy đơn hàng
          </button>
        ) : null}
      </section>

      <section>
        <h2 className="mb-3 text-lg font-bold text-slate-950">Tiến trình</h2>
        <OrderTimeline status={order.status} />
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-5">
        <h2 className="text-lg font-bold text-slate-950">Sản phẩm</h2>
        <div className="mt-4 divide-y divide-slate-100">
          {order.items.map((item) => (
            <div
              key={item.id}
              className="grid gap-3 py-4 sm:grid-cols-[minmax(0,1fr)_auto]"
            >
              <div className="min-w-0">
                <p className="font-bold text-slate-900">{item.productName}</p>
                <p className="mt-1 text-sm text-slate-500">
                  {item.sku ? `SKU: ${item.sku} · ` : ""}Số lượng: {item.quantity}
                </p>
              </div>
              <div className="text-left sm:text-right">
                <p className="text-sm text-slate-500">{formatCustomerAmount(item.unitPrice)}</p>
                <p className="font-bold text-slate-950">
                  {formatCustomerAmount(item.totalPrice)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <section className="rounded-lg border border-slate-200 bg-white p-5">
          <h2 className="text-lg font-bold text-slate-950">Giao hàng</h2>
          <dl className="mt-4 grid gap-3 text-sm">
            <InfoRow label="Người nhận" value={order.recipientName} />
            <InfoRow label="Điện thoại" value={order.recipientPhone} />
            <InfoRow label="Địa chỉ" value={order.shippingAddress} />
          </dl>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-5">
          <h2 className="text-lg font-bold text-slate-950">Thanh toán</h2>
          <dl className="mt-4 grid gap-3 text-sm">
            <InfoRow label="Tạm tính" value={formatCustomerAmount(order.subtotalAmount)} />
            <InfoRow label="Giảm giá" value={formatCustomerAmount(order.discountAmount)} />
            <InfoRow label="Phí giao hàng" value={formatCustomerAmount(order.shippingFee)} />
            <InfoRow label="Thuế" value={formatCustomerAmount(order.taxAmount)} />
            <div className="flex justify-between border-t border-slate-100 pt-3 text-base font-bold text-slate-950">
              <dt>Tổng cộng</dt>
              <dd>{formatCustomerAmount(order.totalAmount)}</dd>
            </div>
          </dl>
        </section>
      </div>

      <Link
        href="/customer/orders"
        className="inline-flex rounded-lg border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        Quay lại đơn hàng
      </Link>

      {showCancel ? (
        <ConfirmDialog
          title="Hủy đơn hàng?"
          description="Đơn hàng sẽ được hủy sau khi backend xác nhận. Kho hàng sẽ được khôi phục theo hợp đồng hiện tại."
          confirmLabel="Hủy đơn"
          busy={canceling}
          onCancel={() => setShowCancel(false)}
          onConfirm={cancelOrder}
        >
          <label className="grid gap-2">
            <span className="text-sm font-bold text-slate-700">Lý do hủy</span>
            <input
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder="Lý do hủy (không bắt buộc)"
              className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
          </label>
        </ConfirmDialog>
      ) : null}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-slate-500">{label}</dt>
      <dd className="text-right font-semibold text-slate-900">{value || "Chưa có"}</dd>
    </div>
  );
}
