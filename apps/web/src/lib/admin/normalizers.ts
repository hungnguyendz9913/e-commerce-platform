import { asNumber, asRecord, asString } from "@/lib/commerce/normalizers";
import type {
  AdminCategory,
  AdminDashboard,
  AdminOrderSummary,
  AdminPaginatedResult,
  AdminPagination,
  AdminProduct,
  AdminVoucher,
} from "./types";

const EMPTY_META: AdminPagination = {
  page: 1,
  limit: 20,
  total: 0,
  totalPages: 0,
};

export function unwrapAdminData(value: unknown) {
  return value && typeof value === "object" && "data" in value
    ? (value as { data: unknown }).data
    : value;
}

export function asAdminArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function firstDefined(...values: unknown[]) {
  return values.find((value) => value !== undefined && value !== null);
}

function asDateString(value: unknown) {
  if (value instanceof Date) {
    return value.toISOString();
  }

  return asString(value) || undefined;
}

function normalizeMeta(value: unknown, itemCount: number): AdminPagination {
  const meta = asRecord(value);

  return {
    page: asNumber(meta["page"], EMPTY_META.page),
    limit: asNumber(meta["limit"], EMPTY_META.limit),
    total: asNumber(meta["total"], itemCount),
    totalPages: asNumber(meta["totalPages"], itemCount ? 1 : 0),
  };
}

export function normalizePaginatedAdminResult<T>(
  value: unknown,
  normalizeItem: (item: unknown) => T,
): AdminPaginatedResult<T> {
  const source = asRecord(value);
  const data = unwrapAdminData(value);
  const dataRecord = asRecord(data);
  const items = Array.isArray(data)
    ? data
    : asAdminArray(firstDefined(dataRecord["items"], dataRecord["products"], dataRecord["orders"], source["data"]));
  const meta = firstDefined(source["meta"], dataRecord["meta"], dataRecord["pagination"]);

  return {
    items: items.map(normalizeItem),
    meta: normalizeMeta(meta, items.length),
  };
}

export function normalizeAdminCategory(value: unknown): AdminCategory {
  const source = asRecord(value);
  const count = asRecord(source["_count"]);

  return {
    id: asString(source["id"]),
    name: asString(source["name"], "Danh mục"),
    slug: asString(source["slug"]),
    description: asString(source["description"]) || undefined,
    status: asString(source["status"], "ACTIVE"),
    parentId: asString(source["parentId"]) || undefined,
    productCount: asNumber(firstDefined(source["productCount"], count["products"]), undefined as unknown as number),
    children: asAdminArray(source["children"]).map(normalizeAdminCategory),
  };
}

export function normalizeAdminCategories(value: unknown): AdminCategory[] {
  return asAdminArray(unwrapAdminData(value)).map(normalizeAdminCategory);
}

export function normalizeAdminProduct(value: unknown): AdminProduct {
  const source = asRecord(value);
  const category = asRecord(source["category"]);
  const inventory = asRecord(firstDefined(source["inventory"], source["inventoryItem"]));
  const images = asAdminArray(source["images"]).map((imageValue) => {
    const image = asRecord(imageValue);
    return {
      imageUrl: asString(firstDefined(image["imageUrl"], image["url"])),
      altText: asString(image["altText"]) || undefined,
      sortOrder: asNumber(image["sortOrder"], undefined as unknown as number),
    };
  });
  const stockQuantity = asNumber(inventory["stockQuantity"]);
  const reservedQuantity = asNumber(inventory["reservedQuantity"]);
  const availableQuantity = Math.max(
    0,
    asNumber(inventory["availableQuantity"], stockQuantity - reservedQuantity),
  );

  return {
    id: asString(source["id"]),
    sku: asString(source["sku"]),
    name: asString(source["name"], "Sản phẩm"),
    slug: asString(source["slug"]),
    description: asString(source["description"]) || undefined,
    price: asNumber(source["price"]),
    status: asString(source["status"], "ACTIVE"),
    approvalStatus: asString(source["approvalStatus"], "PENDING"),
    categoryId: asString(firstDefined(source["categoryId"], category["id"])) || undefined,
    categoryName: asString(firstDefined(source["categoryName"], category["name"])) || undefined,
    imageUrl: asString(firstDefined(source["imageUrl"], images[0]?.imageUrl)) || undefined,
    images,
    inventory: {
      stockQuantity,
      reservedQuantity,
      availableQuantity,
      lowStock: availableQuantity <= 5,
    },
    createdAt: asDateString(source["createdAt"]),
    updatedAt: asDateString(source["updatedAt"]),
  };
}

export function normalizeAdminProducts(value: unknown) {
  return normalizePaginatedAdminResult(value, normalizeAdminProduct);
}

export function normalizeAdminVoucher(value: unknown): AdminVoucher {
  const source = asRecord(value);
  const active = source["active"] !== false && asString(source["status"], "ACTIVE") !== "INACTIVE";

  return {
    id: asString(firstDefined(source["id"], source["voucherId"])),
    code: asString(firstDefined(source["code"], source["voucherCode"]), "VOUCHER"),
    discountType: asString(source["discountType"], "PERCENTAGE"),
    discountValue: asNumber(source["discountValue"]),
    minimumOrderAmount: asNumber(firstDefined(source["minimumOrderAmount"], source["minOrderAmount"])),
    usageLimit: asNumber(source["usageLimit"], undefined as unknown as number),
    usedCount: asNumber(firstDefined(source["usedCount"], source["usageCount"]), undefined as unknown as number),
    startsAt: asDateString(firstDefined(source["startsAt"], source["startDate"])),
    expiresAt: asDateString(firstDefined(source["expiresAt"], source["endDate"])),
    status: active ? asString(source["status"], "ACTIVE") : "INACTIVE",
    active,
  };
}

export function normalizeAdminVouchers(value: unknown) {
  return normalizePaginatedAdminResult(value, normalizeAdminVoucher);
}

export function emptyDashboard(gapMessage: string): AdminDashboard {
  return {
    gapMessage,
    metrics: [
      { label: "Sản phẩm", value: "Theo API sản phẩm", href: "/admin/products", tone: "blue" },
      { label: "Danh mục", value: "Theo API danh mục", href: "/admin/categories", tone: "green" },
      { label: "Voucher", value: "Theo API voucher", href: "/admin/vouchers", tone: "amber" },
      { label: "Báo cáo", value: "Chờ API dashboard", href: "/admin/revenue", tone: "slate" },
    ],
    recentOrders: [],
    lowStockProducts: [],
  };
}

export function normalizeAdminOrderSummary(value: unknown): AdminOrderSummary {
  const source = asRecord(value);
  const customer = asRecord(source["customer"]);

  return {
    id: asString(source["id"]),
    orderNumber: asString(source["orderNumber"], asString(source["id"], "Đơn hàng")),
    customerName: asString(firstDefined(source["customerName"], customer["fullName"])) || undefined,
    customerEmail: asString(firstDefined(source["customerEmail"], customer["email"])) || undefined,
    status: asString(source["status"], "PENDING"),
    paymentStatus: asString(source["paymentStatus"], "PENDING"),
    totalAmount: asNumber(source["totalAmount"]),
    createdAt: asDateString(source["createdAt"]),
  };
}
