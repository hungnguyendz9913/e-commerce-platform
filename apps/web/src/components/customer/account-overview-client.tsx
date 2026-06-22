"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import { MapPin, Package, UserRound } from "lucide-react";
import { AccountEmpty, AccountError, AccountLoading } from "./account-states";
import { OrderStatusBadge, PaymentStatusBadge } from "./status";
import {
  compactAddress,
  formatCustomerAmount,
  formatCustomerDate,
} from "@/lib/customer/normalizers";
import {
  getCustomerAddresses,
  getCustomerOrders,
  getCustomerProfile,
} from "@/lib/customer/account";
import type {
  CustomerAddress,
  CustomerOrderSummary,
  CustomerProfile,
} from "@/lib/customer/types";

type OverviewState = {
  profile: CustomerProfile;
  addresses: CustomerAddress[];
  orders: CustomerOrderSummary[];
};

export default function AccountOverviewClient() {
  const [state, setState] = useState<OverviewState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadOverview = async () => {
    setLoading(true);
    setError("");

    try {
      const [profile, addresses, orders] = await Promise.all([
        getCustomerProfile(),
        getCustomerAddresses(),
        getCustomerOrders({ limit: 3 }),
      ]);
      setState({ profile, addresses, orders: orders.orders });
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Không thể tải thông tin tài khoản.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadOverview();
  }, []);

  if (loading) {
    return <AccountLoading label="Đang tải tổng quan tài khoản..." />;
  }

  if (error || !state) {
    return <AccountError message={error || "Không thể tải tài khoản."} onRetry={loadOverview} />;
  }

  const defaultAddress = state.addresses.find((address) => address.isDefault);

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-3">
        <SummaryTile
          icon={<UserRound className="size-5" />}
          label="Hồ sơ"
          value={state.profile.fullName}
          detail={state.profile.email}
          href="/customer/profile"
        />
        <SummaryTile
          icon={<MapPin className="size-5" />}
          label="Địa chỉ"
          value={`${state.addresses.length} địa chỉ`}
          detail={defaultAddress ? compactAddress(defaultAddress) : "Chưa có địa chỉ mặc định"}
          href="/customer/addresses"
        />
        <SummaryTile
          icon={<Package className="size-5" />}
          label="Đơn hàng"
          value={`${state.orders.length} gần đây`}
          detail="Theo dõi trạng thái và thanh toán"
          href="/customer/orders"
        />
      </section>

      <section>
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-950">Đơn hàng gần đây</h2>
            <p className="mt-1 text-sm text-slate-500">
              Các đơn mới nhất trong tài khoản của bạn.
            </p>
          </div>
          <Link
            href="/customer/orders"
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Xem tất cả
          </Link>
        </div>

        {state.orders.length ? (
          <div className="divide-y divide-slate-100 overflow-hidden rounded-lg border border-slate-200 bg-white">
            {state.orders.map((order) => (
              <Link
                key={order.id}
                href={`/customer/orders/${order.id}`}
                className="grid gap-3 p-4 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 md:grid-cols-[minmax(0,1fr)_auto]"
              >
                <div className="min-w-0">
                  <p className="font-bold text-slate-950">{order.orderNumber}</p>
                  <p className="mt-1 text-sm text-slate-500">
                    {formatCustomerDate(order.createdAt)}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2 md:justify-end">
                  <OrderStatusBadge status={order.status} />
                  <PaymentStatusBadge status={order.paymentStatus} />
                  <span className="font-bold text-slate-950">
                    {formatCustomerAmount(order.totalAmount)}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <AccountEmpty
            title="Chưa có đơn hàng"
            description="Các đơn hàng sau khi thanh toán sẽ xuất hiện tại đây."
            actionHref="/products"
            actionLabel="Mua sắm ngay"
          />
        )}
      </section>
    </div>
  );
}

function SummaryTile({
  icon,
  label,
  value,
  detail,
  href,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  detail: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="rounded-lg border border-slate-200 bg-white p-4 transition hover:border-blue-200 hover:bg-blue-50/40 focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      <div className="flex items-center gap-2 text-sm font-bold text-blue-700">
        {icon}
        {label}
      </div>
      <p className="mt-3 truncate text-xl font-bold text-slate-950">{value}</p>
      <p className="mt-1 line-clamp-2 text-sm leading-6 text-slate-500">{detail}</p>
    </Link>
  );
}
