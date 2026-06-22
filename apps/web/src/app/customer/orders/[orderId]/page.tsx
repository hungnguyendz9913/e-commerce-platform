import OrderDetailClient from "@/components/customer/order-detail-client";

type CustomerOrderDetailPageProps = {
  params: Promise<{ orderId: string }>;
};

export const metadata = {
  title: "Chi tiết đơn hàng | ShopVN",
};

export default async function CustomerOrderDetailPage({
  params,
}: CustomerOrderDetailPageProps) {
  const { orderId } = await params;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-950">Chi tiết đơn hàng</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
          Thông tin sản phẩm, giao hàng, thanh toán và trạng thái xử lý.
        </p>
      </div>
      <OrderDetailClient orderId={orderId} />
    </div>
  );
}

