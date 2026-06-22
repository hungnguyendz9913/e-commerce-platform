"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  AdminConfirmDialog,
  AdminInput,
  AdminModal,
  AdminSelect,
} from "@/components/admin/admin-ui";
import {
  createAdminCategory,
  createAdminProduct,
  createAdminVoucher,
  deactivateAdminVoucher,
  deleteAdminCategory,
  deleteAdminProduct,
  updateAdminCategory,
  updateAdminProduct,
  updateAdminVoucher,
} from "@/lib/admin/service";
import type { AdminCategory, AdminProduct, AdminVoucher } from "@/lib/admin/types";

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function FormError({ message }: { message?: string }) {
  return message ? (
    <p className="rounded-lg bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
      {message}
    </p>
  ) : null;
}

function ModalButtons({
  busy,
  onCancel,
  submitLabel,
}: {
  busy: boolean;
  onCancel: () => void;
  submitLabel: string;
}) {
  return (
    <div className="flex justify-end gap-3">
      <button
        type="button"
        onClick={onCancel}
        disabled={busy}
        className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
      >
        Hủy
      </button>
      <button
        type="submit"
        disabled={busy}
        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-blue-700 disabled:opacity-60"
      >
        {busy ? "Đang lưu..." : submitLabel}
      </button>
    </div>
  );
}

export function ProductFormButton({
  product,
  categories,
}: {
  product?: AdminProduct;
  categories: AdminCategory[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();

  async function submit(formData: FormData) {
    setBusy(true);
    setError(undefined);

    try {
      const payload = {
        sku: String(formData.get("sku") ?? "").trim(),
        name: String(formData.get("name") ?? "").trim(),
        slug: String(formData.get("slug") ?? "").trim(),
        description: String(formData.get("description") ?? "").trim() || undefined,
        price: Number(formData.get("price") ?? 0),
        categoryId: String(formData.get("categoryId") ?? ""),
        status: String(formData.get("status") ?? "ACTIVE"),
        approvalStatus: String(formData.get("approvalStatus") ?? "PENDING"),
        images: String(formData.get("imageUrl") ?? "").trim()
          ? [{ imageUrl: String(formData.get("imageUrl") ?? "").trim(), sortOrder: 0 }]
          : [],
        inventory: {
          stockQuantity: Number(formData.get("stockQuantity") ?? 0),
          reservedQuantity: Number(formData.get("reservedQuantity") ?? 0),
        },
      };

      if (!payload.sku || !payload.name || !payload.slug || !payload.categoryId) {
        setError("Vui lòng nhập SKU, tên, slug và danh mục.");
        return;
      }

      if (product) {
        await updateAdminProduct(product.id, payload);
      } else {
        await createAdminProduct(payload);
      }

      setOpen(false);
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Không thể lưu sản phẩm.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={product ? "text-sm font-bold text-blue-700 hover:text-blue-800" : "inline-flex rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-blue-700"}
      >
        {product ? "Sửa" : "Tạo sản phẩm"}
      </button>
      {open ? (
        <AdminModal title={product ? "Sửa sản phẩm" : "Tạo sản phẩm"}>
          <form action={submit} className="grid gap-3">
            <FormError message={error} />
            <AdminInput name="sku" placeholder="SKU" defaultValue={product?.sku} required />
            <AdminInput name="name" placeholder="Tên sản phẩm" defaultValue={product?.name} required />
            <AdminInput name="slug" placeholder="Slug" defaultValue={product?.slug ?? slugify(product?.name ?? "")} required />
            <AdminInput name="description" placeholder="Mô tả" defaultValue={product?.description} />
            <AdminInput name="price" type="number" min={0} step={1000} placeholder="Giá" defaultValue={product?.price ?? 0} required />
            <AdminSelect name="categoryId" defaultValue={product?.categoryId ?? ""} required aria-label="Danh mục">
              <option value="" disabled>Chọn danh mục</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </AdminSelect>
            <AdminInput name="imageUrl" placeholder="URL ảnh chính" defaultValue={product?.imageUrl} />
            <div className="grid gap-3 sm:grid-cols-2">
              <AdminSelect name="status" defaultValue={product?.status ?? "ACTIVE"} aria-label="Trạng thái">
                <option value="ACTIVE">Đang bán</option>
                <option value="INACTIVE">Tạm ẩn</option>
                <option value="ARCHIVED">Lưu trữ</option>
              </AdminSelect>
              <AdminSelect name="approvalStatus" defaultValue={product?.approvalStatus ?? "PENDING"} aria-label="Duyệt">
                <option value="PENDING">Chờ duyệt</option>
                <option value="APPROVED">Đã duyệt</option>
                <option value="REJECTED">Từ chối</option>
              </AdminSelect>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <AdminInput name="stockQuantity" type="number" min={0} placeholder="Tồn kho" defaultValue={product?.inventory.stockQuantity ?? 0} />
              <AdminInput name="reservedQuantity" type="number" min={0} placeholder="Đã giữ" defaultValue={product?.inventory.reservedQuantity ?? 0} />
            </div>
            <ModalButtons busy={busy} onCancel={() => setOpen(false)} submitLabel="Lưu sản phẩm" />
          </form>
        </AdminModal>
      ) : null}
    </>
  );
}

export function ProductDeleteButton({ product }: { product: AdminProduct }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  async function confirm() {
    setBusy(true);
    try {
      await deleteAdminProduct(product.id);
      router.refresh();
      setOpen(false);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="text-sm font-bold text-red-700 hover:text-red-800">
        Xóa
      </button>
      {open ? (
        <AdminConfirmDialog
          title="Xóa hoặc lưu trữ sản phẩm"
          description={`Xác nhận thao tác với ${product.name}. Backend sẽ quyết định xóa cứng hay lưu trữ theo rule hiện có.`}
          confirmLabel="Xác nhận"
          busy={busy}
          onCancel={() => setOpen(false)}
          onConfirm={confirm}
        />
      ) : null}
    </>
  );
}

export function CategoryFormButton({ category }: { category?: AdminCategory }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();

  async function submit(formData: FormData) {
    setBusy(true);
    setError(undefined);
    try {
      const payload = {
        name: String(formData.get("name") ?? "").trim(),
        slug: String(formData.get("slug") ?? "").trim(),
        description: String(formData.get("description") ?? "").trim() || undefined,
        status: String(formData.get("status") ?? "ACTIVE"),
      };

      if (!payload.name || !payload.slug) {
        setError("Vui lòng nhập tên và slug.");
        return;
      }

      if (category) {
        await updateAdminCategory(category.id, payload);
      } else {
        await createAdminCategory(payload);
      }

      setOpen(false);
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Không thể lưu danh mục.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={category ? "text-sm font-bold text-blue-700 hover:text-blue-800" : "inline-flex rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-blue-700"}
      >
        {category ? "Sửa" : "Tạo danh mục"}
      </button>
      {open ? (
        <AdminModal title={category ? "Sửa danh mục" : "Tạo danh mục"}>
          <form action={submit} className="grid gap-3">
            <FormError message={error} />
            <AdminInput name="name" placeholder="Tên danh mục" defaultValue={category?.name} required />
            <AdminInput name="slug" placeholder="Slug" defaultValue={category?.slug} required />
            <AdminInput name="description" placeholder="Mô tả" defaultValue={category?.description} />
            <AdminSelect name="status" defaultValue={category?.status ?? "ACTIVE"} aria-label="Trạng thái">
              <option value="ACTIVE">Hoạt động</option>
              <option value="INACTIVE">Tạm ẩn</option>
            </AdminSelect>
            <ModalButtons busy={busy} onCancel={() => setOpen(false)} submitLabel="Lưu danh mục" />
          </form>
        </AdminModal>
      ) : null}
    </>
  );
}

export function CategoryDeleteButton({ category }: { category: AdminCategory }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  async function confirm() {
    setBusy(true);
    try {
      await deleteAdminCategory(category.id);
      router.refresh();
      setOpen(false);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="text-sm font-bold text-red-700 hover:text-red-800">
        Xóa
      </button>
      {open ? (
        <AdminConfirmDialog
          title="Xóa danh mục"
          description={`Xác nhận xóa ${category.name}. Nếu backend từ chối do ràng buộc sản phẩm, giao diện sẽ giữ trạng thái hiện tại.`}
          confirmLabel="Xóa danh mục"
          busy={busy}
          onCancel={() => setOpen(false)}
          onConfirm={confirm}
        />
      ) : null}
    </>
  );
}

export function VoucherFormButton({ voucher }: { voucher?: AdminVoucher }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();

  async function submit(formData: FormData) {
    setBusy(true);
    setError(undefined);
    try {
      const payload = {
        code: String(formData.get("code") ?? "").trim(),
        discountType: String(formData.get("discountType") ?? "PERCENTAGE"),
        discountValue: Number(formData.get("discountValue") ?? 0),
        minimumOrderAmount: Number(formData.get("minimumOrderAmount") ?? 0),
        usageLimit: Number(formData.get("usageLimit") ?? 0) || undefined,
        startsAt: String(formData.get("startsAt") ?? "") || undefined,
        expiresAt: String(formData.get("expiresAt") ?? "") || undefined,
      };

      if (!payload.code || payload.discountValue <= 0) {
        setError("Vui lòng nhập mã và giá trị giảm hợp lệ.");
        return;
      }

      if (voucher) {
        await updateAdminVoucher(voucher.id, payload);
      } else {
        await createAdminVoucher(payload);
      }

      setOpen(false);
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Không thể lưu voucher.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={voucher ? "text-sm font-bold text-blue-700 hover:text-blue-800" : "inline-flex rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-blue-700"}
      >
        {voucher ? "Sửa" : "Tạo voucher"}
      </button>
      {open ? (
        <AdminModal title={voucher ? "Sửa voucher" : "Tạo voucher"}>
          <form action={submit} className="grid gap-3">
            <FormError message={error} />
            <AdminInput name="code" placeholder="Mã voucher" defaultValue={voucher?.code} required />
            <AdminSelect name="discountType" defaultValue={voucher?.discountType ?? "PERCENTAGE"} aria-label="Loại giảm">
              <option value="PERCENTAGE">Phần trăm</option>
              <option value="FIXED_AMOUNT">Số tiền</option>
            </AdminSelect>
            <AdminInput name="discountValue" type="number" min={1} placeholder="Giá trị giảm" defaultValue={voucher?.discountValue ?? 0} required />
            <AdminInput name="minimumOrderAmount" type="number" min={0} placeholder="Đơn tối thiểu" defaultValue={voucher?.minimumOrderAmount ?? 0} />
            <AdminInput name="usageLimit" type="number" min={0} placeholder="Giới hạn lượt dùng" defaultValue={voucher?.usageLimit ?? 0} />
            <div className="grid gap-3 sm:grid-cols-2">
              <AdminInput name="startsAt" type="datetime-local" aria-label="Ngày bắt đầu" />
              <AdminInput name="expiresAt" type="datetime-local" aria-label="Ngày hết hạn" />
            </div>
            <ModalButtons busy={busy} onCancel={() => setOpen(false)} submitLabel="Lưu voucher" />
          </form>
        </AdminModal>
      ) : null}
    </>
  );
}

export function VoucherDeactivateButton({ voucher }: { voucher: AdminVoucher }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  async function confirm() {
    setBusy(true);
    try {
      await deactivateAdminVoucher(voucher.id);
      router.refresh();
      setOpen(false);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} disabled={!voucher.active} className="text-sm font-bold text-red-700 hover:text-red-800 disabled:text-slate-400">
        Ngưng
      </button>
      {open ? (
        <AdminConfirmDialog
          title="Ngưng voucher"
          description={`Xác nhận ngưng mã ${voucher.code}. Giao diện không cung cấp hard-delete vì backend chỉ hỗ trợ deactivate.`}
          confirmLabel="Ngưng voucher"
          busy={busy}
          onCancel={() => setOpen(false)}
          onConfirm={confirm}
        />
      ) : null}
    </>
  );
}
