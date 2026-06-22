import type { PaymentResultStatus, PaymentResultView } from "./types";

const statusAliases: Record<string, PaymentResultStatus> = {
  success: "success",
  succeeded: "success",
  paid: "success",
  completed: "success",
  failed: "failed",
  failure: "failed",
  error: "failed",
  canceled: "canceled",
  cancelled: "canceled",
  cancel: "canceled",
  pending: "pending",
  processing: "pending",
};

export function normalizePaymentStatus(value: string | null | undefined) {
  const normalized = value?.trim().toLowerCase();
  return normalized ? statusAliases[normalized] ?? "pending" : "pending";
}

export function paymentResultFromSearchParams(params: {
  status?: string | string[] | null;
  orderId?: string | string[] | null;
  orderNumber?: string | string[] | null;
  paymentProvider?: string | string[] | null;
  provider?: string | string[] | null;
}): PaymentResultView {
  const first = (value?: string | string[] | null) =>
    Array.isArray(value) ? value[0] : value ?? undefined;
  const status = normalizePaymentStatus(first(params.status));
  const orderReference = first(params.orderNumber) ?? first(params.orderId);
  const paymentProvider = first(params.paymentProvider) ?? first(params.provider);
  const copy: Record<PaymentResultStatus, Pick<PaymentResultView, "title" | "message">> = {
    success: {
      title: "Đặt hàng thành công",
      message: "ShopVN đã ghi nhận đơn hàng của bạn.",
    },
    failed: {
      title: "Thanh toán thất bại",
      message: "Khoản thanh toán chưa hoàn tất. Bạn có thể quay lại checkout để thử lại.",
    },
    canceled: {
      title: "Thanh toán đã hủy",
      message: "Giao dịch đã bị hủy. Giỏ hàng hoặc checkout có thể cần được kiểm tra lại.",
    },
    pending: {
      title: "Đang chờ xác nhận thanh toán",
      message:
        "ShopVN chưa có endpoint trạng thái thanh toán trực tiếp, nên trang này chỉ hiển thị trạng thái từ dữ liệu callback hoặc checkout hiện có.",
    },
  };

  return {
    status,
    ...copy[status],
    orderReference,
    paymentProvider,
    retryHref: status === "success" ? "/products" : "/checkout",
  };
}
