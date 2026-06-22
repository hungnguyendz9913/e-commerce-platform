import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import HomepageHeader from "../src/components/ui/homepage-header";
import LoginForm from "../src/components/auth/login-form";
import RegisterForm from "../src/components/auth/register-form";
import {
  canAccessRole,
  requiredRoleForPath,
} from "../src/lib/auth/access";
import { currentSession, login } from "../src/lib/auth/client";
import {
  defaultAuthenticatedPath,
  sanitizeRedirectTo,
} from "../src/lib/auth/redirects";

const push = jest.fn();
const refresh = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push,
    refresh,
  }),
}));

describe("auth redirects and access decisions", () => {
  it("accepts only safe relative redirect targets", () => {
    expect(sanitizeRedirectTo("/customer?tab=orders")).toBe(
      "/customer?tab=orders",
    );
    expect(sanitizeRedirectTo("https://evil.test/customer")).toBe("/");
    expect(sanitizeRedirectTo("//evil.test/customer")).toBe("/");
    expect(sanitizeRedirectTo("/login?redirectTo=/admin")).toBe("/");
  });

  it("chooses role-aware default destinations", () => {
    expect(defaultAuthenticatedPath({ roles: ["customer"] })).toBe("/");
    expect(defaultAuthenticatedPath({ roles: ["admin"] })).toBe("/admin");
  });

  it("maps protected paths and role access", () => {
    expect(requiredRoleForPath("/admin/products")).toBe("admin");
    expect(requiredRoleForPath("/customer")).toBe("customer");
    expect(requiredRoleForPath("/customer/profile")).toBe("customer");
    expect(requiredRoleForPath("/customer/orders/o1")).toBe("customer");
    expect(requiredRoleForPath("/cart")).toBe("customer");
    expect(requiredRoleForPath("/checkout")).toBe("customer");
    expect(requiredRoleForPath("/payment-result?status=pending")).toBe("customer");
    expect(requiredRoleForPath("/products")).toBeNull();
    expect(canAccessRole({ roles: ["customer"] }, "customer")).toBe(true);
    expect(canAccessRole({ roles: ["customer"] }, "admin")).toBe(false);
    expect(canAccessRole({ roles: ["admin"] }, "admin")).toBe(true);
  });
});

describe("auth client", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    global.fetch = jest.fn();
  });

  it("calls the login proxy and returns user roles", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        data: {
          accessToken: "access",
          refreshToken: "refresh",
          user: {
            id: "u1",
            email: "admin@shopvn.com",
            fullName: "Admin",
            roles: ["admin"],
          },
        },
      }),
    });

    const result = await login({
      email: "admin@shopvn.com",
      password: "Password1",
    });

    expect(global.fetch).toHaveBeenCalledWith(
      "/api/auth/login",
      expect.objectContaining({ method: "POST" }),
    );
    expect(result.data.user.roles).toContain("admin");
  });

  it("falls back to guest when current user lookup fails", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({ message: "Invalid session" }),
    });

    await expect(currentSession()).resolves.toEqual({
      status: "guest",
      user: null,
    });
  });
});

describe("auth forms", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    global.fetch = jest.fn();
  });

  it("validates required login fields", async () => {
    render(<LoginForm />);

    fireEvent.click(screen.getByRole("button", { name: "Đăng nhập" }));

    expect(await screen.findByText("Email không được để trống")).toBeTruthy();
    expect(screen.getByText("Mật khẩu không được để trống")).toBeTruthy();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("redirects after successful login", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        data: {
          accessToken: "access",
          refreshToken: "refresh",
          user: {
            id: "u1",
            email: "user@shopvn.com",
            fullName: "User",
            roles: ["customer"],
          },
        },
      }),
    });

    render(<LoginForm redirectTo="/customer" />);

    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "user@shopvn.com" },
    });
    fireEvent.change(screen.getByLabelText("Mật khẩu"), {
      target: { value: "Password1" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Đăng nhập" }));

    await waitFor(() => expect(push).toHaveBeenCalledWith("/customer"));
  });

  it("validates registration password policy", async () => {
    render(<RegisterForm />);

    fireEvent.change(screen.getByLabelText("Họ và tên"), {
      target: { value: "Nguyen Van An" },
    });
    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "an@shopvn.com" },
    });
    fireEvent.change(screen.getByLabelText("Mật khẩu"), {
      target: { value: "password" },
    });
    fireEvent.change(screen.getByLabelText("Xác nhận mật khẩu"), {
      target: { value: "password" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Đăng ký" }));

    expect(
      await screen.findByText("Mật khẩu cần có chữ hoa, chữ thường và chữ số"),
    ).toBeTruthy();
    expect(global.fetch).not.toHaveBeenCalled();
  });
});

describe("auth-aware header", () => {
  it("shows login for guests", () => {
    render(<HomepageHeader />);

    expect(screen.getByRole("link", { name: "Đăng nhập" })).toBeTruthy();
    expect(screen.queryByText("Đăng xuất")).toBeNull();
  });

  it("shows customer controls without admin entry", () => {
    render(
      <HomepageHeader
        currentUser={{
          id: "u1",
          email: "user@shopvn.com",
          fullName: "Nguyen Van An",
          roles: ["customer"],
        }}
      />,
    );

    expect(screen.getByText("Nguyen Van An")).toBeTruthy();
    expect(screen.getByText("Đăng xuất")).toBeTruthy();
    expect(screen.queryByRole("link", { name: "Admin" })).toBeNull();
  });

  it("shows admin entry only for admins", () => {
    render(
      <HomepageHeader
        currentUser={{
          id: "u2",
          email: "admin@shopvn.com",
          fullName: "Admin",
          roles: ["admin"],
        }}
      />,
    );

    expect(screen.getByRole("link", { name: "Admin" })).toBeTruthy();
  });
});
