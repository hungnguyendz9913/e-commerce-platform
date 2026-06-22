import { commerceFetch } from "./client";
import { emptyCart, normalizeCart } from "./normalizers";
import type { CartView } from "./types";

function normalizeCartResponse(value: unknown): CartView {
  const data =
    value && typeof value === "object" && "data" in value
      ? (value as { data: unknown }).data
      : value;

  if (!data) {
    return emptyCart();
  }

  return normalizeCart(data);
}

export async function getCart() {
  return normalizeCartResponse(await commerceFetch<unknown>("/api/cart"));
}

export async function addCartItem(productId: string, quantity = 1) {
  await commerceFetch<unknown>("/api/cart/items", {
    method: "POST",
    body: JSON.stringify({ productId, quantity }),
  });

  return getCart();
}

export async function updateCartItemQuantity(itemId: string, quantity: number) {
  await commerceFetch<unknown>(`/api/cart/items/${encodeURIComponent(itemId)}`, {
    method: "PATCH",
    body: JSON.stringify({ quantity }),
  });

  return getCart();
}

export async function removeCartItem(itemId: string) {
  await commerceFetch<unknown>(`/api/cart/items/${encodeURIComponent(itemId)}`, {
    method: "DELETE",
  });

  return getCart();
}

export async function clearCart() {
  await commerceFetch<unknown>("/api/cart", {
    method: "DELETE",
  });

  return getCart();
}
