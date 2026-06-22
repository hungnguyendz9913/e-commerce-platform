"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Filter, Loader2 } from "lucide-react";
import { AccountEmpty, AccountError, AccountLoading } from "./account-states";
import { OrderStatusBadge, PaymentStatusBadge, orderStatusLabels } from "./status";
import {
  formatCustomerAmount,
  formatCustomerDate,
} from "@/lib/customer/normalizers";
import { getCustomerOrders } from "@/lib/customer/account";
import type {
  CustomerOrderList,
  CustomerOrderStatus,
  CustomerOrderSummary,
} from "@/lib/customer/types";

const filters: Array<{ label: string; value: CustomerOrderStatus | "all" }> = [
  { label: "Tất cả", value: "all" },
  { label: orderStatusLabels.PENDING.label, value: "PENDING" },
  { label: orderStatusLabels.PROCESSING.label, value: "PROCESSING" },
  { label: orderStatusLabels.SHIPPED.label, value: "SHIPPED" },
  { label: orderStatusLabels.DELIVERED.label, value: "DELIVERED" },
  { label: orderStatusLabels.CANCELED.label, value: "CANCELED" },
];

export default function OrdersClient() {
  const [orderList, setOrderList] = useState<CustomerOrderList | null>(null);
  const [status, setStatus] = useState<CustomerOrderStatus | "all">("all");
  const [loading, setLoading] = useState(true);
  const [filtering, setFiltering] = useState(false);
  const [error, setError] = useState("");

  const loadOrders = async (nextStatus = status, background = false) => {
    if (background) {
      setFiltering(true);
    } else {
      setLoading(true);
    }
    setError("");

    try {
      setOrderList(await getCustomerOrders({ status: nextStatus, limit: 20 }));
    } catch (loadError) {
      setError(
        loadError instanceof Error ? loadError.message : "Không thể tải đơn hàng.",
      );
    } finally {
      setLoading(false);
      setFiltering(false);
    }
  };

  useEffect(() => {
    void loadOrders("all");
  }, []);

  const changeStatus = (nextStatus: CustomerOrderStatus | "all") => {
    setStatus(nextStatus);
    void loadOrders(nextStatus, true);
  };

  if (loading) {
    return <AccountLoading label="Đang tải đơn hàng..." />;
  }

  if (error && !orderList) {
    return <AccountError message={error} onRetry={() => loadOrders()} />;
  }

  const orders = orderList?.orders ?? [];

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2 overflow-x-auto pb-1" aria-label="Lọc trạng thái đơn hàng">
        <Filter className="size-4 shrink-0 text-slate-500" />
        {filters.map((filter) => (
          <button
            key={filter.value}
            type="button"
            onClick={() => changeStatus(filter.value)}
            className={`min-h-10 shrink-0 rounded-lg px-3 py-2 text-sm font-bold transition focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              status === filter.value
                ? "bg-blue-600 text-white"
                : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            {filter.label}
          </button>
        ))}
        {filtering ? <Loader2 className="size-4 animate-spin text-blue-600" /> : null}
      </div>

      {error ? <AccountError message={error} onRetry={() => loadOrders(status, true)} /> : null}

      {orders.length ? (
        <div className="grid gap-4">
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      ) : (
        <AccountEmpty
          title="Không có đơn hàng"
          description="Chưa có đơn hàng nào khớp với bộ lọc hiện tại."
          actionHref="/products"
          actionLabel="Tiếp tục mua sắm"
        />
      )}
    </div>
  );
}

function OrderCard({ order }: { order: CustomerOrderSummary }) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="font-bold text-slate-950">{order.orderNumber}</h2>
          <p className="mt-1 text-sm text-slate-500">{formatCustomerDate(order.createdAt)}</p>
          <p className="mt-2 text-sm text-slate-600">
            {order.itemSummary ?? "Chi tiết sản phẩm trong trang đơn hàng"}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <OrderStatusBadge status={order.status} />
          <PaymentStatusBadge status={order.paymentStatus} />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
        <p className="text-lg font-bold text-slate-950">
          {formatCustomerAmount(order.totalAmount)}
        </p>
        <Link
          href={`/customer/orders/${order.id}`}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Xem chi tiết
        </Link>
      </div>
    </article>
  );
}

