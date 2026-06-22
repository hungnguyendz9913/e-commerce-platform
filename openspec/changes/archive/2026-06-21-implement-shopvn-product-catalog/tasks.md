## 1. Protect Current Storefront Work

- [x] 1.1 Record `git status --short` before editing and identify unrelated user changes.
- [x] 1.2 Inspect current storefront foundation files under `apps/web/src/app/(storefront)` and `apps/web/src/components`.
- [x] 1.3 Inspect actual Nx project targets before selecting verification commands.
- [x] 1.4 Confirm implementation does not modify auth, cart, checkout, customer account, admin, Vite, React Router, Tailwind CSS 4, or dependency configuration.

## 2. Establish Catalog Data Boundary

- [x] 2.1 Create typed storefront catalog view models for product summaries, product details, categories, filters, sort options, and pagination metadata.
- [x] 2.2 Create a catalog data-access module that normalizes storefront query params into public product/category API query params.
- [x] 2.3 Map `/products?search=...` to API `q` and `/products?category=...` to API `categoryId`.
- [x] 2.4 Map UI sort values for default, price ascending, price descending, and name ascending to supported API `sortBy` and `sortOrder` values.
- [x] 2.5 Implement product listing fetch behavior using `GET /products` where available.
- [x] 2.6 Implement product detail fetch behavior using `GET /products/{id}` where available.
- [x] 2.7 Implement category fetch behavior using `GET /categories` where available.
- [x] 2.8 If API integration is not available, isolate typed temporary catalog data behind the same data-access module.
- [x] 2.9 Ensure temporary data does not include auth, cart, checkout, customer account, or admin behavior.

## 3. Update Storefront Header Navigation

- [x] 3.1 Add href-aware navigation item data for all-products and public category navigation.
- [x] 3.2 Update desktop header navigation controls to use Next `Link` for catalog routes.
- [x] 3.3 Update mobile navigation items to use Next `Link` for catalog routes and close after activation.
- [x] 3.4 Update `SearchBar` or an adjacent header search wrapper so non-empty submissions navigate to `/products?search=<term>`.
- [x] 3.5 Preserve accessible labels, focus states, `aria-expanded`, and `aria-controls` for mobile navigation.
- [x] 3.6 Confirm header code still avoids auth providers, cart providers, mock auth state, live cart quantity state, role switching, and direct product API calls.

## 4. Build Reusable Catalog Components

- [x] 4.1 Add a reusable display-only public product card that renders image or fallback, category, name, price, stock signal, and detail navigation.
- [x] 4.2 Add a responsive product grid component using stable dimensions and storefront container conventions.
- [x] 4.3 Add filter panel components for categories, price ranges, and in-stock filtering.
- [x] 4.4 Add a mobile filter open/close component with keyboard-accessible button semantics.
- [x] 4.5 Add a sort select component for the supported sort options.
- [x] 4.6 Add active filter chips with individual removal behavior.
- [x] 4.7 Add shared catalog empty, loading, and error presentation components where route-level files are not sufficient.
- [x] 4.8 Ensure all catalog components remain display-only and do not add cart, checkout, login prompt, auth, customer account, or admin behavior.

## 5. Implement Product Listing Route

- [x] 5.1 Create `apps/web/src/app/(storefront)/products/page.tsx`.
- [x] 5.2 Parse and validate listing search params for search, category, minPrice, maxPrice, inStock, sort, and page.
- [x] 5.3 Load categories and product results through the catalog data boundary.
- [x] 5.4 Render the Figma-aligned listing header with result title and result count.
- [x] 5.5 Render desktop sidebar filters and mobile filter toggle behavior.
- [x] 5.6 Render active filter chips and clear-all behavior.
- [x] 5.7 Render sort controls that preserve unrelated active URL params.
- [x] 5.8 Render the responsive product grid.
- [x] 5.9 Render pagination that preserves search, filters, and sort state.
- [x] 5.10 Render the empty state for no matching products with a clear-filters affordance.

## 6. Implement Product Listing States

- [x] 6.1 Create `apps/web/src/app/(storefront)/products/loading.tsx` with listing skeletons that preserve layout.
- [x] 6.2 Create `apps/web/src/app/(storefront)/products/error.tsx` with an error recovery affordance.
- [x] 6.3 Ensure loading, empty, and error states render inside the storefront layout.
- [x] 6.4 Verify listing states do not introduce horizontal overflow from 320px through 1536px widths.

## 7. Implement Product Detail Route

- [x] 7.1 Create `apps/web/src/app/(storefront)/products/[id]/page.tsx`.
- [x] 7.2 Load the visible public product detail through the catalog data boundary.
- [x] 7.3 Render breadcrumb navigation for home, products, category, and product name.
- [x] 7.4 Render a responsive product image gallery with thumbnails or a stable fallback.
- [x] 7.5 Render product name, SKU when available, category, price, stock status, and description.
- [x] 7.6 Render related products using the reusable display product card when available.
- [x] 7.7 Use App Router not-found behavior or a product-not-found state for missing or non-public products.
- [x] 7.8 Keep quantity mutation, add-to-cart, checkout, authentication, and login prompt behavior out of the detail page.

## 8. Implement Product Detail States

- [x] 8.1 Create `apps/web/src/app/(storefront)/products/[id]/loading.tsx` with detail skeletons that preserve layout.
- [x] 8.2 Create `apps/web/src/app/(storefront)/products/[id]/error.tsx` with an error recovery affordance.
- [x] 8.3 Ensure not-found, loading, and error states provide navigation back to `/products` where appropriate.
- [x] 8.4 Verify detail states remain responsive from 320px through 1536px widths.

## 9. Responsive and Accessibility Review

- [x] 9.1 Verify listing layout at 320px, 375px, 768px, 1024px, and 1536px.
- [x] 9.2 Verify detail layout at 320px, 375px, 768px, 1024px, and 1536px.
- [x] 9.3 Verify header search, desktop category links, mobile category links, filter controls, sort control, active chips, pagination, and product cards are keyboard accessible.
- [x] 9.4 Verify text and controls do not overlap or overflow their containers.
- [x] 9.5 Verify product images or fallbacks render with stable aspect ratios.

## 10. Tests and Verification

- [x] 10.1 Add or update focused web tests for header search/category navigation when existing test patterns support it.
- [x] 10.2 Add or update focused tests for catalog query mapping and sort/filter normalization.
- [x] 10.3 Add or update focused tests for product card display-only behavior.
- [x] 10.4 Run the targeted web lint/typecheck/test commands available for the Nx project.
- [x] 10.5 Search new and modified catalog files for forbidden imports and behavior: `react-router`, `useNavigate`, Vite, `@tailwindcss/vite`, Tailwind CSS 4 entrypoints, `AuthProvider`, `CartProvider`, `useAuth`, `useCart`, `sonner`, checkout, account, admin, and add-to-cart behavior.
- [x] 10.6 Run `openspec status --change "implement-shopvn-product-catalog"` and confirm the change remains apply-ready.
