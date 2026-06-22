"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Loader2, MapPin, Plus, Star, Trash2 } from "lucide-react";
import { AccountEmpty, AccountError, AccountLoading, ConfirmDialog } from "./account-states";
import {
  createCustomerAddress,
  customerMutationSupport,
  getCustomerAddresses,
  unsupportedAddressMutationMessage,
} from "@/lib/customer/account";
import { compactAddress } from "@/lib/customer/normalizers";
import type { CustomerAddress, CustomerAddressPayload } from "@/lib/customer/types";

type AddressFormState = CustomerAddressPayload;
type AddressErrors = Partial<Record<keyof AddressFormState, string>>;

const emptyForm: AddressFormState = {
  recipientName: "",
  phone: "",
  addressLine: "",
  ward: "",
  district: "",
  city: "",
  country: "Việt Nam",
  isDefault: false,
};

export default function AddressesClient() {
  const [addresses, setAddresses] = useState<CustomerAddress[]>([]);
  const [form, setForm] = useState<AddressFormState>(emptyForm);
  const [errors, setErrors] = useState<AddressErrors>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pageError, setPageError] = useState("");
  const [notice, setNotice] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<CustomerAddress | null>(null);

  const loadAddresses = async () => {
    setLoading(true);
    setPageError("");

    try {
      setAddresses(await getCustomerAddresses());
    } catch (error) {
      setPageError(
        error instanceof Error ? error.message : "Không thể tải địa chỉ.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadAddresses();
  }, []);

  const updateField = (field: keyof AddressFormState, value: string | boolean) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: "" }));
    setNotice("");
  };

  const validate = () => {
    const nextErrors: AddressErrors = {};

    for (const field of ["recipientName", "phone", "addressLine", "city", "country"] as const) {
      if (!String(form[field]).trim()) {
        nextErrors[field] = "Thông tin này là bắt buộc.";
      }
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const createAddress = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!validate()) {
      return;
    }

    setSaving(true);
    setPageError("");

    try {
      const created = await createCustomerAddress({
        recipientName: form.recipientName.trim(),
        phone: form.phone.trim(),
        addressLine: form.addressLine.trim(),
        ward: form.ward?.trim() || undefined,
        district: form.district?.trim() || undefined,
        city: form.city.trim(),
        country: form.country.trim(),
        isDefault: form.isDefault,
      });
      setAddresses((current) =>
        created.isDefault
          ? [created, ...current.map((address) => ({ ...address, isDefault: false }))]
          : [created, ...current],
      );
      setForm(emptyForm);
      setNotice("Đã thêm địa chỉ mới.");
    } catch (error) {
      setPageError(
        error instanceof Error ? error.message : "Không thể thêm địa chỉ.",
      );
    } finally {
      setSaving(false);
    }
  };

  const unsupported = () => {
    setNotice(unsupportedAddressMutationMessage());
  };

  if (loading) {
    return <AccountLoading label="Đang tải sổ địa chỉ..." />;
  }

  if (pageError && addresses.length === 0) {
    return <AccountError message={pageError} onRetry={loadAddresses} />;
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
      <section className="space-y-4">
        {pageError ? <AccountError message={pageError} onRetry={loadAddresses} /> : null}
        {notice ? (
          <p className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm font-semibold text-blue-700">
            {notice}
          </p>
        ) : null}

        {addresses.length ? (
          <div className="grid gap-4">
            {addresses.map((address) => (
              <article
                key={address.id}
                className="rounded-lg border border-slate-200 bg-white p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-bold text-slate-950">{address.recipientName}</h2>
                      {address.isDefault ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700 ring-1 ring-amber-200">
                          <Star className="size-3" />
                          Mặc định
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-1 text-sm font-medium text-slate-600">{address.phone}</p>
                    <p className="mt-2 text-sm leading-6 text-slate-500">
                      {compactAddress(address)}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <button
                      type="button"
                      onClick={unsupported}
                      disabled={!customerMutationSupport.canSetDefaultAddress}
                      className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-bold text-slate-600 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Đặt mặc định
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(address)}
                      disabled={!customerMutationSupport.canDeleteAddress}
                      className="grid size-10 place-items-center rounded-lg border border-slate-200 text-slate-600 disabled:cursor-not-allowed disabled:opacity-50"
                      aria-label="Xóa địa chỉ"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <AccountEmpty
            title="Chưa có địa chỉ"
            description="Thêm địa chỉ giao hàng để thanh toán nhanh hơn trong lần mua kế tiếp."
          />
        )}
      </section>

      <form
        onSubmit={createAddress}
        noValidate
        className="self-start rounded-lg border border-slate-200 bg-white p-5"
      >
        <div className="mb-4 flex items-center gap-2">
          <Plus className="size-5 text-blue-600" />
          <h2 className="text-lg font-bold text-slate-950">Thêm địa chỉ</h2>
        </div>

        <div className="grid gap-3">
          <AddressField label="Người nhận" value={form.recipientName} error={errors.recipientName} onChange={(value) => updateField("recipientName", value)} />
          <AddressField label="Số điện thoại" value={form.phone} error={errors.phone} onChange={(value) => updateField("phone", value)} />
          <AddressField label="Địa chỉ" value={form.addressLine} error={errors.addressLine} onChange={(value) => updateField("addressLine", value)} />
          <AddressField label="Phường/Xã" value={form.ward ?? ""} onChange={(value) => updateField("ward", value)} />
          <AddressField label="Quận/Huyện" value={form.district ?? ""} onChange={(value) => updateField("district", value)} />
          <AddressField label="Tỉnh/Thành phố" value={form.city} error={errors.city} onChange={(value) => updateField("city", value)} />
          <AddressField label="Quốc gia" value={form.country} error={errors.country} onChange={(value) => updateField("country", value)} />
          <label className="flex items-center gap-2 text-sm font-bold text-slate-700">
            <input
              type="checkbox"
              checked={form.isDefault}
              onChange={(event) => updateField("isDefault", event.target.checked)}
              className="size-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            Đặt làm mặc định
          </label>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-60"
        >
          {saving ? <Loader2 className="size-4 animate-spin" /> : <MapPin className="size-4" />}
          Lưu địa chỉ
        </button>
      </form>

      {deleteTarget ? (
        <ConfirmDialog
          title="Xóa địa chỉ?"
          description="API hiện chưa hỗ trợ xóa địa chỉ, nên thao tác này đang được tắt để tránh dữ liệu giả."
          confirmLabel="Đã hiểu"
          onCancel={() => setDeleteTarget(null)}
          onConfirm={() => {
            setDeleteTarget(null);
            unsupported();
          }}
        />
      ) : null}
    </div>
  );
}

function AddressField({
  label,
  value,
  error,
  onChange,
}: {
  label: string;
  value: string;
  error?: string;
  onChange: (value: string) => void;
}) {
  const id = `address-${label.toLowerCase().replace(/\W+/g, "-")}`;

  return (
    <label className="grid gap-1.5" htmlFor={id}>
      <span className="text-sm font-bold text-slate-700">{label}</span>
      <input
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        className="h-10 rounded-lg border border-slate-200 px-3 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
      />
      {error ? (
        <span id={`${id}-error`} className="text-sm font-medium text-red-600">
          {error}
        </span>
      ) : null}
    </label>
  );
}
