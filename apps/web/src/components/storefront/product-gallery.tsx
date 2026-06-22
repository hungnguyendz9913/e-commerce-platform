import { PackageSearch } from "lucide-react";
import type { CatalogProductDetail } from "@/lib/storefront/catalog";

export default function ProductGallery({
  product,
}: {
  product: CatalogProductDetail;
}) {
  const primaryImage = product.images[0] ?? product.primaryImage;

  return (
    <div>
      <div className="relative aspect-square overflow-hidden rounded-2xl bg-slate-100">
        {primaryImage ? (
          <img
            src={primaryImage.imageUrl}
            alt={primaryImage.altText}
            className="h-full w-full object-contain"
          />
        ) : (
          <div className="grid h-full w-full place-items-center text-slate-400">
            <PackageSearch className="size-12" aria-hidden="true" />
          </div>
        )}

        {!product.inStock ? (
          <div className="absolute inset-0 grid place-items-center bg-slate-950/45">
            <span className="rounded-full bg-red-500 px-5 py-2 text-sm font-bold text-white">
              Hết hàng
            </span>
          </div>
        ) : null}
      </div>

      {product.images.length > 1 ? (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {product.images.map((image) => (
            <div
              key={image.id}
              className="size-16 shrink-0 overflow-hidden rounded-lg border-2 border-blue-600 bg-slate-100"
            >
              <img
                src={image.imageUrl}
                alt=""
                className="h-full w-full object-cover"
              />
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
