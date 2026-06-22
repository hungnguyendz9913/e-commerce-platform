## 1. Contract Discovery and Boundaries

- [x] 1.1 Confirm cart response shape from `GET /cart` and decide the web cart view model fields.
- [x] 1.2 Confirm checkout response shapes for `POST /checkout/validate`, `POST /checkout/voucher`, and `POST /checkout`.
- [x] 1.3 Confirm whether any payment status endpoint/controller exists; document missing live payment-status capability if absent.
- [x] 1.4 Confirm product listing/detail data exposes stable product ids and stock data needed for add-to-cart controls.
- [x] 1.5 Identify exact customer routes to protect for `/cart`, `/checkout`, and `/payment` without adding profile/order-history routes.

## 2. Typed Commerce Service Layer

- [x] 2.1 Add typed cart models and response-to-view-model mapping for cart items, totals, product display fields, and empty states.
- [x] 2.2 Add typed cart service functions for current cart, add item, update quantity, remove item, and clear cart.
- [x] 2.3 Add typed checkout models for delivery input, voucher input, payment provider selection, checkout validation summary, and order creation result.
- [x] 2.4 Add typed checkout service functions for validate checkout, apply voucher, and create order from cart.
- [x] 2.5 Add typed payment-result helpers for success, failed, canceled, and pending states using checkout/callback data available today.
- [x] 2.6 Add tests for service mapping, delivery-to-API payload normalization, payment provider values, and missing-backend-gap handling.

## 3. Route Protection and Navigation

- [x] 3.1 Update customer route protection to cover `/cart`, `/checkout`, and any scoped payment-result route that requires customer context.
- [x] 3.2 Update storefront header cart control to navigate to `/cart` while preserving current header layout and auth-aware behavior.
- [x] 3.3 Ensure guest attempts to use cart/checkout entry points redirect through login with safe `redirectTo`.

## 4. Cart UI

- [x] 4.1 Add `/cart` App Router page that loads the current backend cart and renders item rows, totals, empty state, and continue-shopping navigation.
- [x] 4.2 Add quantity controls that call the update-quantity service and reconcile UI from backend-confirmed state.
- [x] 4.3 Add remove-item behavior with confirmation or clear affordance and backend-backed state refresh.
- [x] 4.4 Add clear-cart behavior with confirmation and empty-state transition after backend success.
- [x] 4.5 Add stock and business-rule error feedback near affected cart items.
- [x] 4.6 Add cart page loading, error, and responsive states.

## 5. Catalog Add-to-Cart Entry Points

- [x] 5.1 Update product card components to support scoped add-to-cart controls for in-stock products without introducing checkout/profile/order-history behavior.
- [x] 5.2 Update product detail page to support quantity selection and add-to-cart behavior with backend stock validation.
- [x] 5.3 Ensure out-of-stock products disable or omit add-to-cart controls and communicate availability.
- [x] 5.4 Ensure add-to-cart implementation does not use Figma `CartProvider`, mock products as cart state, or browser-only in-memory totals.
- [x] 5.5 Add tests for authenticated add-to-cart, guest login redirect behavior, and out-of-stock disabled behavior.

## 6. Checkout UI

- [x] 6.1 Add `/checkout` App Router page that blocks empty-cart submission and renders cart review plus order summary.
- [x] 6.2 Add shipping information form with required recipient name, phone, and structured address fields mapped to `DeliveryInfoDto`.
- [x] 6.3 Add checkout validation before final review and display backend-derived subtotal, discount, shipping fee, and total.
- [x] 6.4 Add voucher code application through the backend checkout voucher contract with success and error states.
- [x] 6.5 Add payment provider selection limited to backend-supported `COD`, `MOMO`, and `VNPAY` values.
- [x] 6.6 Add order submission flow through `POST /checkout`, preserving cart state on backend failure.
- [x] 6.7 Add checkout loading, validation error, stale-stock, and responsive states.

## 7. Payment Result UI

- [x] 7.1 Add payment-result route/page for success, failed, canceled, and pending states using available checkout/callback data.
- [x] 7.2 Display order reference and payment method when returned by checkout or callback data.
- [x] 7.3 Route COD success directly to a success state and MOMO/VNPAY to returned payment URL or pending state as supported.
- [x] 7.4 Ensure payment-result UI excludes Figma demo status buttons and does not fake production payment status.
- [x] 7.5 Add tests for each payment-result state and retry/continue-shopping navigation.

## 8. Scope and Figma Boundary Checks

- [x] 8.1 Verify no customer profile, address book management, order history/detail pages, or admin functionality is introduced.
- [x] 8.2 Verify customer commerce files do not import Vite, `react-router`, Figma `CartProvider`, mock addresses, mock vouchers, or Tailwind CSS 4 patterns.
- [x] 8.3 Verify Tailwind CSS remains 3.4.3 and Flowbite/TypeScript/Next.js App Router remain the frontend baseline.

## 9. Verification

- [x] 9.1 Run targeted web unit/component tests for cart, checkout, payment result, service boundaries, and catalog add-to-cart behavior.
- [x] 9.2 Run relevant Nx lint/typecheck/test commands for `apps/web` and any touched shared libraries.
- [x] 9.3 Run a web build to catch App Router route and server/client boundary issues.
- [x] 9.4 Manually verify authenticated cart, quantity update, remove item, clear cart, checkout validation, voucher handling, payment selection, order creation, and payment-result flows against a real or contract-compatible API.
