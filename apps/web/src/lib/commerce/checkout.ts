import { commerceFetch } from "./client";
import {
  normalizeCheckoutResult,
  normalizeCheckoutSummary,
} from "./normalizers";
import type {
  CheckoutPayload,
  CheckoutPaymentProvider,
  CheckoutResult,
  CheckoutSummary,
  DeliveryForm,
  DeliveryInfoPayload,
} from "./types";

function unwrapData(value: unknown) {
  return value && typeof value === "object" && "data" in value
    ? (value as { data: unknown }).data
    : value;
}

export function deliveryFormToPayload(form: DeliveryForm): DeliveryInfoPayload {
  const addressParts = [
    form.addressLine,
    form.ward,
    form.district,
    form.city,
    form.country,
  ]
    .map((part) => part.trim())
    .filter(Boolean);

  return {
    recipientName: form.recipientName.trim(),
    recipientPhone: form.recipientPhone.trim(),
    shippingAddress: addressParts.join(", "),
  };
}

export function buildCheckoutPayload(
  delivery: DeliveryForm,
  paymentProvider: CheckoutPaymentProvider,
  voucherCode?: string,
): CheckoutPayload {
  const trimmedVoucher = voucherCode?.trim();

  return {
    deliveryInfo: deliveryFormToPayload(delivery),
    paymentProvider,
    ...(trimmedVoucher ? { voucherCode: trimmedVoucher } : {}),
  };
}

export async function validateCheckout(
  delivery: DeliveryForm,
  paymentProvider: CheckoutPaymentProvider,
  voucherCode?: string,
): Promise<CheckoutSummary> {
  const response = await commerceFetch<unknown>("/api/checkout/validate", {
    method: "POST",
    body: JSON.stringify(buildCheckoutPayload(delivery, paymentProvider, voucherCode)),
  });

  return normalizeCheckoutSummary(unwrapData(response));
}

export async function applyVoucher(
  delivery: DeliveryForm,
  voucherCode: string,
): Promise<CheckoutSummary> {
  const response = await commerceFetch<unknown>("/api/checkout/voucher", {
    method: "POST",
    body: JSON.stringify({
      voucherCode: voucherCode.trim(),
      deliveryInfo: deliveryFormToPayload(delivery),
    }),
  });

  return normalizeCheckoutSummary(unwrapData(response));
}

export async function createOrder(
  delivery: DeliveryForm,
  paymentProvider: CheckoutPaymentProvider,
  voucherCode?: string,
): Promise<CheckoutResult> {
  const response = await commerceFetch<unknown>("/api/checkout", {
    method: "POST",
    body: JSON.stringify(buildCheckoutPayload(delivery, paymentProvider, voucherCode)),
  });

  return normalizeCheckoutResult(unwrapData(response), paymentProvider);
}
