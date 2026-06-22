import Link from "next/link";
import { PackageSearch } from "lucide-react";
import AddToCartButton from "@/components/commerce/add-to-cart-button";
import {
  type CatalogProductSummary,
  productDetailHref,
} from "@/lib/storefront/catalog";

export default function ProductCard({
  product,
}: {
  product: CatalogProductSummary;
}) {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <Link
        href={productDetailHref(product)}
        className="block rounded-t-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        <div className="relative aspect-square overflow-hidden bg-slate-100">
          {product.primaryImage ? (
            <img
              src={product.primaryImage.imageUrl}
              alt={product.primaryImage.altText}
              className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="grid h-full w-full place-items-center text-slate-400">
              <PackageSearch className="size-10" aria-hidden="true" />
            </div>
          )}

          {!product.inStock ? (
            <div className="absolute inset-0 grid place-items-center bg-slate-950/45">
              <span className="rounded-full bg-red-500 px-3 py-1 text-xs font-bold text-white">
                Hết hàng
              </span>
            </div>
          ) : null}
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <Link
          href={productDetailHref(product)}
          className="rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <p className="text-sm text-slate-500">{product.category.name}</p>
          <h2 className="mt-1 line-clamp-2 min-h-11 text-sm font-bold text-slate-800 transition group-hover:text-blue-600">
            {product.name}
          </h2>
        </Link>

        <div className="mt-auto space-y-3 pt-4">
          <div>
            <p className="font-bold text-blue-600">{product.formattedPrice}</p>
            {product.inStock && product.stockQuantity <= 5 ? (
              <p className="mt-1 text-xs font-medium text-orange-600">
                Còn {product.stockQuantity} sản phẩm
              </p>
            ) : null}
          </div>
          <div className="flex items-start justify-between gap-2">
            <Link
              href={productDetailHref(product)}
              className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Xem
            </Link>
            <AddToCartButton
              productId={product.id}
              productName={product.name}
              inStock={product.inStock}
              stockQuantity={product.stockQuantity}
              compact
              className="px-3 py-2 text-xs"
            />
          </div>
        </div>
      </div>
    </article>
  );
}
