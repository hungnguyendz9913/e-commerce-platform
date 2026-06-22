## Context

The repository now has a Next.js App Router storefront, public product catalog/detail pages, and cookie-backed customer authentication/RBAC. The NestJS API already exposes customer cart endpoints under `/cart` and checkout endpoints under `/checkout`; order list/detail endpoints exist but order history pages are explicitly out of scope for this change. A standalone payment controller is not present in the API tree, while checkout supports COD and fake payment URL paths for MOMO/VNPAY through the checkout service.

The Figma Make project `OwX29MxtI0gXCASf44pdGh` provides useful visual and flow references for cart, checkout, and payment result screens. Its implementation uses `CartProvider`, mock products, mock addresses, mock vouchers, demo payment status buttons, `react-router`, and in-memory state. Those are reference-only and must not become the production architecture.

## Goals / Non-Goals

**Goals:**

- Add authenticated customer cart UI for current cart retrieval, quantity updates, remove item, clear cart, stock feedback, empty states, and order summary.
- Add product catalog/detail add-to-cart entry points that call typed web commerce services.
- Add checkout UI for shipping information, cart review, voucher application when supported, payment provider selection, validation, and order submission.
- Add payment-result UI for success, failed, canceled, and pending outcomes using checkout response data and available backend status capabilities.
- Keep cart/checkout/order/payment data access behind typed web service boundaries.
- Reuse completed auth, storefront, and product catalog code and tests.
- Document or isolate backend gaps instead of replacing them with Figma in-memory state.

**Non-Goals:**

- Do not implement customer profile pages, saved-address management, order history/detail pages, or admin functionality.
- Do not add a production in-memory cart provider.
- Do not copy Figma mock addresses, mock vouchers, demo payment status buttons, Vite, `react-router`, or shadcn/Radix primitives.
- Do not change backend data models unless implementation discovers a blocking contract gap and the OpenSpec artifacts are updated.
- Do not introduce Tailwind CSS 4 or replace the current Flowbite/Next.js/TypeScript baseline.

## Decisions

### Use backend cart and checkout APIs as the source of truth

Cart state will be fetched and mutated through `/cart` endpoints. Checkout validation, voucher application, and order creation will use `/checkout` endpoints. Web UI state may optimistically show loading/disabled states, but it must reconcile with backend responses after each mutation.

Alternative considered: reuse Figma `CartProvider`. Rejected because in-memory state would drift from authenticated cart ownership, stock validation, pricing snapshots, and checkout totals.

### Put commerce access behind typed web service boundaries

Add a focused web commerce service layer for cart, checkout, and payment result calls. Components should consume typed cart/checkout view models instead of making ad hoc fetch calls or depending directly on backend response details.

Alternative considered: fetch directly inside each cart and checkout component. Rejected because error handling, auth failures, stock conflicts, totals, and payment redirects need consistent behavior.

### Keep checkout as a guided but contract-driven flow

Use the Figma step sequence as visual reference, but shape payloads around current `CheckoutDto`, `DeliveryInfoDto`, `ApplyVoucherDto`, and `CheckoutPaymentProvider`. Since the current API requires a single `shippingAddress` string rather than discrete city/district/ward fields, the UI can collect structured address fields and map them to the contract behind the service boundary.

Alternative considered: force the UI to expose only a single address textarea. Rejected because the Figma flow and shopper ergonomics benefit from structured fields, and the service layer can normalize to the existing API.

### Treat payment result as checkout-response driven until payment APIs exist

COD checkout can show immediate success from the checkout response. MOMO/VNPAY can follow the `paymentUrl` returned by checkout when present, and the payment result page can render status from trusted callback/query state plus any available order/payment data. If implementation requires live payment status polling and no endpoint exists, document the missing backend capability rather than inventing a fake production status service.

Alternative considered: copy Figma demo status buttons. Rejected because that is explicitly demo behavior.

### Protect customer commerce routes with completed auth/RBAC

Cart and checkout pages must require an authenticated customer and preserve safe login redirects. Product add-to-cart attempts by guests should route through the existing login flow instead of creating anonymous carts in this change.

Alternative considered: guest carts. Rejected because backend cart contracts are authenticated-customer scoped.

### Keep out-of-scope customer pages out of navigation

Payment success may show order number/summary and links to continue shopping, but it must not introduce order history/detail pages. Any link to future order history should be omitted, disabled, or routed only if an existing page is already in scope.

Alternative considered: implement `/orders` pages now. Rejected by the requested scope.

## Risks / Trade-offs

- Backend response shapes may not have generated DTOs for cart/checkout responses -> Define narrow web response/view-model types and update them against real API behavior during implementation.
- Product catalog currently has temporary data boundaries -> Add-to-cart must use stable product ids and degrade clearly if a product cannot be added through the real cart API.
- Payment status endpoints may be missing -> Limit payment result behavior to checkout response/callback state and document the missing live-status backend capability.
- Stock can change between cart view and checkout -> Revalidate cart/checkout through backend before enabling order submission and surface business-rule errors near affected items.
- Auth/session expiry can interrupt cart or checkout mutation -> Reuse auth proxy/session behavior and redirect unauthenticated responses to login with safe `redirectTo`.

## Migration Plan

1. Build typed commerce service boundaries and response/view-model mapping.
2. Add cart route/UI and cart mutation behavior.
3. Add catalog/detail add-to-cart entry points.
4. Add checkout route/UI, validation, voucher application, payment provider selection, and order creation.
5. Add payment-result route/UI.
6. Add focused tests and run Nx/Jest/build verification.

Rollback is limited to removing the new web commerce routes/components/services and reverting catalog add-to-cart controls; backend contracts are expected to remain unchanged.

## Open Questions

- Does checkout return a stable order id/order number and payment id for all payment providers, or only an order object/payment URL?
- Should MOMO/VNPAY result routing be driven by provider callback URLs, fake payment URLs, or an internal `/payment` route for the first implementation?
- Are backend cart response totals and item image fields sufficient for a polished cart page, or does the web layer need to enrich cart items from the product catalog boundary?
