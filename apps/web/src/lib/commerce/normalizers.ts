import type {
  CartItemView,
  CartTotalsView,
  CartView,
  CheckoutPaymentProvider,
  CheckoutResult,
  CheckoutSummary,
} from "./types";

type UnknownRecord = Record<string, unknown>;

const EMPTY_TOTALS: CartTotalsView = {
  subtotal: 0,
  discount: 0,
  shippingFee: 0,
  total: 0,
};

export function asRecord(value: unknown): UnknownRecord {
  return value && typeof value === "object" ? (value as UnknownRecord) : {};
}

export function asString(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

export function asNumber(value: unknown, fallback = 0) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  return fallback;
}

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function firstDefined(...values: unknown[]) {
  return values.find((value) => value !== undefined && value !== null);
}

export function formatVnd(amount: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function normalizeCart(value: unknown): CartView {
  const source = asRecord(value);
  const items = asArray(source["items"] ?? source["cartItems"]).map(
    normalizeCartItem,
  );
  const subtotal = asNumber(
    firstDefined(
      source["subtotal"],
      source["subTotal"],
      source["itemsTotal"],
      items.reduce((sum, item) => sum + item.totalPrice, 0),
    ),
  );
  const discount = asNumber(firstDefined(source["discount"], source["discountTotal"]));
  const shippingFee = asNumber(firstDefined(source["shippingFee"], source["shipping"]));
  const total = asNumber(
    firstDefined(source["total"], source["grandTotal"], subtotal - discount + shippingFee),
  );

  return {
    id: asString(source["id"], "") || null,
    items,
    totals: { subtotal, discount, shippingFee, total },
    isEmpty: items.length === 0,
  };
}

export function emptyCart(): CartView {
  return {
    id: null,
    items: [],
    totals: EMPTY_TOTALS,
    isEmpty: true,
  };
}

function normalizeCartItem(value: unknown): CartItemView {
  const item = asRecord(value);
  const product = asRecord(item["product"]);
  const inventory = asRecord(product["inventoryItem"]);
  const primaryImage = asRecord(product["primaryImage"]);
  const images = asArray(product["images"]);
  const firstImage = asRecord(images[0]);
  const unitPrice = asNumber(
    firstDefined(item["unitPrice"], item["unitPriceSnapshot"], product["price"]),
  );
  const quantity = Math.max(1, asNumber(item["quantity"], 1));
  const productId = asString(firstDefined(item["productId"], product["id"]));

  return {
    id: asString(item["id"], productId),
    productId,
    quantity,
    unitPrice,
    totalPrice: asNumber(firstDefined(item["totalPrice"], item["lineTotal"]), unitPrice * quantity),
    product: {
      id: productId,
      name: asString(product["name"], "Sản phẩm"),
      sku: asString(product["sku"]),
      categoryName: asString(asRecord(product["category"])["name"]),
      imageUrl: asString(
        firstDefined(
          product["imageUrl"],
          primaryImage["imageUrl"],
          firstImage["imageUrl"],
        ),
      ),
      stockQuantity: asNumber(
        firstDefined(product["stockQuantity"], inventory["stockQuantity"]),
        undefined as unknown as number,
      ),
    },
  };
}

export function normalizeCheckoutSummary(value: unknown): CheckoutSummary {
  const source = asRecord(value);
  const items = asArray(source["items"]).map((itemValue) => {
    const item = asRecord(itemValue);
    const unitPrice = asNumber(item["unitPrice"]);
    const quantity = Math.max(1, asNumber(item["quantity"], 1));

    return {
      productId: asString(item["productId"]),
      productName: asString(item["productName"], "Sản phẩm"),
      sku: asString(item["sku"]),
      quantity,
      unitPrice,
      totalPrice: asNumber(item["totalPrice"], unitPrice * quantity),
    };
  });
  const subtotal = asNumber(source["subtotal"]);
  const discount = asNumber(source["discount"]);
  const shippingFee = asNumber(source["shippingFee"]);

  return {
    items,
    subtotal,
    discount,
    shippingFee,
    total: asNumber(source["total"], subtotal - discount + shippingFee),
    voucherCode: asString(firstDefined(source["voucherCode"], asRecord(source["voucher"])["voucherCode"])),
  };
}

export function normalizeCheckoutResult(
  value: unknown,
  paymentProvider: CheckoutPaymentProvider,
): CheckoutResult {
  const source = asRecord(value);
  const order = asRecord(source["order"]);
  const payment = asRecord(source["payment"]);
  const orderNumber = asString(firstDefined(order["orderNumber"], source["orderNumber"]));
  const orderId = asString(firstDefined(order["id"], source["orderId"]));

  return {
    orderId,
    orderNumber,
    paymentProvider,
    paymentId: asString(firstDefined(payment["id"], source["paymentId"])),
    paymentStatus: asString(firstDefined(payment["status"], source["paymentStatus"])),
    paymentUrl: asString(source["paymentUrl"]),
    raw: value,
  };
}
