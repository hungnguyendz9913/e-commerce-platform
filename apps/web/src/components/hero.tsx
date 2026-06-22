import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative isolate w-full overflow-hidden bg-blue-950">
      <Image
        src="/hero-background.jpg"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover object-[62%_50%]"
      />

      <div className="absolute inset-0 bg-blue-950/65" aria-hidden="true" />

      <div className="relative z-10 mx-auto flex min-h-[430px] max-w-[1280px] items-center px-4 py-16 sm:px-6 sm:py-20 lg:min-h-[520px]">
        <div className="max-w-2xl text-white">
          <h1 className="text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
            Mua sắm thông minh,
            <br />
            Giá tốt mỗi ngày
          </h1>

          <p className="mt-6 max-w-xl text-base leading-7 text-white/90 sm:text-lg">
            Khám phá hàng nghìn sản phẩm chất lượng với giá tốt nhất. Giao hàng
            nhanh toàn quốc.
          </p>

          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              href="/products"
              className="flex items-center gap-2 rounded-2xl bg-white px-7 py-4 font-semibold text-blue-600 transition hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-950"
            >
              Mua ngay
              <ArrowRight className="size-5" />
            </Link>

            <Link
              href="/products?category=c1"
              className="rounded-2xl border-2 border-white/50 px-7 py-4 font-semibold text-white transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-950"
            >
              Điện tử hot
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
