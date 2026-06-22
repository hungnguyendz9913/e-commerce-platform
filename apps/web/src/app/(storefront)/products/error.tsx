"use client";

import { CatalogErrorState } from "@/components/storefront/catalog-state";

export default function ProductsError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <CatalogErrorState reset={reset} />;
}
