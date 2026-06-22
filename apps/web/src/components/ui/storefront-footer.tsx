import Link from "next/link";
import Logo from "@/components/ui/logo";

const supportLinks = [
  "Trung tâm trợ giúp",
  "Chính sách đổi trả",
  "Hướng dẫn đặt hàng",
];

const aboutLinks = ["Giới thiệu", "Tuyển dụng", "Liên hệ"];

const paymentMethods = ["MoMo", "VNPay", "Stripe", "COD"];

export default function StorefrontFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto grid max-w-[1280px] gap-10 px-4 py-12 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
        <div>
          <Link
            href="/"
            className="inline-flex rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            aria-label="ShopVN - Trang chủ"
          >
            <Logo />
          </Link>
          <p className="mt-4 max-w-xs leading-7 text-slate-500">
            Nền tảng thương mại điện tử hàng đầu Việt Nam. Mua sắm an toàn,
            giao hàng nhanh.
          </p>
        </div>

        <FooterColumn title="Hỗ trợ khách hàng" items={supportLinks} />
        <FooterColumn title="Về chúng tôi" items={aboutLinks} />

        <div>
          <h2 className="font-bold text-slate-900">Thanh toán</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {paymentMethods.map((item) => (
              <span
                key={item}
                className="rounded bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-500"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1280px] border-t border-slate-200 px-4 py-6 text-center text-sm text-slate-400 sm:px-6">
        © 2024 ShopVN. Tất cả quyền được bảo lưu.
      </div>
    </footer>
  );
}

function FooterColumn({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h2 className="font-bold text-slate-900">{title}</h2>
      <div className="mt-4 space-y-3 text-slate-500">
        {items.map((item) => (
          <Link
            key={item}
            className="block rounded-sm transition hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            href="/"
          >
            {item}
          </Link>
        ))}
      </div>
    </div>
  );
}
