import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import AddressesClient from "../src/components/customer/addresses-client";
import OrderDetailClient from "../src/components/customer/order-detail-client";
import OrdersClient from "../src/components/customer/orders-client";
import ProfileForm from "../src/components/customer/profile-form";
import { isCancelableOrderStatus } from "../src/components/customer/status";
import {
  compactAddress,
  normalizeCustomerOrderDetail,
  normalizeCustomerOrderList,
  normalizeCustomerProfile,
} from "../src/lib/customer/normalizers";
import {
  createCustomerAddress,
  getCustomerOrders,
  updateCustomerProfile,
} from "../src/lib/customer/account";

describe("customer account normalizers and status mapping", () => {
  it("normalizes profile, address, order list, and order detail data", () => {
    expect(
      normalizeCustomerProfile({
        data: {
          id: "u1",
          email: "user@shopvn.com",
          fullName: "Nguyen Van An",
          phone: "0909",
        },
      }),
    ).toMatchObject({ id: "u1", email: "user@shopvn.com", phone: "0909" });

    expect(
      compactAddress({
        id: "a1",
        recipientName: "An",
        phone: "0909",
        addressLine: "12 Nguyen Trai",
        ward: "Phuong 1",
        district: "Quan 5",
        city: "TP.HCM",
        country: "Viet Nam",
        isDefault: true,
      }),
    ).toBe("12 Nguyen Trai, Phuong 1, Quan 5, TP.HCM, Viet Nam");

    expect(
      normalizeCustomerOrderList({
        data: [
          {
            id: "o1",
            orderNumber: "ORD-1",
            status: "PENDING",
            paymentStatus: "SUCCEEDED",
            totalAmount: "250000",
          },
        ],
        meta: { page: 1, limit: 20, total: 1, totalPages: 1 },
      }).orders[0],
    ).toMatchObject({ orderNumber: "ORD-1", totalAmount: 250000 });

    expect(
      normalizeCustomerOrderDetail({
        data: {
          id: "o1",
          orderNumber: "ORD-1",
          recipientName: "An",
          recipientPhone: "0909",
          shippingAddress: "12 Nguyen Trai",
          items: [{ id: "i1", productNameSnapshot: "Ao thun", quantity: 2 }],
        },
      }).items[0],
    ).toMatchObject({ productName: "Ao thun", quantity: 2 });

    expect(isCancelableOrderStatus("PENDING")).toBe(true);
    expect(isCancelableOrderStatus("SHIPPED")).toBe(false);
  });
});

describe("customer account services", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    global.fetch = jest.fn();
  });

  it("sends profile update and address create payloads through proxy routes", async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          data: { id: "u1", email: "user@shopvn.com", fullName: "An" },
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: async () => ({
          id: "a1",
          recipientName: "An",
          phone: "0909",
          addressLine: "12 Nguyen Trai",
          city: "TP.HCM",
          country: "Viet Nam",
        }),
      });

    await updateCustomerProfile({ fullName: "An" });
    await createCustomerAddress({
      recipientName: "An",
      phone: "0909",
      addressLine: "12 Nguyen Trai",
      city: "TP.HCM",
      country: "Viet Nam",
    });

    expect(global.fetch).toHaveBeenNthCalledWith(
      1,
      "/api/customer/profile",
      expect.objectContaining({
        method: "PATCH",
        body: JSON.stringify({ fullName: "An" }),
      }),
    );
    expect(global.fetch).toHaveBeenNthCalledWith(
      2,
      "/api/customer/addresses",
      expect.objectContaining({ method: "POST" }),
    );
  });

  it("passes supported order status filters as backend query params", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ data: [], meta: { page: 1, limit: 20, total: 0 } }),
    });

    await getCustomerOrders({ status: "SHIPPED" });

    expect(global.fetch).toHaveBeenCalledWith(
      "/api/customer/orders?page=1&limit=20&status=SHIPPED",
      expect.any(Object),
    );
  });
});

describe("customer account components", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    global.fetch = jest.fn();
  });

  it("blocks invalid profile submissions before calling update", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        data: { id: "u1", email: "user@shopvn.com", fullName: "An" },
      }),
    });

    render(<ProfileForm />);

    fireEvent.change(await screen.findByLabelText("Họ tên"), {
      target: { value: "" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Lưu thay đổi" }));

    expect(await screen.findByText("Vui lòng nhập họ tên.")).toBeTruthy();
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it("renders address empty state and keeps unsupported mutations disabled", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ data: [] }),
    });

    render(<AddressesClient />);

    expect(await screen.findByText("Chưa có địa chỉ")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Lưu địa chỉ" })).toBeTruthy();
  });

  it("loads order filters and requests the selected status", async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ data: [], meta: { page: 1, limit: 20, total: 0 } }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ data: [], meta: { page: 1, limit: 20, total: 0 } }),
      });

    render(<OrdersClient />);

    fireEvent.click(await screen.findByRole("button", { name: "Đang giao" }));

    await waitFor(() =>
      expect(global.fetch).toHaveBeenLastCalledWith(
        "/api/customer/orders?page=1&limit=20&status=SHIPPED",
        expect.any(Object),
      ),
    );
  });

  it("shows and executes cancel action only for eligible order statuses", async () => {
    const pendingOrder = {
      data: {
        id: "o1",
        orderNumber: "ORD-1",
        status: "PENDING",
        paymentStatus: "PENDING",
        totalAmount: 100,
        recipientName: "An",
        recipientPhone: "0909",
        shippingAddress: "12 Nguyen Trai",
        items: [],
      },
    };

    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({ ok: true, status: 200, json: async () => pendingOrder })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ data: { ...pendingOrder.data, status: "CANCELED" } }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ data: { ...pendingOrder.data, status: "CANCELED" } }),
      });

    render(<OrderDetailClient orderId="o1" />);

    fireEvent.click(await screen.findByRole("button", { name: "Hủy đơn hàng" }));
    fireEvent.change(screen.getByLabelText("Lý do hủy"), {
      target: { value: "Đổi ý" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Hủy đơn" }));

    await waitFor(() =>
      expect(global.fetch).toHaveBeenNthCalledWith(
        2,
        "/api/customer/orders/o1/cancel",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({ reason: "Đổi ý" }),
        }),
      ),
    );
  });
});

