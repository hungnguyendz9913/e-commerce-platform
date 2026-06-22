export type AdminApiErrorBody = {
  message?: string | string[];
  error?: string;
  statusCode?: number;
  code?: string;
};

export class AdminApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly body?: AdminApiErrorBody,
  ) {
    super(message);
    this.name = "AdminApiError";
  }
}

export type AdminPagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type AdminPaginatedResult<T> = {
  items: T[];
  meta: AdminPagination;
};

export type AdminListQuery = {
  page?: number;
  limit?: number;
  q?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
};

export type AdminProductQuery = AdminListQuery & {
  categoryId?: string;
  approvalStatus?: string;
  inStock?: boolean;
  minPrice?: number;
  maxPrice?: number;
};

export type AdminVoucherQuery = AdminListQuery & {
  code?: string;
  active?: boolean;
};

export type AdminCategory = {
  id: string;
  name: string;
  slug: string;
  description?: string;
  status: string;
  parentId?: string;
  productCount?: number;
  children: AdminCategory[];
};

export type AdminInventory = {
  stockQuantity: number;
  reservedQuantity: number;
  availableQuantity: number;
  lowStock: boolean;
};

export type AdminProduct = {
  id: string;
  sku: string;
  name: string;
  slug: string;
  description?: string;
  price: number;
  status: string;
  approvalStatus: string;
  categoryId?: string;
  categoryName?: string;
  imageUrl?: string;
  images: Array<{ imageUrl: string; altText?: string; sortOrder?: number }>;
  inventory: AdminInventory;
  createdAt?: string;
  updatedAt?: string;
};

export type AdminProductPayload = {
  sku: string;
  name: string;
  slug: string;
  description?: string;
  price: number;
  categoryId: string;
  status?: string;
  approvalStatus?: string;
  images?: Array<{ imageUrl: string; altText?: string; sortOrder?: number }>;
  inventory?: {
    stockQuantity?: number;
    reservedQuantity?: number;
  };
};

export type AdminCategoryPayload = {
  name: string;
  slug: string;
  description?: string;
  parentId?: string;
  status?: string;
};

export type AdminOrderSummary = {
  id: string;
  orderNumber: string;
  customerName?: string;
  customerEmail?: string;
  status: string;
  paymentStatus: string;
  totalAmount: number;
  createdAt?: string;
};

export type AdminCustomer = {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  status: string;
  createdAt?: string;
};

export type AdminVoucher = {
  id: string;
  code: string;
  discountType: string;
  discountValue: number;
  minimumOrderAmount: number;
  usageLimit?: number;
  usedCount?: number;
  startsAt?: string;
  expiresAt?: string;
  status: string;
  active: boolean;
};

export type AdminVoucherPayload = {
  code: string;
  discountType: string;
  discountValue: number;
  minimumOrderAmount?: number;
  usageLimit?: number;
  startsAt?: string;
  expiresAt?: string;
  productIds?: string[];
  categoryIds?: string[];
};

export type AdminMetric = {
  label: string;
  value: string;
  href?: string;
  tone?: "blue" | "green" | "amber" | "red" | "slate";
};

export type AdminDashboard = {
  metrics: AdminMetric[];
  recentOrders: AdminOrderSummary[];
  lowStockProducts: AdminProduct[];
  gapMessage?: string;
};

export type AdminReportRow = {
  id: string;
  label: string;
  value: string;
  detail?: string;
};

export type AdminPayment = {
  id: string;
  provider: string;
  method?: string;
  amount: number;
  status: string;
  orderNumber?: string;
  customerName?: string;
  createdAt?: string;
};

export type AdminWebhookLog = {
  id: string;
  provider: string;
  eventType: string;
  status: string;
  createdAt?: string;
  payload?: unknown;
};

export type AdminAuditLog = {
  id: string;
  actor?: string;
  action: string;
  entityType?: string;
  entityId?: string;
  createdAt?: string;
  before?: unknown;
  after?: unknown;
};

export type AdminMutationSupport = {
  products: boolean;
  categories: boolean;
  productApprovalViaProductUpdate: boolean;
  vouchers: boolean;
  voucherDeactivate: boolean;
  inventoryStandalone: boolean;
  orderStatus: boolean;
  customerStatus: boolean;
  revenueExport: boolean;
};
