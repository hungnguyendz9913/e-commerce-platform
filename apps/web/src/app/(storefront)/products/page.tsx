import CatalogActiveFilters from "@/components/storefront/catalog-active-filters";
import CatalogFilterPanel from "@/components/storefront/catalog-filter-panel";
import CatalogPagination from "@/components/storefront/catalog-pagination";
import CatalogSortSelect from "@/components/storefront/catalog-sort-select";
import { EmptyCatalogState } from "@/components/storefront/catalog-state";
import MobileCatalogFilters from "@/components/storefront/mobile-catalog-filters";
import ProductGrid from "@/components/storefront/product-grid";
import {
  getCategoryById,
  listCatalogCategories,
  listCatalogProducts,
  type CatalogSearchParams,
} from "@/lib/storefront/catalog";

type ProductsPageProps = {
  searchParams: Promise<CatalogSearchParams>;
};

export const metadata = {
  title: "Sản phẩm",
};

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const resolvedSearchParams = await searchParams;
  const [categories, result] = await Promise.all([
    listCatalogCategories(),
    listCatalogProducts(resolvedSearchParams),
  ]);
  const selectedCategory = result.query.category
    ? getCategoryById(result.query.category)
    : undefined;
  const heading = result.query.search
    ? `Kết quả cho "${result.query.search}"`
    : selectedCategory
      ? selectedCategory.name
      : "Tất cả sản phẩm";

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-8 sm:px-6">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">
            {heading}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {result.pagination.total} sản phẩm
          </p>
        </div>

        <div className="flex items-center gap-3">
          <CatalogSortSelect query={result.query} />
          <MobileCatalogFilters>
            <CatalogFilterPanel categories={categories} query={result.query} />
          </MobileCatalogFilters>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-[224px_minmax(0,1fr)]">
        <aside className="hidden md:block">
          <CatalogFilterPanel categories={categories} query={result.query} />
        </aside>

        <section className="min-w-0" aria-labelledby="catalog-results-heading">
          <h2 id="catalog-results-heading" className="sr-only">
            Danh sách sản phẩm
          </h2>
          <CatalogActiveFilters
            query={result.query}
            selectedCategory={selectedCategory}
          />

          {result.products.length > 0 ? (
            <>
              <ProductGrid products={result.products} />
              <CatalogPagination
                pagination={result.pagination}
                query={result.query}
              />
            </>
          ) : (
            <EmptyCatalogState />
          )}
        </section>
      </div>
    </div>
  );
}
