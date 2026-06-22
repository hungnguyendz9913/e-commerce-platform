import RegisterForm from "@/components/auth/register-form";

export const metadata = {
  title: "Đăng ký | ShopVN",
};

export default function RegisterPage() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-slate-50 px-4 py-12">
      <RegisterForm />
    </main>
  );
}
