## Why

The ShopVN storefront foundation is in place, but shoppers still do not have the public catalog surfaces needed to browse, search, filter, sort, and inspect products. The Figma Make prototype already defines the intended catalog behavior and visual rhythm, so this change completes the public catalog while staying inside the existing Nx/Next.js App Router stack and backend product/category contracts.

## What Changes

- Add public product listing routes under the existing storefront App Router layout.
- Add category navigation for top-level categories and category-filtered catalog browsing.
- Add URL-driven search results, filter, sort, pagination, loading, empty, and error UI.
- Add a reusable public display product card for listing, related products, and future storefront sections.
- Add a public product detail page with image gallery, breadcrumb, price, category, SKU, stock display, description, and related products.
- Update storefront header/search/category navigation so catalog links and submitted search terms route to catalog URLs.
- Reuse the completed storefront foundation, existing components, Tailwind CSS 3.4.3, Flowbite baseline, TypeScript, and Next.js App Router.
- Use existing `GET /products`, `GET /products/{id}`, and `GET /categories` contracts where available.
- Isolate any temporary typed catalog data behind a clearly named data boundary if an API response is unavailable during implementation.
- Exclude Vite, React Router, Tailwind CSS 4, auth, cart, checkout, customer account, and admin behavior.

## Capabilities

### New Capabilities

- `storefront-product-catalog`: Defines public catalog pages, category navigation, search results, filters, sorting, product detail, reusable display cards, states, and responsive behavior for the ShopVN storefront.

### Modified Capabilities

- `storefront-foundation`: Header search and category navigation become catalog navigation affordances while continuing to avoid auth, cart state, checkout, customer account, and admin behavior.

## Impact

- Affected frontend area:
  - `apps/web/src/app/(storefront)/`
  - `apps/web/src/components/`
  - potential storefront-specific data/query helpers under `apps/web/src/`
  - `apps/web/specs/` or web component tests if existing patterns support them
- Affected existing API contracts:
  - Public product listing and detail from `openspec/specs/products/spec.md`
  - Public category listing and hierarchy from `openspec/specs/categories/spec.md`
- Expected routes:
  - `/products`
  - `/products/[id]`
  - query-driven catalog states such as `/products?search=...`, `/products?category=...`, `/products?minPrice=...&maxPrice=...&sort=...&page=...`
- Dependencies:
  - No new dependencies are expected.
  - Keep Tailwind CSS 3.4.3, Flowbite, `lucide-react`, TypeScript, and Next.js App Router.
- Risks:
  - API response shapes may differ from the Figma mock data and must be mapped at a typed boundary.
  - Product images may require a deliberate `next/image` strategy or scoped remote image configuration if API images are remote.
  - Search/filter state must remain URL-driven to avoid inconsistent navigation and reload behavior.
  - The Figma prototype includes auth/cart actions that must remain out of this change.
