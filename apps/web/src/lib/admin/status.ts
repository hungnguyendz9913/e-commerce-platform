export type AdminStatusTone = "slate" | "blue" | "green" | "amber" | "red" | "purple";

export type AdminStatusPresentation = {
  label: string;
  tone: AdminStatusTone;
};

const UNKNOWN: AdminStatusPresentation = { label: "Không rõ", tone: "slate" };

function presentation(
  value: string | undefined,
  map: Record<string, AdminStatusPresentation>,
) {
  if (!value) {
    return UNKNOWN;
  }

  return map[value.toUpperCase()] ?? { label: value, tone: "slate" };
}

export const productStatusMap: Record<string, AdminStatusPresentation> = {
  ACTIVE: { label: "Đang bán", tone: "green" },
  INACTIVE: { label: "Tạm ẩn", tone: "amber" },
  ARCHIVED: { label: "Lưu trữ", tone: "slate" },
};

export const approvalStatusMap: Record<string, AdminStatusPresentation> = {
  PENDING: { label: "Chờ duyệt", tone: "amber" },
  APPROVED: { label: "Đã duyệt", tone: "green" },
  REJECTED: { label: "Từ chối", tone: "red" },
};

export const inventoryMovementStatusMap: Record<string, AdminStatusPresentation> = {
  IMPORT: { label: "Nhập kho", tone: "green" },
  ADJUSTMENT: { label: "Điều chỉnh", tone: "blue" },
  SALE: { label: "Bán hàng", tone: "purple" },
  CANCELLATION: { label: "Hoàn kho", tone: "amber" },
};

export const orderStatusMap: Record<string, AdminStatusPresentation> = {
  PENDING: { label: "Chờ xử lý", tone: "amber" },
  PROCESSING: { label: "Đang xử lý", tone: "blue" },
  SHIPPED: { label: "Đang giao", tone: "purple" },
  DELIVERED: { label: "Đã giao", tone: "green" },
  CANCELED: { label: "Đã hủy", tone: "red" },
  REFUNDED: { label: "Hoàn tiền", tone: "slate" },
};

export const paymentStatusMap: Record<string, AdminStatusPresentation> = {
  PENDING: { label: "Chờ thanh toán", tone: "amber" },
  SUCCEEDED: { label: "Thành công", tone: "green" },
  PAID: { label: "Đã thanh toán", tone: "green" },
  FAILED: { label: "Thất bại", tone: "red" },
  CANCELED: { label: "Đã hủy", tone: "slate" },
  REFUNDED: { label: "Hoàn tiền", tone: "blue" },
};

export const voucherStatusMap: Record<string, AdminStatusPresentation> = {
  ACTIVE: { label: "Đang hoạt động", tone: "green" },
  INACTIVE: { label: "Ngưng hoạt động", tone: "slate" },
  EXPIRED: { label: "Hết hạn", tone: "red" },
  SCHEDULED: { label: "Sắp diễn ra", tone: "blue" },
};

export const userStatusMap: Record<string, AdminStatusPresentation> = {
  ACTIVE: { label: "Hoạt động", tone: "green" },
  INACTIVE: { label: "Tạm khóa", tone: "amber" },
  BLOCKED: { label: "Bị khóa", tone: "red" },
};

export const webhookStatusMap: Record<string, AdminStatusPresentation> = {
  RECEIVED: { label: "Đã nhận", tone: "blue" },
  PROCESSED: { label: "Đã xử lý", tone: "green" },
  FAILED: { label: "Lỗi", tone: "red" },
  IGNORED: { label: "Bỏ qua", tone: "slate" },
};

export const auditStatusMap: Record<string, AdminStatusPresentation> = {
  CREATE: { label: "Tạo mới", tone: "green" },
  UPDATE: { label: "Cập nhật", tone: "blue" },
  DELETE: { label: "Xóa", tone: "red" },
  ARCHIVE: { label: "Lưu trữ", tone: "slate" },
};

export const adminStatus = {
  product: (value?: string) => presentation(value, productStatusMap),
  approval: (value?: string) => presentation(value, approvalStatusMap),
  inventoryMovement: (value?: string) => presentation(value, inventoryMovementStatusMap),
  order: (value?: string) => presentation(value, orderStatusMap),
  payment: (value?: string) => presentation(value, paymentStatusMap),
  voucher: (value?: string) => presentation(value, voucherStatusMap),
  user: (value?: string) => presentation(value, userStatusMap),
  webhook: (value?: string) => presentation(value, webhookStatusMap),
  audit: (value?: string) => presentation(value, auditStatusMap),
};
