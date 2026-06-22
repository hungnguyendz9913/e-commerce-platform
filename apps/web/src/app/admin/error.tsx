"use client";

import { AdminError } from "@/components/admin/admin-ui";

export default function AdminErrorPage({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div>
      <AdminError message={error.message} />
      <button
        type="button"
        onClick={reset}
        className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        Thử lại
      </button>
    </div>
  );
}
