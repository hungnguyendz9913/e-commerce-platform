import OrdersClient from "@/components/customer/orders-client";

export const metadata = {
  title: "Đơn hàng | ShopVN",
};

export default function CustomerOrdersPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-950">Đơn hàng của tôi</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
          Theo dõi trạng thái xử lý, giao hàng và thanh toán của các đơn hàng.
        </p>
      </div>
      <OrdersClient />
    </div>
  );
}

