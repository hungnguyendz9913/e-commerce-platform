import HomepageHeader from "@/components/ui/homepage-header";
import StorefrontFooter from "@/components/ui/storefront-footer";
import { getCurrentUserFromCookies } from "@/lib/auth/server";

export default async function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getCurrentUserFromCookies();

  return (
    <div className="min-h-dvh bg-slate-50 text-slate-900">
      <HomepageHeader currentUser={session.user} />
      <main>{children}</main>
      <StorefrontFooter />
    </div>
  );
}
