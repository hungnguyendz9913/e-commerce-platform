"use client";

import { CatalogErrorState } from "@/components/storefront/catalog-state";

export default function ProductDetailError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <CatalogErrorState
      title="Không tải được sản phẩm"
      description="Có lỗi xảy ra khi tải chi tiết sản phẩm. Vui lòng thử lại."
      reset={reset}
    />
  );
}
