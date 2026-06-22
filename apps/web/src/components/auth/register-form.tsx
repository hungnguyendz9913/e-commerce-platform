"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { CheckCircle, Eye, EyeOff, Loader2, UserPlus } from "lucide-react";
import { register } from "@/lib/auth/client";

const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/;
const phonePattern = /^\+?[0-9\s.-]+$/;

export default function RegisterForm() {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const validate = () => {
    const nextErrors: Record<string, string> = {};

    if (!form.fullName.trim()) {
      nextErrors.fullName = "Họ tên không được để trống";
    }

    if (!form.email.trim()) {
      nextErrors.email = "Email không được để trống";
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      nextErrors.email = "Email không hợp lệ";
    }

    if (form.phone.trim() && !phonePattern.test(form.phone.trim())) {
      nextErrors.phone =
        "Số điện thoại chỉ gồm chữ số, khoảng trắng, dấu +, dấu chấm hoặc gạch ngang";
    }

    if (!form.password) {
      nextErrors.password = "Mật khẩu không được để trống";
    } else if (form.password.length < 8) {
      nextErrors.password = "Mật khẩu tối thiểu 8 ký tự";
    } else if (form.password.length > 72) {
      nextErrors.password = "Mật khẩu tối đa 72 ký tự";
    } else if (!passwordPattern.test(form.password)) {
      nextErrors.password =
        "Mật khẩu cần có chữ hoa, chữ thường và chữ số";
    }

    if (!form.confirmPassword) {
      nextErrors.confirmPassword = "Vui lòng xác nhận mật khẩu";
    } else if (form.confirmPassword !== form.password) {
      nextErrors.confirmPassword = "Mật khẩu xác nhận không khớp";
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
      await register({
        email: form.email,
        password: form.password,
        confirmPassword: form.confirmPassword,
        fullName: form.fullName,
        phone: form.phone.trim() || undefined,
      });
      setSuccess(true);
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : "Đăng ký không thành công. Vui lòng thử lại.",
      );
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto mb-4 grid size-16 place-items-center rounded-full bg-emerald-100">
          <CheckCircle className="size-8 text-emerald-600" />
        </div>
        <h1 className="text-xl font-bold text-slate-950">Đăng ký thành công</h1>
        <p className="mt-2 text-sm text-slate-500">
          Tài khoản ShopVN của bạn đã được tạo. Bạn có thể đăng nhập ngay bây
          giờ.
        </p>
        <Link
          href="/login"
          className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Đăng nhập ngay
        </Link>
      </div>
    );
  }

  const fieldClass = (key: keyof typeof form) =>
    `w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition focus:ring-2 ${
      key === "password" || key === "confirmPassword" ? "pr-10" : ""
    } ${
      errors[key]
        ? "border-red-400 focus:ring-red-200"
        : "border-slate-200 focus:border-blue-500 focus:ring-blue-200"
    }`;

  return (
    <div className="w-full max-w-md">
      <div className="mb-8 text-center">
        <UserPlus className="mx-auto mb-3 size-11 rounded-2xl bg-blue-600 p-2.5 text-white" />
        <h1 className="text-2xl font-bold text-slate-950">Tạo tài khoản mới</h1>
        <p className="mt-1 text-sm text-slate-500">
          Tham gia ShopVN để mua sắm dễ dàng hơn.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        {formError ? (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {formError}
          </div>
        ) : null}

        <form className="space-y-4" onSubmit={handleSubmit} noValidate>
          <div>
            <label
              className="mb-1 block text-sm font-medium text-slate-700"
              htmlFor="register-full-name"
            >
              Họ và tên
            </label>
            <input
              id="register-full-name"
              type="text"
              autoComplete="name"
              value={form.fullName}
              onChange={(event) => updateField("fullName", event.target.value)}
              className={fieldClass("fullName")}
              placeholder="Nguyễn Văn An"
            />
            {errors.fullName ? (
              <p className="mt-1 text-xs text-red-600">{errors.fullName}</p>
            ) : null}
          </div>

          <div>
            <label
              className="mb-1 block text-sm font-medium text-slate-700"
              htmlFor="register-email"
            >
              Email
            </label>
            <input
              id="register-email"
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={(event) => updateField("email", event.target.value)}
              className={fieldClass("email")}
              placeholder="you@example.com"
            />
            {errors.email ? (
              <p className="mt-1 text-xs text-red-600">{errors.email}</p>
            ) : null}
          </div>

          <div>
            <label
              className="mb-1 block text-sm font-medium text-slate-700"
              htmlFor="register-phone"
            >
              Số điện thoại
            </label>
            <input
              id="register-phone"
              type="tel"
              autoComplete="tel"
              value={form.phone}
              onChange={(event) => updateField("phone", event.target.value)}
              className={fieldClass("phone")}
              placeholder="0901234567"
            />
            {errors.phone ? (
              <p className="mt-1 text-xs text-red-600">{errors.phone}</p>
            ) : null}
          </div>

          {(["password", "confirmPassword"] as const).map((key) => (
            <div key={key}>
              <label
                className="mb-1 block text-sm font-medium text-slate-700"
                htmlFor={`register-${key}`}
              >
                {key === "password" ? "Mật khẩu" : "Xác nhận mật khẩu"}
              </label>
              <div className="relative">
                <input
                  id={`register-${key}`}
                  type={showPassword ? "text" : "password"}
                  autoComplete={key === "password" ? "new-password" : "off"}
                  value={form[key]}
                  onChange={(event) => updateField(key, event.target.value)}
                  className={fieldClass(key)}
                  placeholder={
                    key === "password" ? "Toi thieu 8 ky tu" : "Nhap lai mat khau"
                  }
                />
                {key === "password" ? (
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
                ) : null}
              </div>
              {errors[key] ? (
                <p className="mt-1 text-xs text-red-600">{errors[key]}</p>
              ) : null}
            </div>
          ))}

          <button
            type="submit"
            disabled={loading}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-400"
          >
            {loading ? <Loader2 className="size-4 animate-spin" /> : null}
            {loading ? "Đang tạo tài khoản..." : "Đăng ký"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-slate-500">
          Đã có tài khoản?{" "}
          <Link
            href="/login"
            className="font-medium text-blue-600 hover:underline"
          >
            Đăng nhập
          </Link>
        </p>
      </div>
    </div>
  );
}
