import Link from "next/link";
import type { ReactNode } from "react";
import { AlertCircle, Loader2, PackageOpen } from "lucide-react";
import type { AdminStatusPresentation } from "@/lib/admin/status";

const toneClasses: Record<AdminStatusPresentation["tone"], string> = {
  slate: "bg-slate-100 text-slate-700 ring-slate-200",
  blue: "bg-blue-50 text-blue-700 ring-blue-200",
  green: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  amber: "bg-amber-50 text-amber-800 ring-amber-200",
  red: "bg-red-50 text-red-700 ring-red-200",
  purple: "bg-violet-50 text-violet-700 ring-violet-200",
};

export function AdminPageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h2 className="text-2xl font-bold text-slate-950">{title}</h2>
        {description ? <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

export function AdminPanel({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <section className={`rounded-lg border border-slate-200 bg-white shadow-sm ${className}`}>
      {children}
    </section>
  );
}

export function AdminStatusBadge({ status }: { status: AdminStatusPresentation }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold ring-1 ${toneClasses[status.tone]}`}>
      {status.label}
    </span>
  );
}

export function AdminEmpty({
  title,
  description,
  actionHref,
  actionLabel,
}: {
  title: string;
  description: string;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <div className="grid min-h-64 place-items-center p-8 text-center">
      <div>
        <PackageOpen className="mx-auto size-10 text-slate-400" />
        <h3 className="mt-4 text-lg font-bold text-slate-950">{title}</h3>
        <p className="mt-2 max-w-lg text-sm leading-6 text-slate-500">{description}</p>
        {actionHref && actionLabel ? (
          <Link
            href={actionHref}
            className="mt-5 inline-flex rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            {actionLabel}
          </Link>
        ) : null}
      </div>
    </div>
  );
}

export function AdminError({ message, retryHref }: { message: string; retryHref?: string }) {
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
      <div className="flex items-start gap-3">
        <AlertCircle className="mt-0.5 size-4 shrink-0" />
        <p className="font-medium">{message}</p>
      </div>
      {retryHref ? (
        <Link
          href={retryHref}
          className="mt-3 inline-flex rounded-lg bg-white px-3 py-2 text-sm font-bold text-red-700 ring-1 ring-red-200 transition hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500"
        >
          Thử lại
        </Link>
      ) : null}
    </div>
  );
}

export function AdminLoading({ label = "Đang tải dữ liệu quản trị..." }: { label?: string }) {
  return (
    <div className="flex min-h-64 items-center justify-center rounded-lg border border-slate-200 bg-white p-8 text-sm font-semibold text-slate-600">
      <Loader2 className="mr-2 size-5 animate-spin text-blue-600" />
      {label}
    </div>
  );
}

export function AdminTable({
  columns,
  children,
}: {
  columns: string[];
  children: ReactNode;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[760px] text-left text-sm">
        <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
          <tr>
            {columns.map((column) => (
              <th key={column} scope="col" className="px-4 py-3 font-bold">
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">{children}</tbody>
      </table>
    </div>
  );
}

export function AdminPagination({
  page,
  totalPages,
  basePath,
}: {
  page: number;
  totalPages: number;
  basePath: string;
}) {
  if (totalPages <= 1) {
    return null;
  }

  const previous = Math.max(1, page - 1);
  const next = Math.min(totalPages, page + 1);

  return (
    <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3 text-sm">
      <span className="font-semibold text-slate-600">
        Trang {page}/{totalPages}
      </span>
      <div className="flex gap-2">
        <Link
          href={`${basePath}?page=${previous}`}
          aria-disabled={page <= 1}
          className="rounded-lg border border-slate-200 px-3 py-2 font-bold text-slate-700 transition hover:bg-slate-50 aria-disabled:pointer-events-none aria-disabled:opacity-50"
        >
          Trước
        </Link>
        <Link
          href={`${basePath}?page=${next}`}
          aria-disabled={page >= totalPages}
          className="rounded-lg border border-slate-200 px-3 py-2 font-bold text-slate-700 transition hover:bg-slate-50 aria-disabled:pointer-events-none aria-disabled:opacity-50"
        >
          Sau
        </Link>
      </div>
    </div>
  );
}

export function AdminFilterBar({ children }: { children: ReactNode }) {
  return <div className="grid gap-3 border-b border-slate-200 p-4 md:grid-cols-4">{children}</div>;
}

export function AdminModal({
  title,
  children,
  footer,
}: {
  title: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-slate-950/40 px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="admin-modal-title"
    >
      <div className="max-h-[90dvh] w-full max-w-2xl overflow-hidden rounded-lg bg-white shadow-xl">
        <div className="border-b border-slate-200 px-5 py-4">
          <h2 id="admin-modal-title" className="text-lg font-bold text-slate-950">
            {title}
          </h2>
        </div>
        <div className="max-h-[65dvh] overflow-y-auto px-5 py-4">{children}</div>
        {footer ? <div className="border-t border-slate-200 px-5 py-4">{footer}</div> : null}
      </div>
    </div>
  );
}

export function AdminConfirmDialog({
  title,
  description,
  confirmLabel,
  busy,
  onCancel,
  onConfirm,
}: {
  title: string;
  description: string;
  confirmLabel: string;
  busy?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <AdminModal
      title={title}
      footer={
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-60"
          >
            {busy ? "Đang xử lý..." : confirmLabel}
          </button>
        </div>
      }
    >
      <p className="text-sm leading-6 text-slate-600">{description}</p>
    </AdminModal>
  );
}

export function AdminInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className="min-h-10 rounded-lg border border-slate-200 px-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
    />
  );
}

export function AdminSelect(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className="min-h-10 rounded-lg border border-slate-200 px-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
    />
  );
}
