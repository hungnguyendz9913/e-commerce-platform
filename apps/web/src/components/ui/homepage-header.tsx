import Link from "next/link";
import { ShieldCheck, ShoppingCart, UserCircle } from "lucide-react";
import LogoutButton from "@/components/auth/logout-button";
import Logo from "@/components/ui/logo";
import MobileNavigation, {
  type NavigationItem,
} from "@/components/ui/mobile-navigation";
import SearchBar from "@/components/ui/searchbar";
import type { AuthUser } from "@/lib/auth/types";

const navigationItems: NavigationItem[] = [
  { label: "Tất cả sản phẩm", href: "/products" },
  { label: "Điện tử", href: "/products?category=c1" },
  { label: "Thời trang", href: "/products?category=c5" },
  { label: "Gia dụng", href: "/products?category=c8" },
];

interface HomepageHeaderProps {
  currentUser?: AuthUser | null;
}

export default function HomepageHeader({ currentUser = null }: HomepageHeaderProps) {
  const isAdmin = currentUser?.roles.includes("admin") ?? false;

  return (
    <header className="sticky top-0 z-40 border-b border-slate-100 bg-white">
      <div className="relative mx-auto flex min-h-[70px] w-full max-w-[1280px] flex-wrap items-center gap-x-4 gap-y-3 px-4 py-3 sm:px-6 lg:flex-nowrap">
        <div className="flex min-w-0 flex-1 items-center gap-3 sm:gap-6 lg:flex-none">
          <MobileNavigation items={navigationItems} />

          <Link
            href="/"
            className="inline-flex rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            aria-label="ShopVN - Trang chủ"
          >
            <Logo />
          </Link>

          <div className="hidden w-[520px] max-w-[48vw] min-w-[280px] md:block">
            <SearchBar />
          </div>
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-2 text-sm font-semibold text-slate-800 sm:gap-3">
          <Link
            href="/cart"
            className="grid size-10 place-items-center rounded-xl text-slate-800 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            aria-label="Giỏ hàng"
          >
            <ShoppingCart className="size-6" strokeWidth={2.25} />
          </Link>

          {currentUser ? (
            <>
              {isAdmin ? (
                <Link
                  href="/admin"
                  className="hidden items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-2 transition hover:bg-slate-100 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:inline-flex"
                >
                  <ShieldCheck className="size-4" />
                  <span>Admin</span>
                </Link>
              ) : null}
              <div className="hidden max-w-[180px] items-center gap-1.5 truncate rounded-lg px-2 py-2 text-slate-600 sm:inline-flex">
                <UserCircle className="size-4 shrink-0" />
                <span className="truncate">{currentUser.fullName}</span>
              </div>
              <LogoutButton />
            </>
          ) : (
            <Link
              href="/login"
              className="whitespace-nowrap rounded-lg px-3 py-2 transition hover:bg-slate-100 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Đăng nhập
            </Link>
          )}
        </div>

        <div className="basis-full md:hidden">
          <SearchBar />
        </div>
      </div>

      <nav
        aria-label="Điều hướng chính"
        className="mx-auto hidden h-11 w-full max-w-[1280px] items-center gap-3 overflow-x-auto px-4 text-sm font-semibold text-slate-600 scrollbar-hide sm:px-6 lg:flex"
      >
        {navigationItems.map((item, index) => (
          <Link
            key={item.label}
            href={item.href}
            className={`shrink-0 rounded-lg px-3 py-2 transition hover:bg-slate-100 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              index === 0 ? "text-blue-600" : ""
            }`}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
