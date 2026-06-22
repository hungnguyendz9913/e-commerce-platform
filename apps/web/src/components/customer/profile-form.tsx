"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Loader2, Save } from "lucide-react";
import { AccountError, AccountLoading } from "./account-states";
import { getCustomerProfile, updateCustomerProfile } from "@/lib/customer/account";
import type { CustomerProfile } from "@/lib/customer/types";

type ProfileFormState = {
  fullName: string;
  phone: string;
  avatarUrl: string;
};

type ProfileErrors = Partial<Record<keyof ProfileFormState, string>>;

export default function ProfileForm() {
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [form, setForm] = useState<ProfileFormState>({
    fullName: "",
    phone: "",
    avatarUrl: "",
  });
  const [errors, setErrors] = useState<ProfileErrors>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pageError, setPageError] = useState("");
  const [success, setSuccess] = useState("");

  const loadProfile = async () => {
    setLoading(true);
    setPageError("");

    try {
      const loaded = await getCustomerProfile();
      setProfile(loaded);
      setForm({
        fullName: loaded.fullName,
        phone: loaded.phone ?? "",
        avatarUrl: loaded.avatarUrl ?? "",
      });
    } catch (error) {
      setPageError(
        error instanceof Error ? error.message : "Không thể tải hồ sơ.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadProfile();
  }, []);

  const updateField = (field: keyof ProfileFormState, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: "" }));
    setSuccess("");
  };

  const validate = () => {
    const nextErrors: ProfileErrors = {};

    if (!form.fullName.trim()) {
      nextErrors.fullName = "Vui lòng nhập họ tên.";
    }

    if (form.phone.trim() && !/^\+?[0-9\s.-]+$/.test(form.phone.trim())) {
      nextErrors.phone = "Số điện thoại chỉ gồm số, khoảng trắng, +, . hoặc -.";
    }

    if (form.avatarUrl.trim()) {
      try {
        new URL(form.avatarUrl.trim());
      } catch {
        nextErrors.avatarUrl = "URL ảnh đại diện chưa hợp lệ.";
      }
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!validate()) {
      return;
    }

    setSaving(true);
    setPageError("");
    setSuccess("");

    try {
      const updated = await updateCustomerProfile({
        fullName: form.fullName.trim(),
        phone: form.phone.trim() || undefined,
        avatarUrl: form.avatarUrl.trim() || undefined,
      });
      const refreshed = await getCustomerProfile().catch(() => updated);
      setProfile(refreshed);
      setForm({
        fullName: refreshed.fullName,
        phone: refreshed.phone ?? "",
        avatarUrl: refreshed.avatarUrl ?? "",
      });
      setSuccess("Hồ sơ đã được cập nhật.");
    } catch (error) {
      setPageError(
        error instanceof Error ? error.message : "Không thể cập nhật hồ sơ.",
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <AccountLoading label="Đang tải hồ sơ..." />;
  }

  if (!profile) {
    return <AccountError message={pageError || "Không thể tải hồ sơ."} onRetry={loadProfile} />;
  }

  return (
    <form
      onSubmit={submit}
      noValidate
      className="max-w-3xl rounded-lg border border-slate-200 bg-white p-5"
    >
      {pageError ? <AccountError message={pageError} /> : null}
      {success ? (
        <p className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm font-semibold text-emerald-700">
          {success}
        </p>
      ) : null}

      <div className="grid gap-4">
        <label className="grid gap-2">
          <span className="text-sm font-bold text-slate-700">Email</span>
          <input
            value={profile.email}
            readOnly
            className="h-11 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-500"
          />
        </label>

        <Field
          label="Họ tên"
          value={form.fullName}
          error={errors.fullName}
          onChange={(value) => updateField("fullName", value)}
          required
        />
        <Field
          label="Số điện thoại"
          value={form.phone}
          error={errors.phone}
          onChange={(value) => updateField("phone", value)}
        />
        <Field
          label="URL ảnh đại diện"
          value={form.avatarUrl}
          error={errors.avatarUrl}
          onChange={(value) => updateField("avatarUrl", value)}
        />
      </div>

      <button
        type="submit"
        disabled={saving}
        className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-60"
      >
        {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
        Lưu thay đổi
      </button>
    </form>
  );
}

function Field({
  label,
  value,
  error,
  required,
  onChange,
}: {
  label: string;
  value: string;
  error?: string;
  required?: boolean;
  onChange: (value: string) => void;
}) {
  const id = label.toLowerCase().replace(/\s+/g, "-");

  return (
    <label className="grid gap-2" htmlFor={id}>
      <span className="text-sm font-bold text-slate-700">{label}</span>
      <input
        id={id}
        value={value}
        required={required}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        className="h-11 rounded-lg border border-slate-200 px-3 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
      />
      {error ? (
        <span id={`${id}-error`} className="text-sm font-medium text-red-600">
          {error}
        </span>
      ) : null}
    </label>
  );
}
