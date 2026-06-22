import { asNumber, asRecord, asString, formatVnd } from "@/lib/commerce/normalizers";
import type {
  CustomerAddress,
  CustomerOrderDetail,
  CustomerOrderItem,
  CustomerOrderList,
  CustomerOrderSummary,
  CustomerProfile,
} from "./types";

type UnknownRecord = Record<string, unknown>;

const EMPTY_META = {
  page: 1,
  limit: 20,
  total: 0,
  totalPages: 0,
};

function unwrapData(value: unknown) {
  return value && typeof value === "object" && "data" in value
    ? (value as { data: unknown }).data
    : value;
}

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function firstDefined(...values: unknown[]) {
  return values.find((value) => value !== undefined && value !== null);
}

function asDateString(value: unknown) {
  if (value instanceof Date) {
    return value.toISOString();
  }

  return asString(value);
}

export function formatCustomerDate(value?: string) {
  if (!value) {
    return "Chưa có";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Chưa có";
  }

  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function formatCustomerAmount(amount: number) {
  return formatVnd(amount);
}

export function normalizeCustomerProfile(value: unknown): CustomerProfile {
  const source = asRecord(unwrapData(value));

  return {
    id: asString(source["id"]),
    email: asString(source["email"]),
    fullName: asString(source["fullName"], "Khách hàng ShopVN"),
    phone: asString(source["phone"]) || undefined,
    avatarUrl: asString(source["avatarUrl"]) || undefined,
    status: asString(source["status"]) || undefined,
  };
}

export function normalizeCustomerAddress(value: unknown): CustomerAddress {
  const source = asRecord(value);

  return {
    id: asString(source["id"]),
    recipientName: asString(source["recipientName"], "Người nhận"),
    phone: asString(source["phone"]),
    addressLine: asString(source["addressLine"]),
    ward: asString(source["ward"]) || undefined,
    district: asString(source["district"]) || undefined,
    city: asString(source["city"]),
    country: asString(source["country"], "Việt Nam"),
    isDefault: source["isDefault"] === true,
  };
}

export function normalizeCustomerAddresses(value: unknown): CustomerAddress[] {
  return asArray(unwrapData(value)).map(normalizeCustomerAddress);
}

export function normalizeCustomerOrderSummary(value: unknown): CustomerOrderSummary {
  const source = asRecord(value);
  const items = asArray(source["items"]).map(normalizeCustomerOrderItem);

  return {
    id: asString(source["id"]),
    orderNumber: asString(source["orderNumber"], asString(source["id"], "Đơn hàng")),
    status: asString(source["status"], "PENDING"),
    paymentStatus: asString(source["paymentStatus"], "PENDING"),
    subtotalAmount: asNumber(source["subtotalAmount"]),
    discountAmount: asNumber(source["discountAmount"]),
    shippingFee: asNumber(source["shippingFee"]),
    taxAmount: asNumber(source["taxAmount"]),
    totalAmount: asNumber(source["totalAmount"]),
    createdAt: asDateString(source["createdAt"]) || undefined,
    updatedAt: asDateString(source["updatedAt"]) || undefined,
    itemSummary: items.length ? summarizeItems(items) : undefined,
  };
}

export function normalizeCustomerOrderDetail(value: unknown): CustomerOrderDetail {
  const source = asRecord(unwrapData(value));
  const summary = normalizeCustomerOrderSummary(source);

  return {
    ...summary,
    recipientName: asString(source["recipientName"], "Người nhận"),
    recipientPhone: asString(source["recipientPhone"]),
    shippingAddress: asString(source["shippingAddress"]),
    items: asArray(source["items"]).map(normalizeCustomerOrderItem),
  };
}

export function normalizeCustomerOrderList(value: unknown): CustomerOrderList {
  const source = asRecord(value);
  const data = unwrapData(value);
  const dataRecord = asRecord(data);
  const meta = asRecord(firstDefined(source["meta"], dataRecord["meta"]));
  const orderValues = Array.isArray(data) ? data : asArray(firstDefined(source["data"], dataRecord["orders"]));

  return {
    orders: orderValues.map(normalizeCustomerOrderSummary),
    meta: {
      page: asNumber(meta["page"], EMPTY_META.page),
      limit: asNumber(meta["limit"], EMPTY_META.limit),
      total: asNumber(meta["total"], orderValues.length),
      totalPages: asNumber(meta["totalPages"], orderValues.length ? 1 : 0),
    },
  };
}

export function normalizeCustomerOrderItem(value: unknown): CustomerOrderItem {
  const source = asRecord(value);
  const unitPrice = asNumber(firstDefined(source["unitPriceSnapshot"], source["unitPrice"]));
  const quantity = Math.max(1, asNumber(source["quantity"], 1));

  return {
    id: asString(source["id"], asString(source["productId"])),
    productId: asString(source["productId"]) || undefined,
    productName: asString(
      firstDefined(source["productNameSnapshot"], source["productName"]),
      "Sản phẩm",
    ),
    sku: asString(firstDefined(source["skuSnapshot"], source["sku"])) || undefined,
    quantity,
    unitPrice,
    totalPrice: asNumber(source["totalPrice"], unitPrice * quantity),
  };
}

export function summarizeItems(items: CustomerOrderItem[]) {
  if (items.length === 0) {
    return "Chưa có sản phẩm";
  }

  const [firstItem] = items;
  const remaining = items.length - 1;
  return remaining > 0
    ? `${firstItem.productName} và ${remaining} sản phẩm khác`
    : firstItem.productName;
}

export function compactAddress(address: CustomerAddress) {
  return [
    address.addressLine,
    address.ward,
    address.district,
    address.city,
    address.country,
  ]
    .filter(Boolean)
    .join(", ");
}

export function isKnownOrderStatus(status: string) {
  return ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELED", "REFUNDED"].includes(
    status,
  );
}

export function isKnownPaymentStatus(status: string) {
  return ["PENDING", "SUCCEEDED", "FAILED", "CANCELED", "REFUNDED"].includes(status);
}

export function recordKeys(record: UnknownRecord) {
  return Object.keys(record);
}

