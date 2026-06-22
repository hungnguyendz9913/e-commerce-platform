import AddressesClient from "@/components/customer/addresses-client";

export const metadata = {
  title: "Địa chỉ | ShopVN",
};

export default function CustomerAddressesPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-950">Sổ địa chỉ</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
          Lưu địa chỉ giao hàng. Cập nhật, xóa và đặt mặc định sẽ được bật khi backend cung cấp hợp đồng tương ứng.
        </p>
      </div>
      <AddressesClient />
    </div>
  );
}

