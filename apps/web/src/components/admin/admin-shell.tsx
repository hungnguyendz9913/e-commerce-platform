"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  BarChart3,
  ClipboardCheck,
  FileClock,
  Gift,
  Home,
  LayoutDashboard,
  Menu,
  Package,
  ShoppingCart,
  Store,
  Users,
  WalletCards,
  Warehouse,
  Webhook,
  X,
} from "lucide-react";
import LogoutButton from "@/components/auth/logout-button";
import Logo from "@/components/ui/logo";
import type { AuthUser } from "@/lib/auth/types";

const navItems = [
  { href: "/admin", label: "Tổng quan", icon: LayoutDashboard },
  { href: "/admin/products", label: "Sản phẩm", icon: Package },
  { href: "/admin/categories", label: "Danh mục", icon: Store },
  { href: "/admin/inventory", label: "Tồn kho", icon: Warehouse },
  { href: "/admin/orders", label: "Đơn hàng", icon: ShoppingCart },
  { href: "/admin/customers", label: "Khách hàng", icon: Users },
  { href: "/admin/approvals", label: "Duyệt hàng", icon: ClipboardCheck },
  { href: "/admin/vouchers", label: "Voucher", icon: Gift },
  { href: "/admin/revenue", label: "Doanh thu", icon: BarChart3 },
  { href: "/admin/payments", label: "Thanh toán", icon: WalletCards },
  { href: "/admin/webhooks", label: "Webhook", icon: Webhook },
  { href: "/admin/audit-logs", label: "Audit logs", icon: FileClock },
];

function isActive(pathname: string, href: string) {
  return href === "/admin" ? pathname === href : pathname.startsWith(href);
}

function sectionLabel(pathname: string) {
  return navItems.find((item) => isActive(pathname, item.href))?.label ?? "Admin";
}

function Sidebar({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  return (
    <aside className="flex h-full w-72 flex-col border-r border-slate-200 bg-white">
      <div className="flex h-16 items-center border-b border-slate-200 px-5">
        <Link href="/admin" onClick={onNavigate} aria-label="ShopVN admin">
          <Logo />
        </Link>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4" aria-label="Admin navigation">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(pathname, item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={[
                "flex min-h-10 items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-blue-500",
                active
                  ? "bg-blue-50 text-blue-700"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-950",
              ].join(" ")}
            >
              <Icon className="size-4 shrink-0" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-slate-200 p-3">
        <Link
          href="/"
          className="flex min-h-10 items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-slate-950 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <Home className="size-4" />
          <span>Về cửa hàng</span>
        </Link>
      </div>
    </aside>
  );
}

export default function AdminShell({
  currentUser,
  children,
}: {
  currentUser: AuthUser | null;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const title = sectionLabel(pathname);

  return (
    <div className="min-h-dvh bg-slate-100 text-slate-950">
      <div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:block">
        <Sidebar pathname={pathname} />
      </div>

      {open ? (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
          <button
            type="button"
            className="absolute inset-0 bg-slate-950/40"
            aria-label="Đóng menu"
            onClick={() => setOpen(false)}
          />
          <div className="relative h-full max-w-80">
            <Sidebar pathname={pathname} onNavigate={() => setOpen(false)} />
          </div>
        </div>
      ) : null}

      <div className="lg:pl-72">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="inline-flex size-10 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 lg:hidden"
              aria-label="Mở menu quản trị"
            >
              <Menu className="size-5" />
            </button>
            {open ? (
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="sr-only"
                aria-label="Đóng menu quản trị"
              >
                <X className="size-5" />
              </button>
            ) : null}
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase text-blue-600">ShopVN Admin</p>
              <h1 className="truncate text-lg font-bold text-slate-950">{title}</h1>
            </div>
          </div>
          <div className="flex min-w-0 items-center gap-3 text-sm">
            <div className="hidden min-w-0 text-right sm:block">
              <p className="truncate font-semibold text-slate-900">
                {currentUser?.fullName || currentUser?.email || "Admin"}
              </p>
              <p className="truncate text-xs text-slate-500">{currentUser?.email}</p>
            </div>
            <LogoutButton />
          </div>
        </header>
        <main className="mx-auto w-full max-w-[1440px] px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
