import ProductCard from "@/components/storefront/product-card";
import type { CatalogProductSummary } from "@/lib/storefront/catalog";

export default function ProductGrid({
  products,
}: {
  products: CatalogProductSummary[];
}) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
