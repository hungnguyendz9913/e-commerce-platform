import LoginForm from "@/components/auth/login-form";

interface LoginPageProps {
  searchParams?: Promise<{
    redirectTo?: string | string[];
  }>;
}

export const metadata = {
  title: "Đăng nhập | ShopVN",
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const redirectTo = Array.isArray(params?.redirectTo)
    ? params?.redirectTo[0]
    : params?.redirectTo;

  return (
    <main className="flex min-h-dvh items-center justify-center bg-slate-50 px-4 py-12">
      <LoginForm redirectTo={redirectTo} />
    </main>
  );
}
