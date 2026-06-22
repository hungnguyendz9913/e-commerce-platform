import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import AdminShell from "../src/components/admin/admin-shell";
import { AdminConfirmDialog, AdminEmpty } from "../src/components/admin/admin-ui";

jest.mock("next/navigation", () => ({
  usePathname: () => "/admin/products",
  useRouter: () => ({
    push: jest.fn(),
    refresh: jest.fn(),
  }),
}));

describe("admin layout components", () => {
  it("renders active admin navigation, account identity, and storefront navigation", () => {
    render(
      <AdminShell
        currentUser={{
          id: "u1",
          email: "admin@shopvn.test",
          fullName: "ShopVN Admin",
          roles: ["admin"],
        }}
      >
        <div>Admin content</div>
      </AdminShell>,
    );

    expect(screen.getAllByText("Sản phẩm").length).toBeGreaterThan(0);
    expect(screen.getAllByText("ShopVN Admin").length).toBeGreaterThan(0);
    expect(screen.getByText("admin@shopvn.test")).toBeTruthy();
    expect(screen.getByRole("link", { name: "Về cửa hàng" })).toBeTruthy();
    expect(screen.getByText("Admin content")).toBeTruthy();
  });

  it("opens and closes the mobile menu", () => {
    render(
      <AdminShell currentUser={null}>
        <div>Admin content</div>
      </AdminShell>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Mở menu quản trị" }));
    expect(screen.getByRole("dialog")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Đóng menu" }));
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("renders empty states with safe navigation", () => {
    render(
      <AdminEmpty
        title="Không có dữ liệu"
        description="Backend chưa hỗ trợ."
        actionHref="/admin/products"
        actionLabel="Xem sản phẩm"
      />,
    );

    expect(screen.getByText("Không có dữ liệu")).toBeTruthy();
    expect(screen.getByRole("link", { name: "Xem sản phẩm" }).getAttribute("href")).toBe(
      "/admin/products",
    );
  });

  it("requires confirmation before calling destructive handlers", () => {
    const onConfirm = jest.fn();
    const onCancel = jest.fn();

    render(
      <AdminConfirmDialog
        title="Xóa sản phẩm"
        description="Thao tác này cần xác nhận."
        confirmLabel="Xóa"
        onCancel={onCancel}
        onConfirm={onConfirm}
      />,
    );

    expect(screen.getByRole("dialog")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Xóa" }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByRole("button", { name: "Hủy" }));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});
