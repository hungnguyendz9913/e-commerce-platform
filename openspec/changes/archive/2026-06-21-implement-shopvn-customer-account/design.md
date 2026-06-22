## Context

The current web app is a Next.js App Router storefront with completed auth, product catalog, cart, checkout, and payment-result foundations. Customer route protection already recognizes `/customer`, `/cart`, `/checkout`, and `/payment-result` as customer-protected paths, and customer commerce code already uses typed service boundaries plus Next.js API proxy routes instead of direct component-level backend calls.

The Figma Make project `OwX29MxtI0gXCASf44pdGh` provides the visual and behavioral reference for the customer account area. Relevant screens include `AccountPage`, `ProfilePage`, `AddressesPage`, `OrdersPage`, and `OrderDetailPage`, plus shared `StatusBadge`, `EmptyState`, confirm modal, and skeleton patterns. Those files are reference material only; they use `react-router`, Figma mock data, and local state persistence that must not enter production implementation.

Existing API/spec context identifies available customer-facing contracts:
- Auth/current identity: `/auth/me`
- Profile: `/users/me`, `PATCH /users/me`
- Addresses: `/users/me/addresses`, `POST /users/me/addresses`, with update/delete/default behavior to be integrated where current contracts exist or documented as gaps if absent
- Orders: `GET /orders`, `GET /orders/{orderId}`, `POST /orders/{orderId}/cancel`

## Goals / Non-Goals

**Goals:**
- Implement a customer-only account section that feels native to the completed ShopVN storefront.
- Provide account overview, profile management, address book management, order list, order detail, status presentation, and robust empty/loading/error states.
- Reuse existing auth checks, cookie/session handling, commerce formatting patterns, API proxy style, and component conventions.
- Keep customer order and address access scoped to the authenticated customer.
- Preserve responsive behavior for mobile and desktop.

**Non-Goals:**
- No admin account, admin customer management, or admin order management pages.
- No backend schema changes unless implementation discovers an unavoidable missing contract.
- No Figma runtime migration, `react-router`, Vite setup, mock providers, role switchers, or browser-only production data stores.
- No replacement of completed cart, checkout, payment-result, catalog, or auth flows except for account navigation links needed to reach this feature.
- No payment-method management page unless an existing production API contract already supports it; the Figma payment-method quick link should be omitted or disabled as out of scope.

## Decisions

### 1. Route Under `/customer`

Use the existing protected `/customer` route family for the account area:
- `/customer` for account overview
- `/customer/profile`
- `/customer/addresses`
- `/customer/orders`
- `/customer/orders/[orderId]`

Rationale: `/customer` is already protected by the auth access helper, so this avoids introducing a second account namespace that might bypass middleware expectations. The Figma reference uses `/account` and `/orders`; implementation should translate that behavior into this app's route shape.

Alternative considered: add `/account` and top-level `/orders`. That matches Figma paths but requires expanding route protection and risks splitting customer account concerns across unrelated route roots.

### 2. Account Layout As Storefront-Compatible Shell

Create a customer account layout that sits inside the existing storefront visual language: restrained page background, constrained content width, compact section navigation, and no nested card-heavy page shell. Desktop can use a sidebar or horizontal section nav; mobile should collapse to horizontally scrollable tabs or a compact menu without horizontal page scrolling.

Rationale: The Figma screens are clean card-based customer pages, but this repo already has a storefront header/footer and Tailwind conventions. The implementation should adapt the Figma composition rather than copy classes literally.

Alternative considered: copy Figma page components one-for-one. That would pull in rounded `2xl` card patterns, `react-router` links, and mock data assumptions that conflict with the current app.

### 3. Add Typed Customer Account Services

Add a small customer account service boundary in `apps/web/src/lib/customer` or a similarly local convention:
- profile functions for current profile load/update
- address functions for list/create/update/delete/default where supported
- order functions for list/detail/cancel, possibly reusing commerce types/formatting where they already exist

Expose these through Next.js API route proxies when browser-initiated mutations need auth cookies/session forwarding, following existing cart and checkout proxy patterns.

Rationale: Existing commerce code already established typed service boundaries and proxy helpers. Keeping account APIs behind the same pattern reduces duplicated fetch/error handling and makes tests straightforward.

Alternative considered: fetch directly in client components. That would be faster initially but weaker for auth handling, retry/error normalization, and testing.

### 4. Treat Backend Gaps Explicitly

Use existing customer, address, and order API contracts where available. If profile update or address update/delete/default endpoints are absent or partially shaped differently, the UI should either:
- implement only contract-supported behavior, with unavailable actions hidden/disabled and documented, or
- add a narrowly scoped backend contract only if project owners choose to expand the API during implementation.

Rationale: The request asks to integrate with existing contracts where available. Silent mock persistence would look functional while corrupting the product contract.

Alternative considered: emulate missing mutations in local state. This is acceptable in a prototype but not for production account management.

### 5. Status Presentation Maps Backend Values

Create a local status presentation map for order and payment statuses based on existing backend enum/string values. Use Vietnamese labels and visual treatments inspired by Figma:
- order: pending, processing, shipped, delivered, canceled, refunded
- payment: pending, succeeded, failed, canceled or existing backend equivalents

Order detail should show a progression timeline only for active fulfillment states and terminal messaging for canceled/refunded states.

Rationale: The Figma `StatusBadge` demonstrates the desired behavior, but backend values are the source of truth. A mapping layer prevents raw enum values leaking into UI and keeps unknown statuses safe.

Alternative considered: reuse Figma status component verbatim. It mixes product, approval, user, inventory, webhook, voucher, order, and payment statuses in one broad map; the customer account area only needs a smaller, typed surface.

### 6. Server-First Loading With Client Islands For Mutations

Prefer server components for initial account/order reads where they can use auth-aware server helpers, and client components for forms, modals, status filters, confirmation flows, and optimistic pending UI. Use route-level `loading.tsx` and `error.tsx` where useful, plus local skeletons for client-side filter/mutation refreshes.

Rationale: This matches Next.js App Router strengths while keeping interactive pieces focused. It also improves first render consistency for protected pages.

Alternative considered: make the whole account area client-rendered. That simplifies local interaction but pushes more auth/data loading into the browser and increases layout-state complexity.

## Risks / Trade-offs

- Missing address mutation contracts -> Document the gap and avoid fake persistence; implement only available calls or add a follow-up backend proposal if needed.
- Backend order status values differ from the Figma mock names -> Normalize through typed status mapping and render unknown values with a neutral fallback.
- Customer route protection may currently be placeholder-level only -> Verify middleware/server helpers protect all nested `/customer/*` paths and add tests for guest/customer/admin access expectations.
- Profile identity can become stale after update -> Refresh `/auth/me` or current profile data after successful mutation rather than only updating local form state.
- Client-side filters can drift from backend pagination -> Use supported backend query parameters where available; otherwise filter only the current loaded page and keep the behavior explicit in tests.
- Dense mobile order cards may overflow -> Use fixed media sizes, wrapping status rows, constrained buttons, and viewport checks before completion.

## Migration Plan

1. Add customer account service/types and tests around profile, address, and order normalization.
2. Add or extend Next.js API route proxies for customer account contracts that require browser-initiated authenticated requests.
3. Replace the placeholder `/customer` page with the authenticated account overview and add nested customer routes.
4. Implement profile, address, order list, and order detail UI from the Figma reference adapted to existing storefront styling.
5. Add route-level loading/error states and focused component/service tests.
6. Run relevant web tests, lint/type checks where available, and manually verify responsive behavior.

Rollback is straightforward because the change is additive to the customer route family. Revert the new customer account routes/services and restore the placeholder `/customer` page if needed.

## Open Questions

## Contract Discovery Notes

- Profile is available through `GET /users/me` and `PATCH /users/me`; supported editable fields are `fullName`, `phone`, and `avatarUrl`.
- Address listing and creation are available through `GET /users/me/addresses` and `POST /users/me/addresses`.
- Address update, delete, and default-selection endpoints are not currently exposed by the API. The first UI pass must avoid browser-only mock persistence for these actions and present them as unavailable until backend contracts are added.
- Customer orders are available through `GET /orders`, `GET /orders/{orderId}`, and `POST /orders/{orderId}/cancel`; cancellation is backend-eligible for `PENDING` and `PROCESSING`.
