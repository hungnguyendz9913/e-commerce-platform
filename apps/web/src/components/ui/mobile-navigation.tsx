"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

export type NavigationItem = {
  label: string;
  href: string;
};

type MobileNavigationProps = {
  items: NavigationItem[];
};

const mobileNavigationId = "storefront-mobile-navigation";

export default function MobileNavigation({ items }: MobileNavigationProps) {
  const [isOpen, setIsOpen] = useState(false);
  const label = isOpen ? "Đóng menu điều hướng" : "Mở menu điều hướng";

  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-controls={mobileNavigationId}
        aria-expanded={isOpen}
        aria-label={label}
        onClick={() => setIsOpen((current) => !current)}
        className="grid size-10 place-items-center rounded-xl text-slate-800 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        {isOpen ? <X className="size-5" /> : <Menu className="size-5" />}
      </button>

      <div
        id={mobileNavigationId}
        hidden={!isOpen}
        className="absolute left-0 right-0 top-full z-30 border-b border-slate-200 bg-white shadow-lg"
      >
        <nav aria-label="Điều hướng di động" className="mx-auto max-w-[1280px] px-4 py-3">
          <div className="grid gap-1">
            {items.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className="rounded-lg px-3 py-3 text-left text-sm font-semibold text-slate-700 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </nav>
      </div>
    </div>
  );
}
