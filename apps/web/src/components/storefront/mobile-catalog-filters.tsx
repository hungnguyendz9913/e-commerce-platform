"use client";

import { useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";

export default function MobileCatalogFilters({
  children,
}: {
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-controls="mobile-catalog-filters"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        {open ? (
          <X className="size-4" aria-hidden="true" />
        ) : (
          <SlidersHorizontal className="size-4" aria-hidden="true" />
        )}
        Lọc
      </button>

      <div id="mobile-catalog-filters" hidden={!open} className="mt-4">
        {children}
      </div>
    </div>
  );
}
