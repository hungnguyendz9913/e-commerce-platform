import HomepageHeader from "@/components/ui/homepage-header";
import StorefrontFooter from "@/components/ui/storefront-footer";
import CustomerAccountNav from "@/components/customer/account-nav";
import { getCurrentUserFromCookies } from "@/lib/auth/server";

export const metadata = {
  title: "Tài khoản | ShopVN",
};

export default async function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getCurrentUserFromCookies();

  return (
    <div className="min-h-dvh bg-slate-50 text-slate-900">
      <HomepageHeader currentUser={session.user} />
      <CustomerAccountNav />
      <main className="mx-auto w-full max-w-[1180px] px-4 py-8 sm:px-6">
        {children}
      </main>
      <StorefrontFooter />
    </div>
  );
}

