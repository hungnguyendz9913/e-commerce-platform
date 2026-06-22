"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, MapPin, Package, User } from "lucide-react";

const navItems = [
  { label: "Tổng quan", href: "/customer", icon: Home },
  { label: "Hồ sơ", href: "/customer/profile", icon: User },
  { label: "Địa chỉ", href: "/customer/addresses", icon: MapPin },
  { label: "Đơn hàng", href: "/customer/orders", icon: Package },
];

export default function CustomerAccountNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Điều hướng tài khoản"
      className="overflow-x-auto border-b border-slate-200 bg-white"
    >
      <div className="mx-auto flex max-w-[1180px] gap-2 px-4 py-3 sm:px-6">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active =
            item.href === "/customer"
              ? pathname === item.href
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`inline-flex min-h-10 shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-bold transition focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                active
                  ? "bg-blue-600 text-white"
                  : "text-slate-600 hover:bg-slate-100 hover:text-blue-700"
              }`}
              aria-current={active ? "page" : undefined}
            >
              <Icon className="size-4" />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

