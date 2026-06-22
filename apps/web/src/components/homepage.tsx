import type { ReactNode } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Bolt,
  ShieldCheck,
  Search,
  Truck,
} from "lucide-react";
import Hero from "./hero";

type Category = {
  icon: string;
  name: string;
  count: string;
};

type Product = {
  category: string;
  name: string;
  price: string;
  note?: string;
  visual: string;
};

const categories: Category[] = [
  { icon: "⚡", name: "Điện tử", count: "45 SP" },
  { icon: "👗", name: "Thời trang", count: "38 SP" },
  { icon: "🏠", name: "Gia dụng", count: "22 SP" },
];

const featuredProducts: Product[] = [
  {
    category: "Điện thoại",
    name: "iPhone 15 Pro 256GB",
    price: "27.990.000đ",
    visual: "from-zinc-950 to-zinc-700",
  },
  {
    category: "Laptop",
    name: "MacBook Pro M3 14 inch",
    price: "49.990.000đ",
    visual: "from-violet-800 to-blue-500",
  },
  {
    category: "Laptop",
    name: "MacBook Air M2 13 inch",
    price: "32.990.000đ",
    note: "Còn 3 sản phẩm",
    visual: "from-slate-300 to-slate-500",
  },
  {
    category: "Phụ kiện",
    name: "Apple Watch Series 9 GPS 45mm",
    price: "10.990.000đ",
    visual: "from-neutral-50 to-neutral-300",
  },
];

const bestSellers: Product[] = [
  {
    category: "Phụ kiện",
    name: "Apple Watch Series 9 GPS 45mm",
    price: "10.990.000đ",
    visual: "from-neutral-50 to-neutral-300",
  },
  {
    category: "Phụ kiện",
    name: "AirPods Pro 2nd Generation",
    price: "6.290.000đ",
    visual: "from-slate-100 to-slate-300",
  },
  {
    category: "Nhà bếp",
    name: "Máy Xay Sinh Tố Philips ProBlend",
    price: "1.290.000đ",
    visual: "from-sky-200 to-orange-100",
  },
  {
    category: "Điện thoại",
    name: "Xiaomi 14T Pro 256GB",
    price: "19.990.000đ",
    visual: "from-cyan-100 to-slate-200",
  },
];

export default function Homepage() {
  return (
    <>
      <Hero />

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-[1280px] grid-cols-1 gap-4 px-4 py-4 text-sm font-medium text-slate-500 sm:grid-cols-3 sm:px-6">
          <Benefit icon={<Truck className="size-4" />} label="Miễn phí ship đơn trên 500K" />
          <Benefit icon={<ShieldCheck className="size-4" />} label="Đảm bảo chính hãng 100%" />
          <Benefit icon={<Bolt className="size-4" />} label="Giao hàng trong 2 giờ" />
        </div>
      </section>

      <div className="mx-auto max-w-[1280px] px-4 py-10 sm:px-6">
        <div className="mx-auto mb-10 flex max-w-2xl items-center gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4 text-sm text-slate-400 shadow-sm">
          <Search className="size-5 shrink-0 text-slate-400" aria-hidden="true" />
          <span>Bạn muốn tìm gì hôm nay?</span>
        </div>

        <SectionHeader title="Danh mục nổi bật" link="Xem tất cả" href="/products" />
        <div className="mb-12 grid max-w-2xl grid-cols-1 gap-4 sm:grid-cols-3">
          {categories.map((category) => (
            <div
              key={category.name}
              className="rounded-xl border border-slate-200 bg-white p-6 text-center shadow-sm"
            >
              <div className="text-2xl">{category.icon}</div>
              <div className="mt-3 font-semibold text-slate-700">{category.name}</div>
              <div className="mt-1 text-sm text-slate-400">{category.count}</div>
            </div>
          ))}
        </div>

        <SectionHeader title="Sản phẩm nổi bật" link="Xem thêm" href="/products" />
        <ProductGrid products={featuredProducts} />

        <section className="my-14 overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 px-8 py-8 text-white sm:px-10">
          <div className="mb-4 inline-flex rounded-full bg-white/20 px-3 py-1 text-xs font-bold">
            ✨ ƯU ĐÃI ĐẶC BIỆT
          </div>
          <h2 className="text-2xl font-bold sm:text-3xl">Mã SUMMER2024 — Giảm 10%</h2>
          <p className="mt-3 text-white/80">
            Áp dụng cho đơn hàng từ 500.000đ. Số lượng có hạn!
          </p>
          <Link
            href="/products"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 font-bold text-emerald-600 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-emerald-600"
          >
            Mua ngay
            <ArrowRight className="size-4" />
          </Link>
        </section>

        <SectionHeader title="Bán chạy nhất" link="Xem thêm" href="/products" />
        <ProductGrid products={bestSellers} />
      </div>
    </>
  );
}

function Benefit({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <div className="flex items-center justify-center gap-2">
      <span className="text-blue-600">{icon}</span>
      <span>{label}</span>
    </div>
  );
}

function SectionHeader({
  title,
  link,
  href,
}: {
  title: string;
  link: string;
  href: string;
}) {
  return (
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
      <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
      <Link
        href={href}
        className="inline-flex items-center gap-1 rounded-lg font-semibold text-blue-600 transition hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        {link}
        <ArrowRight className="size-4" />
      </Link>
    </div>
  );
}

function ProductGrid({ products }: { products: Product[] }) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {products.map((product) => (
        <article
          key={`${product.name}-${product.price}`}
          className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
        >
          <div className={`flex aspect-square items-center justify-center bg-gradient-to-br ${product.visual}`}>
            <div className="grid size-32 place-items-center rounded-[2rem] bg-white/80 text-5xl shadow-xl">
              {product.category === "Laptop"
                ? "💻"
                : product.category === "Phụ kiện"
                ? "⌚"
                : product.category === "Nhà bếp"
                ? "🥣"
                : "📱"}
            </div>
          </div>
          <div className="p-4">
            <p className="text-sm text-slate-400">{product.category}</p>
            <h3 className="mt-1 min-h-11 font-bold text-slate-700">{product.name}</h3>
            <div className="mt-3 flex items-end justify-between gap-3">
              <div>
                <p className="text-lg font-bold text-blue-600">{product.price}</p>
                {product.note ? (
                  <p className="mt-1 text-sm text-orange-500">{product.note}</p>
                ) : null}
              </div>
              <span className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-500">
                Xem nhanh
              </span>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
