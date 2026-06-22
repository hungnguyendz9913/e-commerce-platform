import { buildAdminQuery, adminFetch } from "./api";
import {
  emptyDashboard,
  normalizeAdminCategories,
  normalizeAdminCategory,
  normalizeAdminProduct,
  normalizeAdminProducts,
  normalizeAdminVoucher,
  normalizeAdminVouchers,
} from "./normalizers";
import type {
  AdminCategoryPayload,
  AdminMutationSupport,
  AdminProductPayload,
  AdminProductQuery,
  AdminVoucherPayload,
  AdminVoucherQuery,
} from "./types";

export const adminMutationSupport: AdminMutationSupport = {
  products: true,
  categories: true,
  productApprovalViaProductUpdate: true,
  vouchers: true,
  voucherDeactivate: true,
  inventoryStandalone: false,
  orderStatus: false,
  customerStatus: false,
  revenueExport: false,
};

export const adminBackendGaps = {
  dashboard: "Dashboard summary endpoint is not available yet.",
  inventory: "Dedicated inventory list, adjustment, and movement endpoints are not available yet.",
  orders: "Admin order list/detail/status endpoints are not available yet.",
  customers: "Admin customer list and status endpoints are not available yet.",
  revenue: "Revenue summary, grouping, and export endpoints are not available yet.",
  payments: "Admin payment history endpoint is not available yet.",
  webhooks: "Webhook log endpoint is not available yet.",
  auditLogs: "Audit log endpoint is not available yet.",
};

export async function getAdminDashboard() {
  return emptyDashboard("Dashboard API chưa có, nên trang chỉ hiển thị lối tắt tới các hợp đồng đã hỗ trợ.");
}

export async function getAdminProducts(query: AdminProductQuery = {}) {
  return normalizeAdminProducts(
    await adminFetch<unknown>(`/api/admin/products${buildAdminQuery(query)}`),
  );
}

export async function getAdminProduct(productId: string) {
  return normalizeAdminProduct(
    await adminFetch<unknown>(`/api/admin/products/${encodeURIComponent(productId)}`),
  );
}

export async function createAdminProduct(payload: AdminProductPayload) {
  return normalizeAdminProduct(
    await adminFetch<unknown>("/api/admin/products", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  );
}

export async function updateAdminProduct(
  productId: string,
  payload: Partial<AdminProductPayload>,
) {
  return normalizeAdminProduct(
    await adminFetch<unknown>(`/api/admin/products/${encodeURIComponent(productId)}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),
  );
}

export async function deleteAdminProduct(productId: string) {
  return adminFetch<unknown>(`/api/admin/products/${encodeURIComponent(productId)}`, {
    method: "DELETE",
  });
}

export async function getAdminCategories() {
  return normalizeAdminCategories(await adminFetch<unknown>("/api/admin/categories"));
}

export async function createAdminCategory(payload: AdminCategoryPayload) {
  return normalizeAdminCategory(
    await adminFetch<unknown>("/api/admin/categories", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  );
}

export async function updateAdminCategory(
  categoryId: string,
  payload: Partial<AdminCategoryPayload>,
) {
  return normalizeAdminCategory(
    await adminFetch<unknown>(`/api/admin/categories/${encodeURIComponent(categoryId)}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),
  );
}

export async function deleteAdminCategory(categoryId: string) {
  return adminFetch<unknown>(`/api/admin/categories/${encodeURIComponent(categoryId)}`, {
    method: "DELETE",
  });
}

export async function getAdminVouchers(query: AdminVoucherQuery = {}) {
  return normalizeAdminVouchers(
    await adminFetch<unknown>(`/api/admin/vouchers${buildAdminQuery(query)}`),
  );
}

export async function createAdminVoucher(payload: AdminVoucherPayload) {
  return normalizeAdminVoucher(
    await adminFetch<unknown>("/api/admin/vouchers", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  );
}

export async function updateAdminVoucher(
  voucherId: string,
  payload: Partial<AdminVoucherPayload>,
) {
  return normalizeAdminVoucher(
    await adminFetch<unknown>(`/api/admin/vouchers/${encodeURIComponent(voucherId)}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),
  );
}

export async function deactivateAdminVoucher(voucherId: string) {
  return normalizeAdminVoucher(
    await adminFetch<unknown>(
      `/api/admin/vouchers/${encodeURIComponent(voucherId)}/deactivate`,
      { method: "PATCH" },
    ),
  );
}
