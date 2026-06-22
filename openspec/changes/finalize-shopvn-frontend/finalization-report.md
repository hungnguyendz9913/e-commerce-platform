## Finalization Report

Change: `finalize-shopvn-frontend`
Schema: `spec-driven`
Date: 2026-06-21

## Baseline Audit

### Predecessor Changes

The required predecessor phases are present in `openspec/changes/archive`:

- `2026-06-21-migrate-shopvn-storefront-foundation`
- `2026-06-21-implement-shopvn-product-catalog`
- `2026-06-21-implement-shopvn-auth-rbac`
- `2026-06-21-implement-shopvn-customer-commerce`
- `2026-06-21-implement-shopvn-customer-account`
- `2026-06-21-implement-shopvn-admin`

`openspec list --json` reports `finalize-shopvn-frontend` as the only active
change.

### Working Tree Snapshot

The working tree already contained broad frontend implementation work before
this finalization pass. Existing modified/deleted/untracked paths include:

- Web app config and tests: `apps/web/jest.config.cts`,
  `apps/web/package.json`, `apps/web/specs/*`, `package-lock.json`.
- Web app shell and styles: `apps/web/src/app/global.css`,
  `apps/web/src/app/layout.tsx`, deleted `apps/web/src/app/page.tsx`.
- Implemented frontend routes under `apps/web/src/app/(storefront)`,
  `apps/web/src/app/admin`, `apps/web/src/app/api`, `apps/web/src/app/cart`,
  `apps/web/src/app/checkout`, `apps/web/src/app/customer`,
  `apps/web/src/app/login`, `apps/web/src/app/register`,
  `apps/web/src/app/payment-result`, `apps/web/src/app/unauthorized`,
  `apps/web/src/app/forbidden`, and `apps/web/src/app/not-found.tsx`.
- Shared frontend modules under `apps/web/src/components`,
  `apps/web/src/lib`, and `apps/web/src/middleware.ts`.
- Archived OpenSpec predecessor changes and synced main specs.

Finalization edits must preserve those existing changes unless a scoped
integration or hardening fix requires touching them.

### Route Inventory

Route/system files under `apps/web/src/app`:

- Root: `layout.tsx`, `global.css`, `not-found.tsx`.
- Storefront group: `(storefront)/layout.tsx`, `(storefront)/page.tsx`,
  `(storefront)/products/page.tsx`, product loading/error boundaries, and
  product detail page/loading/error/not-found.
- Auth/system: `login/page.tsx`, `register/page.tsx`,
  `unauthorized/page.tsx`, `forbidden/page.tsx`.
- Commerce: `cart/page.tsx`, `checkout/page.tsx`,
  `payment-result/page.tsx`.
- Customer: `customer/layout.tsx`, `customer/page.tsx`,
  `customer/profile/page.tsx`, `customer/addresses/page.tsx`,
  `customer/orders/page.tsx`, `customer/orders/[orderId]/page.tsx`, plus
  customer loading/error boundaries.
- Admin: `admin/layout.tsx`, `admin/page.tsx`, products, categories,
  inventory, orders, order detail, customers, approvals, vouchers, revenue,
  payments, webhooks, audit logs, plus admin loading/error boundaries.
- Route handlers: auth, cart, checkout, customer, and admin proxy handlers.

### Shared Module Inventory

- UI and storefront components: `components/ui`, `components/storefront`,
  `components/homepage.tsx`, `components/hero.tsx`.
- Auth components and helpers: `components/auth`, `lib/auth`.
- Commerce components and helpers: `components/commerce`, `lib/commerce`.
- Customer components and helpers: `components/customer`, `lib/customer`.
- Admin components and helpers: `components/admin`, `lib/admin`.
- Tests: `apps/web/specs/*.spec.tsx` and `apps/web/specs/*.spec.ts`.
- Assets/config: `apps/web/public/hero-background.jpg`,
  `apps/web/next.config.js`, `apps/web/tailwind.config.js`,
  `apps/web/jest.config.cts`.

### Transitional Code Findings

Searches found no production `react-router`, Vite imports, Tailwind CSS 4
runtime patterns, Figma provider architecture, role-switching UI, or Figma mock
auth/cart providers under `apps/web/src`.

Remaining temporary data is isolated behind typed service boundaries:

- `lib/storefront/catalog.ts` contains temporary catalog data until catalog
  backend read endpoints are available; the service now carries an explicit
  backend-gap removal comment.
- `lib/admin/service.ts` documents backend gaps for dashboard, inventory,
  orders, customers, revenue, payments, webhooks, and audit logs.
- `lib/customer/account.ts` gates unavailable address mutations through
  `customerMutationSupport` and a user-facing unsupported-operation message.

## Route Ownership Map

| Area | Public paths | Owner | Shell responsibilities |
| --- | --- | --- | --- |
| Global | All routes | `app/layout.tsx` | Font, global CSS, document shell, root metadata only. |
| Storefront | `/`, `/products`, `/products/[id]` | `app/(storefront)/layout.tsx` | Public header, public footer, storefront main region. |
| Auth | `/login`, `/register` | Page-local auth layout | Centered auth forms without storefront, customer, or admin shells. |
| Commerce | `/cart`, `/checkout`, `/payment-result` | Page-local commerce clients guarded by middleware | Storefront-compatible commerce content without customer account nav. |
| Customer | `/customer`, `/customer/profile`, `/customer/addresses`, `/customer/orders`, `/customer/orders/[orderId]` | `app/customer/layout.tsx` | Public header/footer plus customer account navigation and customer content width. |
| Admin | `/admin/**` | `app/admin/layout.tsx` | Admin sidebar, top bar, and admin content shell only. |
| System | `/unauthorized`, `/forbidden`, global 404 and segment errors | System pages/boundaries | Accessible safe recovery pages without protected data. |

Ownership checks:

- Exactly one active homepage file resolves to `/`: `app/(storefront)/page.tsx`.
  The previous root `app/page.tsx` is deleted in the working tree.
- Root layout does not render navigation, headers, footers, or app-specific
  account/admin shells.
- Storefront layout owns `HomepageHeader` and `StorefrontFooter`.
- Auth pages render standalone centered forms.
- Customer layout owns `CustomerAccountNav` and does not use admin shell.
- Admin layout renders only `AdminShell` and does not include storefront or
  customer navigation.

Cleanup performed:

- Removed unused scaffold route `apps/web/src/app/api/hello/route.ts`.
- Removed empty obsolete route directory `apps/web/src/app/(homepage)`.

## Auth, Session, and RBAC

- Login and registration use `lib/auth/client.ts` proxy calls to
  `/api/auth/login` and `/api/auth/register`; no demo role switcher or quick-fill
  behavior is present.
- Auth proxy route handlers set and clear HTTP-only access/refresh cookies via
  `lib/auth/route-handler.ts`.
- Middleware protects `/admin`, `/customer`, `/cart`, `/checkout`, and
  `/payment-result`, attempts refresh when possible, clears cookies on failed
  refresh, and redirects forbidden role access to `/forbidden`.
- `lib/auth/redirects.ts` accepts only safe same-origin relative redirect
  targets and rejects auth-page targets.
- `lib/auth/server.ts` now restores auth-aware layout identity through the
  refresh token when the access token is missing or stale.
- Logout calls the backend logout contract when an access token exists, clears
  local cookies, routes to `/`, and refreshes the router.
- `/unauthorized` and `/forbidden` are separate accessible pages with safe
  navigation choices.

## API Integration and Service Boundaries

- Storefront catalog and product detail load through typed functions in
  `lib/storefront/catalog.ts`; invalid query values are normalized and missing
  product detail returns `notFound()`.
- Cart, checkout, voucher application, order creation, and payment-result
  handling use `lib/commerce` service helpers and app route proxies.
- Profile, addresses, customer order list, and customer order detail use
  `lib/customer/account.ts` plus typed normalizers.
- Admin dashboard, products, categories, inventory, orders, customers,
  approvals, vouchers, revenue, payments, webhooks, and audit logs route through
  `lib/admin/service.ts`; unavailable backend contracts are disabled or surfaced
  as backend-gap pages.
- `lib/commerce/client.ts` and `lib/admin/api.ts` now map validation,
  unauthenticated, forbidden, not found, conflict, payment/business-rule,
  network, and server failures to stable user-facing recovery messages.
- Mutating UI updates local state only after a successful service response or a
  backend-confirmed refresh, preserving the last confirmed state on failure.

## UI States and Mutation Safety

- Storefront catalog/product pages use stable skeleton, empty, error, and
  product not-found states.
- Cart, checkout, profile, addresses, customer orders, and admin pages use
  shared loading, empty, error, success, and recovery components or equivalent
  route-local states.
- Destructive/high-impact actions use confirmation flows for clearing carts,
  address deletion attempts, product/category deletion, and voucher
  deactivation.
- Forms and mutation buttons use pending state to disable repeated submission
  while requests are in flight.
- Invalid product IDs call `notFound()`, and missing/unsupported customer/admin
  resources render route-level not-found, error, or backend-gap states without
  replacing backend-confirmed UI state on failed mutations.

## System Pages, Error Boundaries, and Metadata

- Global 404 is now a branded ShopVN page with accessible heading, safe links to
  home and products, and no sensitive implementation details.
- `/unauthorized` and `/forbidden` remain distinct branded pages.
- Product list/detail, customer, customer order detail, and admin segments have
  route error/loading boundaries.
- `app/global-error.tsx` provides an app-level branded recovery screen without
  rendering raw error details.
- Root metadata now uses ShopVN defaults and a title template. Major storefront,
  auth, customer, commerce, admin, and system routes have `metadata` or
  `generateMetadata`.

## Next.js Boundaries, Assets, and Types

- Route pages and layouts remain Server Components by default; interactive
  islands are scoped to forms, dialogs, navigation, cart/checkout, customer, and
  admin action components.
- Removed an unnecessary `"use client"` directive from `lib/auth/client.ts`.
- Server-side data loading uses existing auth/session helpers where layouts need
  current user state.
- Image usage was reviewed across storefront, cart, and product detail. Remote
  product images are rendered as plain `img` elements because the catalog read
  data remains temporary; `next.config.js` therefore does not need a broad
  remote image allowlist.
- Shared service response envelopes, normalizers, and typed error classes are
  grouped by domain in `lib/auth`, `lib/commerce`, `lib/customer`, `lib/admin`,
  and `lib/storefront`.

## Verification Evidence

### Nx Project

`npx nx show project @e-commerce-platform/web --json` identifies the web app as
`@e-commerce-platform/web` with configured targets:

- `lint`: `eslint .` from `apps/web`.
- `test`: `jest` from `apps/web`, depending on upstream builds.
- `build`: `next build` from `apps/web`.
- `dev`, `start`, `serve-static`, `build-deps`, and `watch-deps`.

`@e-commerce-platform/web-e2e` exposes inferred Playwright targets through the
Nx plugin, including `e2e`, `e2e-ci`, `lint`, and `typecheck`.

### Responsive and Accessibility Coverage

Automated Chromium e2e coverage was added in `apps/web-e2e/src/example.spec.ts`
for viewport widths `320`, `375`, `768`, `1024`, and `1536` on:

- `/`
- `/products`
- `/products/p1`
- `/login`
- `/register`
- `/unauthorized`
- `/forbidden`
- global 404 via `/missing-shopvn-page`

The same e2e file verifies guest access redirects safely to login for:

- `/cart`
- `/checkout`
- `/payment-result`
- `/customer`
- `/customer/profile`
- `/customer/addresses`
- `/customer/orders`
- `/admin`
- `/admin/products`

Source-level accessibility checks confirmed:

- Keyboard-focus classes are present on navigation, form controls, filters,
  pagination, dialogs, mobile menus, destructive actions, and icon controls.
- Mobile/admin dialogs use `role="dialog"`, `aria-modal`, and labelled titles.
- Forms use labels, `htmlFor`, `aria-invalid`, and error descriptions where
  validation errors are field-specific.
- Image alt text or decorative empty alt text is present on hero, product,
  cart, and gallery imagery.
- Tables use contained horizontal overflow instead of document-level overflow.
- Disabled and pending buttons include disabled states and visible loading copy
  or spinner indicators.

### Automated Target Results

- `npx nx lint @e-commerce-platform/web`: passed.
- `npx nx test @e-commerce-platform/web`: passed, 7 suites and 46 tests.
- `npx nx build @e-commerce-platform/web`: passed. Warnings were emitted for
  the deprecated Next `middleware` convention and Flowbite `ThemeInit`, but
  neither failed the build.
- `npx nx e2e @e-commerce-platform/web-e2e -- --project=chromium`: passed, 49
  tests.

No residual target failures remain from this finalization pass.

## Final Manual End-to-End Checklist

### Guest

- Homepage loads with ShopVN header, search entry, hero CTAs, featured sections,
  and footer.
- Search/catalog navigation reaches `/products`.
- Catalog filters, sort, active filter chips, pagination, empty state, and
  product cards are usable.
- Product detail renders gallery, breadcrumbs, price, stock state, description,
  related products, and add-to-cart affordances.
- Login/register links are reachable from public navigation.
- Unauthorized, forbidden, and 404 pages provide safe recovery links.

### Customer

- Login redirects to safe customer destination and rejects unsafe redirect
  targets.
- Logout clears cookies/state and returns to storefront.
- Session restoration uses access token first and refresh token fallback.
- Cart add/update/remove/clear controls guard pending state and preserve last
  confirmed cart on failure.
- Checkout validates delivery fields, applies voucher, creates order, and routes
  to payment result or external payment URL.
- Payment-result handles success, pending, failed, and canceled states.
- Profile update validates fields, refreshes confirmed profile data, and shows
  recovery on failure.
- Address create validates required fields; unsupported update/delete/default
  mutations stay disabled with explicit backend-gap messaging.
- Order list/detail load through customer services and handle missing/error
  states.
- Expired sessions refresh where possible and otherwise route to login.

### Admin

- Admin login reaches `/admin` only for admin role.
- Non-admin protected access routes to forbidden handling.
- Dashboard renders backend-gap dashboard widgets without fake business data.
- Products support filters, create/update/delete confirmation, approval status,
  inventory fields, and backend-confirmed refresh.
- Categories support tree display, create/update/delete confirmation, and empty
  states.
- Inventory, orders, order detail/status updates, customers, revenue,
  payments/webhooks, and audit logs document backend gaps instead of fake
  mutations.
- Vouchers support list/filter/create/update/deactivate confirmation.
- Admin shell mobile sidebar, topbar, tables, forms, dialogs, and JSON/diff
  placeholders remain keyboard reachable.

### Completion Criteria

- Routing and layout ownership are mapped and non-duplicated.
- Auth, session restoration, refresh, logout, redirects, RBAC, unauthorized, and
  forbidden handling are hardened.
- API integration is domain-typed and uses shared error mapping.
- Mock/prototype code is removed or isolated behind service boundaries with
  explicit backend-gap comments.
- Loading, empty, error, validation, success, confirmation, pending, and
  recovery states are standardized.
- Required public responsive viewport checks pass in Chromium e2e; protected
  routes have guest redirect checks and source-level responsive/accessibility
  review.
- Next.js boundaries, metadata, assets, and config were reviewed.
- Lint, test, build, and Chromium e2e targets pass.

### Residual Risks

- Catalog read data remains temporary behind `lib/storefront/catalog.ts` until
  product/category read APIs are available.
- Several admin and customer operations remain intentionally disabled or
  represented as backend gaps where contracts are unavailable.
- Full authenticated customer/admin browser verification still requires seeded
  backend users and API availability; this pass verifies protected guest
  redirects, service boundaries, and source-level UI behavior for those routes.
- Next build warns that the `middleware` convention is deprecated in favor of
  `proxy`; migration is a follow-up because the current middleware still builds
  and runs.
- Next build warns about Flowbite `ThemeInit`; no visual failure was observed in
  the verified pages, but a future theme-customization pass should decide
  whether to render it at the root.
