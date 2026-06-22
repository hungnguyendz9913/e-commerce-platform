import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import ProductPurchasePanel from "@/components/commerce/product-purchase-panel";
import ProductCard from "@/components/storefront/product-card";
import ProductGallery from "@/components/storefront/product-gallery";
import {
  getCatalogProduct,
  listRelatedProducts,
} from "@/lib/storefront/catalog";

type ProductDetailPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: ProductDetailPageProps) {
  const { id } = await params;
  const product = await getCatalogProduct(id);

  return {
    title: product ? product.name : "Sản phẩm không tồn tại",
  };
}

export default async function ProductDetailPage({
  params,
}: ProductDetailPageProps) {
  const { id } = await params;
  const product = await getCatalogProduct(id);

  if (!product) {
    notFound();
  }

  const relatedProducts = await listRelatedProducts(product);

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-8 sm:px-6">
      <nav
        aria-label="Đường dẫn"
        className="mb-6 flex min-w-0 flex-wrap items-center gap-2 text-sm text-slate-500"
      >
        <Link href="/" className="transition hover:text-blue-600">
          Trang chủ
        </Link>
        <ChevronRight className="size-4" aria-hidden="true" />
        <Link href="/products" className="transition hover:text-blue-600">
          Sản phẩm
        </Link>
        <ChevronRight className="size-4" aria-hidden="true" />
        <Link
          href={`/products?category=${product.category.id}`}
          className="transition hover:text-blue-600"
        >
          {product.category.name}
        </Link>
        <ChevronRight className="size-4" aria-hidden="true" />
        <span className="min-w-0 truncate text-slate-800">{product.name}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-2">
        <ProductGallery product={product} />

        <section>
          <div className="mb-3 flex flex-wrap gap-2">
            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
              {product.category.name}
            </span>
            <span
              className={`rounded-full px-3 py-1 text-xs font-bold ${
                product.inStock
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-red-50 text-red-700"
              }`}
            >
              {product.inStock ? "Còn hàng" : "Hết hàng"}
            </span>
          </div>

          <h1 className="text-2xl font-bold leading-tight text-slate-900 sm:text-3xl">
            {product.name}
          </h1>
          <p className="mt-3 text-sm text-slate-500">
            SKU: <span className="font-mono text-slate-700">{product.sku}</span>
          </p>
          <p className="mt-5 text-3xl font-bold text-blue-600">
            {product.formattedPrice}
          </p>

          <div className="mt-5 flex items-center gap-2 text-sm">
            <span
              className={`size-2 rounded-full ${
                product.inStock ? "bg-emerald-500" : "bg-red-500"
              }`}
              aria-hidden="true"
            />
            <span
              className={`font-bold ${
                product.inStock ? "text-emerald-700" : "text-red-700"
              }`}
            >
              {product.inStock ? "Còn hàng" : "Hết hàng"}
            </span>
            {product.inStock ? (
              <span className="text-slate-500">
                ({product.stockQuantity} sản phẩm)
              </span>
            ) : null}
          </div>

          <ProductPurchasePanel
            productId={product.id}
            productName={product.name}
            inStock={product.inStock}
            stockQuantity={product.stockQuantity}
          />

          <div className="mt-8 rounded-xl border border-slate-200 bg-white p-5">
            <h2 className="text-base font-bold text-slate-900">
              Mô tả sản phẩm
            </h2>
            <p className="mt-3 leading-7 text-slate-600">
              {product.description}
            </p>
          </div>
        </section>
      </div>

      {relatedProducts.length > 0 ? (
        <section className="mt-12">
          <h2 className="mb-4 text-xl font-bold text-slate-900">
            Sản phẩm liên quan
          </h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {relatedProducts.map((relatedProduct) => (
              <ProductCard key={relatedProduct.id} product={relatedProduct} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
