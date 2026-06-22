import AccountOverviewClient from "@/components/customer/account-overview-client";

export const metadata = {
  title: "Tổng quan tài khoản",
};

export default function CustomerAccountPage() {
  return (
    <div>
      <PageHeader
        title="Tổng quan tài khoản"
        description="Quản lý thông tin cá nhân, địa chỉ giao hàng và đơn hàng ShopVN."
      />
      <AccountOverviewClient />
    </div>
  );
}

function PageHeader({ title, description }: { title: string; description: string }) {
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-bold text-slate-950">{title}</h1>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">{description}</p>
    </div>
  );
}
