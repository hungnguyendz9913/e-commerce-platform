import { CheckCircle2, Circle, Clock3, PackageCheck, Truck } from "lucide-react";
import type { CustomerOrderStatus, CustomerPaymentStatus } from "@/lib/customer/types";

type Tone = "blue" | "green" | "amber" | "red" | "slate";

const toneClasses: Record<Tone, string> = {
  blue: "bg-blue-50 text-blue-700 ring-blue-200",
  green: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  amber: "bg-amber-50 text-amber-700 ring-amber-200",
  red: "bg-red-50 text-red-700 ring-red-200",
  slate: "bg-slate-100 text-slate-700 ring-slate-200",
};

export const orderStatusLabels: Record<CustomerOrderStatus, { label: string; tone: Tone }> = {
  PENDING: { label: "Chờ xác nhận", tone: "amber" },
  PROCESSING: { label: "Đang xử lý", tone: "blue" },
  SHIPPED: { label: "Đang giao", tone: "blue" },
  DELIVERED: { label: "Đã giao", tone: "green" },
  CANCELED: { label: "Đã hủy", tone: "red" },
  REFUNDED: { label: "Đã hoàn tiền", tone: "slate" },
};

export const paymentStatusLabels: Record<CustomerPaymentStatus, { label: string; tone: Tone }> = {
  PENDING: { label: "Chờ thanh toán", tone: "amber" },
  SUCCEEDED: { label: "Đã thanh toán", tone: "green" },
  FAILED: { label: "Thanh toán lỗi", tone: "red" },
  CANCELED: { label: "Đã hủy", tone: "red" },
  REFUNDED: { label: "Đã hoàn tiền", tone: "slate" },
};

export function isCancelableOrderStatus(status: string) {
  return status === "PENDING" || status === "PROCESSING";
}

export function OrderStatusBadge({ status }: { status: string }) {
  const presentation = orderStatusLabels[status as CustomerOrderStatus] ?? {
    label: status || "Không rõ",
    tone: "slate" as const,
  };

  return <StatusBadge label={presentation.label} tone={presentation.tone} />;
}

export function PaymentStatusBadge({ status }: { status: string }) {
  const presentation = paymentStatusLabels[status as CustomerPaymentStatus] ?? {
    label: status || "Không rõ",
    tone: "slate" as const,
  };

  return <StatusBadge label={presentation.label} tone={presentation.tone} />;
}

function StatusBadge({ label, tone }: { label: string; tone: Tone }) {
  return (
    <span
      className={`inline-flex min-h-7 items-center rounded-full px-3 py-1 text-xs font-bold ring-1 ${toneClasses[tone]}`}
    >
      {label}
    </span>
  );
}

const timelineSteps = [
  { status: "PENDING", label: "Đặt hàng", icon: Clock3 },
  { status: "PROCESSING", label: "Xử lý", icon: PackageCheck },
  { status: "SHIPPED", label: "Giao hàng", icon: Truck },
  { status: "DELIVERED", label: "Hoàn tất", icon: CheckCircle2 },
] as const;

export function OrderTimeline({ status }: { status: string }) {
  if (status === "CANCELED" || status === "REFUNDED") {
    return (
      <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm font-medium text-slate-600">
        Đơn hàng đã ở trạng thái kết thúc. Tiến trình giao hàng không còn hoạt động.
      </div>
    );
  }

  const activeIndex = Math.max(
    0,
    timelineSteps.findIndex((step) => step.status === status),
  );

  return (
    <ol className="grid gap-3 sm:grid-cols-4" aria-label="Tiến trình đơn hàng">
      {timelineSteps.map((step, index) => {
        const complete = index <= activeIndex;
        const Icon = complete ? step.icon : Circle;

        return (
          <li
            key={step.status}
            className={`rounded-lg border p-3 ${
              complete
                ? "border-blue-200 bg-blue-50 text-blue-700"
                : "border-slate-200 bg-white text-slate-400"
            }`}
          >
            <Icon className="size-5" />
            <p className="mt-2 text-sm font-bold">{step.label}</p>
          </li>
        );
      })}
    </ol>
  );
}

