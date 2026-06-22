import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import AddToCartButton from "../src/components/commerce/add-to-cart-button";
import { addCartItem } from "../src/lib/commerce/cart";
import { buildCheckoutPayload, deliveryFormToPayload } from "../src/lib/commerce/checkout";
import {
  formatVnd,
  normalizeCart,
  normalizeCheckoutResult,
  normalizeCheckoutSummary,
} from "../src/lib/commerce/normalizers";
import { paymentResultFromSearchParams } from "../src/lib/commerce/payment-result";
import { CHECKOUT_PAYMENT_PROVIDERS } from "../src/lib/commerce/types";

const push = jest.fn();
const refresh = jest.fn();

jest.mock("next/navigation", () => ({
  usePathname: () => "/products/p1",
  useRouter: () => ({
    push,
    refresh,
  }),
  useSearchParams: () => new URLSearchParams("color=blue"),
}));

describe("commerce service mapping", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    global.fetch = jest.fn();
  });

  it("normalizes cart items and totals from backend-shaped data", () => {
    const cart = normalizeCart({
      id: "cart-1",
      items: [
        {
          id: "item-1",
          productId: "product-1",
          quantity: 2,
          unitPriceSnapshot: "100000",
          product: {
            id: "product-1",
            name: "Tai nghe",
            sku: "SKU-1",
            images: [{ imageUrl: "/headphone.png" }],
          },
        },
      ],
    });

    expect(cart.isEmpty).toBe(false);
    expect(cart.items[0]).toMatchObject({
      id: "item-1",
      productId: "product-1",
      quantity: 2,
      totalPrice: 200000,
      product: { name: "Tai nghe", imageUrl: "/headphone.png" },
    });
    expect(cart.totals.total).toBe(200000);
    expect(formatVnd(200000)).toContain("200.000");
  });

  it("maps structured delivery fields to the current DeliveryInfoDto contract", () => {
    expect(
      deliveryFormToPayload({
        recipientName: " Nguyen Van An ",
        recipientPhone: " 0909000000 ",
        addressLine: "12 Nguyen Trai",
        ward: "Phuong 1",
        district: "Quan 5",
        city: "TP.HCM",
        country: "Viet Nam",
      }),
    ).toEqual({
      recipientName: "Nguyen Van An",
      recipientPhone: "0909000000",
      shippingAddress: "12 Nguyen Trai, Phuong 1, Quan 5, TP.HCM, Viet Nam",
    });
  });

  it("uses only backend-supported payment provider values", () => {
    expect(CHECKOUT_PAYMENT_PROVIDERS).toEqual(["COD", "MOMO", "VNPAY"]);
    expect(
      buildCheckoutPayload(
        {
          recipientName: "An",
          recipientPhone: "0909",
          addressLine: "12 Nguyen Trai",
          ward: "",
          district: "Quan 5",
          city: "TP.HCM",
          country: "Viet Nam",
        },
        "MOMO",
        " SALE10 ",
      ),
    ).toMatchObject({
      paymentProvider: "MOMO",
      voucherCode: "SALE10",
    });
  });

  it("normalizes checkout summaries and order creation results", () => {
    expect(
      normalizeCheckoutSummary({
        items: [
          {
            productId: "p1",
            productName: "Phone",
            quantity: 1,
            unitPrice: 10,
          },
        ],
        subtotal: 10,
        discount: 1,
        shippingFee: 2,
      }),
    ).toMatchObject({ subtotal: 10, discount: 1, shippingFee: 2, total: 11 });

    expect(
      normalizeCheckoutResult(
        {
          order: { id: "order-1", orderNumber: "ORD-1" },
          payment: { id: "pay-1", status: "PENDING" },
          paymentUrl: "https://mock.momo.vn/pay?orderId=order-1",
        },
        "MOMO",
      ),
    ).toMatchObject({
      orderId: "order-1",
      orderNumber: "ORD-1",
      paymentId: "pay-1",
      paymentProvider: "MOMO",
      paymentUrl: "https://mock.momo.vn/pay?orderId=order-1",
    });
  });

  it("documents missing live payment status as pending instead of faking success", () => {
    const result = paymentResultFromSearchParams({
      status: undefined,
      orderId: "order-1",
      paymentProvider: "VNPAY",
    });

    expect(result.status).toBe("pending");
    expect(result.message).toContain("chưa có endpoint trạng thái thanh toán");
  });

  it("calls cart add API and refreshes cart through the service boundary", async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: async () => ({ id: "item-1" }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ id: "cart-1", items: [] }),
      });

    await expect(addCartItem("product-1", 2)).resolves.toMatchObject({
      id: "cart-1",
      isEmpty: true,
    });
    expect(global.fetch).toHaveBeenNthCalledWith(
      1,
      "/api/cart/items",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ productId: "product-1", quantity: 2 }),
      }),
    );
  });
});

describe("add-to-cart entry point", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    global.fetch = jest.fn();
  });

  it("adds an in-stock product for an authenticated customer", async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: async () => ({ id: "item-1" }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ id: "cart-1", items: [] }),
      });

    render(
      <AddToCartButton
        productId="product-1"
        productName="Tai nghe"
        inStock
        stockQuantity={3}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Thêm vào giỏ" }));

    expect(await screen.findByText("Đã thêm Tai nghe vào giỏ hàng.")).toBeTruthy();
    expect(refresh).toHaveBeenCalled();
  });

  it("redirects guests to login with a safe redirect target", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({ message: "Unauthorized" }),
    });

    render(
      <AddToCartButton
        productId="product-1"
        productName="Tai nghe"
        inStock
        stockQuantity={3}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Thêm vào giỏ" }));

    await waitFor(() =>
      expect(push).toHaveBeenCalledWith(
        "/login?redirectTo=%2Fproducts%2Fp1%3Fcolor%3Dblue",
      ),
    );
  });

  it("disables out-of-stock products", () => {
    render(
      <AddToCartButton
        productId="product-1"
        productName="Tai nghe"
        inStock={false}
        stockQuantity={0}
      />,
    );

    expect(screen.getByRole("button", { name: "Thêm vào giỏ" })).toHaveProperty(
      "disabled",
      true,
    );
    expect(screen.getByText("Sản phẩm đã hết hàng.")).toBeTruthy();
  });
});

describe("payment-result states", () => {
  it.each([
    ["success", "Đặt hàng thành công"],
    ["failed", "Thanh toán thất bại"],
    ["canceled", "Thanh toán đã hủy"],
    ["pending", "Đang chờ xác nhận thanh toán"],
  ])("maps %s state", (status, title) => {
    expect(paymentResultFromSearchParams({ status }).title).toBe(title);
  });
});
