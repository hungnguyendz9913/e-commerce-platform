## Why

ShopVN now has a storefront, product catalog, and authenticated customer foundation, but customers still cannot complete the core commerce journey from product selection to cart, checkout, payment selection, and order creation. This change turns the existing catalog/auth baseline into a usable customer purchase flow while keeping production state in backend APIs rather than the Figma prototype's in-memory cart.

## What Changes

- Add customer-facing cart pages and controls for viewing cart contents, quantity updates, stock validation feedback, item removal, and cart clearing.
- Add add-to-cart entry points from product catalog/detail surfaces using authenticated customer cart APIs.
- Add checkout flow for shipping information, order summary, voucher/payment-aware totals where supported, payment provider selection, and order submission.
- Add payment result handling for success, failed, canceled, and pending outcomes using checkout/payment response data where available.
- Add typed web service boundaries for cart, checkout, order creation, and payment-result data access.
- Integrate with existing `/cart`, `/checkout`, `/orders`, and available payment-related API contracts.
- Clearly identify missing backend capabilities during implementation instead of filling gaps with production in-memory data.
- Use Figma MCP project `OwX29MxtI0gXCASf44pdGh` only as UI and flow reference for cart, checkout, and payment-result composition.
- Do not copy Figma `CartProvider`, mock addresses, mock vouchers, demo payment status buttons, in-memory cart state, Vite, or `react-router`.
- Reuse completed storefront, product catalog, and auth/RBAC work.
- Do not implement customer profile, address book management, order history/detail pages, or admin functionality in this change.

## Capabilities

### New Capabilities

- `customer-commerce`: Defines the web customer cart, checkout, payment-result, order creation, service-boundary, and scope behavior.

### Modified Capabilities

- `storefront-product-catalog`: Product listing/detail surfaces gain authenticated add-to-cart entry points and no longer remain strictly display-only.

## Impact

- Affected web code: `apps/web/src/app`, storefront product components/pages, customer commerce routes, auth-protected customer routes, typed web service modules, and focused web tests.
- Affected API usage: existing `GET /cart`, `POST /cart/items`, `PATCH /cart/items/{itemId}`, `DELETE /cart/items/{itemId}`, `DELETE /cart`, `POST /checkout/validate`, `POST /checkout/voucher`, `POST /checkout`, and any available order/payment status contracts.
- Expected backend gaps to verify: standalone payment status endpoint/controller availability, redirect/callback semantics for fake payment URLs, saved-address APIs, and whether product detail/list contracts expose enough stock data for add-to-cart controls.
- Dependencies: no Tailwind upgrade, no Vite migration, no Figma shadcn/Radix import, and no new dependency unless an implementation task documents a specific need.
