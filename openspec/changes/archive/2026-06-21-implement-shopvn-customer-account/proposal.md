## Why

ShopVN has completed the public storefront, authentication, catalog, cart, checkout, and customer order API foundations, but authenticated customers still lack a real account area to manage their profile, addresses, and order history. This change closes that customer self-service gap using the Figma Make customer screens as the visual and behavioral reference while staying on the existing Next.js, auth, and commerce contracts.

## What Changes

- Add an authenticated customer account area with a responsive account layout and dashboard entry point.
- Add customer profile viewing and update UI backed by the existing profile API contract where available.
- Add address book listing, add, edit, default-selection, and delete UI backed by existing customer address contracts where available.
- Add customer order list and order detail pages backed by existing customer order contracts.
- Present order and payment statuses with consistent badges, timeline/progress treatment, and empty/loading/error states.
- Require customer authentication for all account pages and avoid admin-only assumptions, admin routes, or admin management behavior.
- Reuse completed storefront layout, auth route protection, commerce service boundaries, formatting helpers, and API proxy patterns rather than Figma mock providers or in-memory demo data.

## Capabilities

### New Capabilities
- `customer-account`: Authenticated web customer account pages for profile, address book, order history, order detail, status presentation, async states, and responsive behavior.

### Modified Capabilities
- None.

## Impact

- Affected web app areas: `apps/web/src/app/customer`, customer account routes, shared storefront/account components, typed customer/profile/address/order service boundaries, and related tests.
- Affected API integrations: existing `/auth/me`, `/users/me`, `/users/me/addresses`, `/orders`, `/orders/{orderId}`, and `/orders/{orderId}/cancel` contracts where available, plus existing Next.js API proxy/auth cookie handling patterns.
- No backend schema changes are intended unless implementation discovers that a required existing customer, address, or order contract is missing.
- No admin pages, admin order-management UI, Figma mock auth/cart providers, `react-router`, Vite runtime patterns, or mock production data should be introduced.
