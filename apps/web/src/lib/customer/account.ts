import { commerceFetch } from "@/lib/commerce/client";
import {
  normalizeCustomerAddress,
  normalizeCustomerAddresses,
  normalizeCustomerOrderDetail,
  normalizeCustomerOrderList,
  normalizeCustomerProfile,
} from "./normalizers";
import type {
  CancelCustomerOrderPayload,
  CustomerAddressPayload,
  CustomerMutationSupport,
  CustomerOrderListQuery,
  CustomerProfilePayload,
} from "./types";

export const customerMutationSupport: CustomerMutationSupport = {
  canUpdateAddress: false,
  canDeleteAddress: false,
  canSetDefaultAddress: false,
};

export async function getCustomerProfile() {
  return normalizeCustomerProfile(await commerceFetch<unknown>("/api/customer/profile"));
}

export async function updateCustomerProfile(payload: CustomerProfilePayload) {
  return normalizeCustomerProfile(
    await commerceFetch<unknown>("/api/customer/profile", {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),
  );
}

export async function getCustomerAddresses() {
  return normalizeCustomerAddresses(await commerceFetch<unknown>("/api/customer/addresses"));
}

export async function createCustomerAddress(payload: CustomerAddressPayload) {
  return normalizeCustomerAddress(
    await commerceFetch<unknown>("/api/customer/addresses", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  );
}

export async function getCustomerOrders(query: CustomerOrderListQuery = {}) {
  const params = new URLSearchParams();
  params.set("page", String(query.page ?? 1));
  params.set("limit", String(query.limit ?? 20));

  if (query.status && query.status !== "all") {
    params.set("status", query.status);
  }

  return normalizeCustomerOrderList(
    await commerceFetch<unknown>(`/api/customer/orders?${params.toString()}`),
  );
}

export async function getCustomerOrderDetail(orderId: string) {
  return normalizeCustomerOrderDetail(
    await commerceFetch<unknown>(`/api/customer/orders/${encodeURIComponent(orderId)}`),
  );
}

export async function cancelCustomerOrder(
  orderId: string,
  payload: CancelCustomerOrderPayload,
) {
  return normalizeCustomerOrderDetail(
    await commerceFetch<unknown>(
      `/api/customer/orders/${encodeURIComponent(orderId)}/cancel`,
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
    ),
  );
}

export function unsupportedAddressMutationMessage() {
  return "Tính năng này cần hợp đồng API cập nhật/xóa/đặt mặc định địa chỉ trước khi bật.";
}

