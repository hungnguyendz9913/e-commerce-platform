"use client";

import { useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, Eye, EyeOff, Loader2, LogIn } from "lucide-react";
import { login } from "@/lib/auth/client";
import {
  defaultAuthenticatedPath,
  sanitizeRedirectTo,
} from "@/lib/auth/redirects";

interface LoginFormProps {
  redirectTo?: string;
}

export default function LoginForm({ redirectTo }: LoginFormProps) {
  const router = useRouter();
  const safeRedirectTo = useMemo(
    () => sanitizeRedirectTo(redirectTo, ""),
    [redirectTo],
  );
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const nextErrors: Record<string, string> = {};

    if (!form.email.trim()) {
      nextErrors.email = "Email không được để trống";
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      nextErrors.email = "Email không hợp lệ";
    }

    if (!form.password) {
      nextErrors.password = "Mật khẩu không được để trống";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const updateField = (field: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: "" }));
    setFormError("");
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!validate()) {
      return;
    }

    setLoading(true);
    setFormError("");

    try {
      const result = await login({
        email: form.email,
        password: form.password,
      });
      const destination =
        safeRedirectTo || defaultAuthenticatedPath(result.data.user);
      router.push(destination);
      router.refresh();
    } catch {
      setFormError("Email hoặc mật khẩu không đúng. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="mb-8 text-center">
        <div className="mb-4 flex justify-center">
          <Link
            href="/"
            className="rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            aria-label="ShopVN - Trang chủ"
          >
            <span className="sr-only">ShopVN</span>
            <div className="scale-110">
              <LogIn className="mx-auto mb-3 size-11 rounded-2xl bg-blue-600 p-2.5 text-white" />
            </div>
          </Link>
        </div>
        <h1 className="text-2xl font-bold text-slate-950">Đăng nhập ShopVN</h1>
        <p className="mt-1 text-sm text-slate-500">
          Chào mừng bạn quay trở lại.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        {formError ? (
          <div className="mb-4 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
            <p>{formError}</p>
          </div>
        ) : null}

        <form className="space-y-4" onSubmit={handleSubmit} noValidate>
          <div>
            <label
              className="mb-1 block text-sm font-medium text-slate-700"
              htmlFor="login-email"
            >
              Email
            </label>
            <input
              id="login-email"
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={(event) => updateField("email", event.target.value)}
              className={`w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition focus:ring-2 ${
                errors.email
                  ? "border-red-400 focus:ring-red-200"
                  : "border-slate-200 focus:border-blue-500 focus:ring-blue-200"
              }`}
              placeholder="you@example.com"
            />
            {errors.email ? (
              <p className="mt-1 text-xs text-red-600">{errors.email}</p>
            ) : null}
          </div>

          <div>
            <label
              className="mb-1 block text-sm font-medium text-slate-700"
              htmlFor="login-password"
            >
              Mật khẩu
            </label>
            <div className="relative">
              <input
                id="login-password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                value={form.password}
                onChange={(event) =>
                  updateField("password", event.target.value)
                }
                className={`w-full rounded-lg border px-3 py-2.5 pr-10 text-sm outline-none transition focus:ring-2 ${
                  errors.password
                    ? "border-red-400 focus:ring-red-200"
                    : "border-slate-200 focus:border-blue-500 focus:ring-blue-200"
                }`}
                placeholder="Nhap mat khau"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded text-slate-400 hover:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                onClick={() => setShowPassword((current) => !current)}
                aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
              >
                {showPassword ? (
                  <EyeOff className="size-4" />
                ) : (
                  <Eye className="size-4" />
                )}
              </button>
            </div>
            {errors.password ? (
              <p className="mt-1 text-xs text-red-600">{errors.password}</p>
            ) : null}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-400"
          >
            {loading ? <Loader2 className="size-4 animate-spin" /> : null}
            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-slate-500">
          Chưa có tài khoản?{" "}
          <Link
            href="/register"
            className="font-medium text-blue-600 hover:underline"
          >
            Đăng ký ngay
          </Link>
        </p>
      </div>
    </div>
  );
}
