## Context

The current ShopVN web app is an Nx-managed Next.js App Router application. The completed storefront foundation provides a transparent `(storefront)` route group, a shared public layout, `HomepageHeader`, `MobileNavigation`, `SearchBar`, `StorefrontFooter`, `Logo`, homepage sections, Tailwind CSS 3.4.3, Flowbite, and `lucide-react`.

The Figma Make reference for project `OwX29MxtI0gXCASf44pdGh` defines the remaining public catalog experience with:

- a `/products` listing page
- header search that navigates to product results
- top category navigation
- a desktop filter sidebar and mobile filter toggle
- active filter chips
- sort options for default, price ascending, price descending, and name ascending
- paginated product grids
- loading skeletons, empty results, and product-not-found states
- a reusable `ProductCard`
- a product detail page with breadcrumb, gallery, stock, description, and related products

The Figma project is a Vite/React Router prototype with mock auth, mock cart, login prompts, and cart actions. This implementation must translate its visual and behavioral catalog patterns into Next.js App Router and exclude those out-of-scope behaviors.

Existing backend specs already define public product and category contracts:

- `GET /products` for visible product listing with `q`, `categoryId`, `minPrice`, `maxPrice`, `inStock`, `sortBy`, `sortOrder`, `page`, and `limit`
- `GET /products/{id}` for visible product detail
- `GET /categories` for active public categories with hierarchy data

## Goals / Non-Goals

**Goals:**

- Add public storefront catalog routes for listing/search/filter/sort/pagination and product detail.
- Reuse the storefront route group and layout instead of creating a parallel public shell.
- Convert header search and category navigation from static UI affordances into catalog navigation.
- Provide reusable display-only product cards and state components for loading, empty, and error states.
- Prefer server-rendered data loading through App Router pages where practical, with small client components only for local UI state such as mobile filter disclosure, gallery selection, or interactive controls.
- Use existing product/category API contracts when available.
- If API integration cannot be completed during implementation, isolate typed temporary catalog data behind a data-access boundary that can be replaced without changing page/component contracts.
- Preserve Tailwind CSS 3.4.3, Flowbite, TypeScript, Next.js App Router, and current dependency boundaries.

**Non-Goals:**

- No Vite, React Router, Tailwind CSS 4, or shadcn/Radix migration.
- No auth, login prompts, role switching, customer account, admin, cart, checkout, payment, or add-to-cart behavior.
- No backend API contract changes unless an existing implementation defect blocks the already specified public product/category behavior.
- No broad remote image allowlist.
- No product management or inventory admin UI.

## Decisions

### Route structure

Use the existing storefront route group:

```text
apps/web/src/app/(storefront)/
  products/
    page.tsx
    loading.tsx
    error.tsx
    [id]/
      page.tsx
      loading.tsx
      error.tsx
```

Rationale: this keeps the public catalog inside the completed storefront shell and avoids duplicate layouts. Next.js App Router search params naturally represent catalog state for search, filters, sort, and page.

Alternative considered: a separate `(catalog)` route group. Rejected because it would duplicate storefront shell ownership and make header/footer consistency harder.

### Catalog state model

Use URL query parameters as the source of truth:

- `search` in storefront URLs maps to API `q`
- `category` in storefront URLs maps to API `categoryId`
- `minPrice`, `maxPrice`, `inStock`, and `page` map directly
- `sort` is a UI convenience value mapped at the data boundary to API `sortBy` and `sortOrder`

Rationale: URL-driven state supports reloads, sharing, browser navigation, server rendering, and Figma-like filter chip behavior.

Alternative considered: local component state with client-side filtering. Rejected for the real catalog because it diverges from existing API contracts and breaks shareable search results.

### Data boundary

Create a typed storefront catalog data boundary, such as `apps/web/src/lib/storefront/catalog.ts`, that owns:

- request parameter normalization
- API query construction
- response-to-view-model mapping
- fallback temporary data, if needed
- reusable view types for product cards, product detail, categories, and pagination

Rationale: Figma mock products use lowercase statuses and prototype-specific fields, while backend contracts use DTOs and service response shapes. A boundary keeps pages/components stable while API integration matures.

Alternative considered: importing Figma mock data directly into route components. Rejected because it leaks prototype assumptions and makes replacement expensive.

### API usage

Prefer existing public API endpoints:

- `GET /categories`
- `GET /products`
- `GET /products/{id}`

The data boundary should be written so the backing source can be swapped between real API and typed temporary data without changing route/page components. Temporary data, if used, must be named clearly and kept catalog-only.

Rationale: the repository already has product/category contracts and services. The frontend proposal should consume them rather than redefining product behavior.

Alternative considered: adding frontend-only filtering logic over static arrays for the final behavior. Rejected unless used as a temporary implementation fallback behind the boundary.

### Component composition

Introduce reusable catalog components under the existing component organization, for example:

```text
apps/web/src/components/storefront/
  catalog-filter-panel.tsx
  catalog-sort-select.tsx
  catalog-active-filters.tsx
  catalog-state.tsx
  product-card.tsx
  product-grid.tsx
  product-gallery.tsx
  product-detail.tsx
```

Reuse existing `Logo`, `SearchBar`, `HomepageHeader`, `MobileNavigation`, and footer foundation where compatible. The product card should be display-only and link to product detail. Any button-like visual from Figma that previously added to cart must be removed, disabled as non-mutating presentation, or converted into a detail link.

Rationale: the Figma catalog is componentized around cards, empty states, pagination, filters, and detail gallery. Keeping these pieces reusable avoids coupling listing and detail pages too tightly.

Alternative considered: single large route files. Rejected because listing/detail states and responsive controls would become difficult to test and reuse.

### Header and category navigation

Update `SearchBar` to support a real form submission to `/products?search=<term>`. Update navigation items to include `href` values such as `/products` and category-filtered URLs. Use Next `Link` for actual navigation and preserve the existing mobile navigation client boundary.

Rationale: the completed foundation intentionally left search UI-only. The catalog change is the right time to activate that navigation while still avoiding search API calls directly from the header.

Alternative considered: keeping header search inert and adding search only on the listing page. Rejected because the Figma reference and shopper expectations make global product search part of public catalog navigation.

### Responsive behavior

Follow the Figma reference:

- desktop listing uses a left filter column and product grid
- mobile listing collapses filters behind a toggle
- product grid adapts from two columns on compact screens through four columns on large screens
- product detail uses a stacked mobile layout and two-column desktop layout
- filter chips wrap without causing horizontal overflow
- pagination remains centered and reachable

Rationale: this preserves the current storefront container width and the Figma catalog behavior while keeping controls usable at 320px and above.

Alternative considered: always-visible filters on mobile. Rejected because it would push product results too far down and conflict with the Figma mobile pattern.

### Image strategy

Use stable view-model image URLs. For local placeholder or temporary images, prefer local assets or CSS placeholders. If real API product images require Next image optimization for remote hosts, add only narrow `next.config.js` remote patterns. If remote hosts are not stable, use standard `<img>` in the product card/detail until a stable image policy is approved.

Rationale: product images are important for catalog inspection, but broad remote allowlists are risky and outside the storefront foundation’s asset discipline.

Alternative considered: copying Figma product imagery. Rejected unless a specific asset is approved for catalog use.

## Risks / Trade-offs

- API response shape may not match the desired product view model -> keep all mapping inside the catalog data boundary and add focused tests around normalization.
- Public category IDs may be UUIDs while Figma examples use short IDs -> treat URL category values as API category IDs and let displayed category names come from the category response.
- Search param naming differs between UI and API (`search` versus `q`) -> map explicitly at the boundary and document the public storefront URL shape in tests.
- Remote product images may fail under Next image restrictions -> prefer local/placeholder imagery initially or add narrow remote patterns only when the source is known.
- Mobile filter UI can become too client-heavy -> keep data loading in pages and limit client state to open/close controls and form interactions.
- Figma add-to-cart visuals can accidentally reintroduce cart scope -> make product cards and detail CTAs display/detail-navigation only for this change.
- Empty/error/loading states may be inconsistent across listing and detail -> centralize simple state components and route-level `loading.tsx`/`error.tsx` files.

## Migration Plan

1. Inspect current storefront files and record git status before implementation.
2. Add typed catalog view models and data boundary that consumes existing public product/category APIs or clearly isolated temporary catalog data.
3. Update header search and navigation to link to catalog routes.
4. Add reusable catalog display components and state components.
5. Add `/products` listing route with query parsing, filters, sort, active chips, pagination, loading, empty, and error states.
6. Add `/products/[id]` detail route with gallery, breadcrumb, stock, description, related products, loading, not-found, and error states.
7. Add focused component/page tests where existing web test patterns support them.
8. Run static checks and targeted web tests.
9. Verify no forbidden imports or dependency changes were introduced.

Rollback is frontend-local: remove the catalog route files/components and revert the header search/navigation changes. Because this change does not modify backend contracts, auth, cart, checkout, account, or admin behavior, rollback should not require database or API migration.

## Open Questions

- What base URL/configuration should the web app use for server-side calls to the Nest API in deployed environments if no existing frontend API client is present?
- Are product detail URLs expected to use database IDs only for this change, or should slugs be introduced later as a separate API/SEO change?
- Which remote image hosts, if any, are approved for optimized catalog product images?
