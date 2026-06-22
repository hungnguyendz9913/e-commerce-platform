## 1. Contract Discovery

- [x] 1.1 Inspect existing web auth, proxy, commerce service, and customer route protection helpers for reusable patterns.
- [x] 1.2 Inspect existing API/user/order controllers or web proxy routes to confirm exact profile, address, order list, order detail, and cancel endpoint shapes.
- [x] 1.3 Document any missing profile or address mutation contracts before implementing UI actions that depend on them.

## 2. Customer Account Data Layer

- [x] 2.1 Add typed customer account models for profile, address, order summary, order detail, status, payment status, and mutation payloads.
- [x] 2.2 Add normalizers and formatting helpers for backend profile, address, order, amount, date, and status data.
- [x] 2.3 Add customer account service functions for profile load/update through existing contracts.
- [x] 2.4 Add customer address service functions for list, create, update, delete, and default selection where existing contracts support them.
- [x] 2.5 Add customer order service functions for list, detail, and cancellation through existing order contracts.
- [x] 2.6 Add or extend Next.js API proxy routes needed for authenticated browser-side customer account mutations.

## 3. Shared Customer Account UI

- [x] 3.1 Add customer account layout/navigation under the protected `/customer` route family.
- [x] 3.2 Add status badge and order timeline presentation mapped to backend order and payment status values.
- [x] 3.3 Add reusable empty, loading, error, and confirmation UI patterns consistent with existing storefront components.
- [x] 3.4 Verify account navigation avoids admin links, admin role assumptions, Figma mock providers, `react-router`, and Vite-specific code.

## 4. Account Overview and Profile

- [x] 4.1 Replace the placeholder `/customer` page with an account overview showing customer identity, address/order summary data when available, and recent orders.
- [x] 4.2 Add `/customer/profile` with read-only email and editable supported profile fields.
- [x] 4.3 Add profile form validation, pending, success, and error handling.
- [x] 4.4 Refresh current customer identity after successful profile updates.

## 5. Address Book

- [x] 5.1 Add `/customer/addresses` with authenticated address loading, empty state, and default-address presentation.
- [x] 5.2 Add address create UI with required-field validation and backend-backed persistence.
- [x] 5.3 Add address edit UI using backend-backed persistence when the contract exists.
- [x] 5.4 Add delete confirmation flow that removes an address only after backend success when the contract exists.
- [x] 5.5 Add default-address selection behavior that presents at most one default address after success.
- [x] 5.6 Hide, disable, or explicitly document unsupported address mutations instead of using mock local persistence.

## 6. Orders

- [x] 6.1 Add `/customer/orders` with customer order loading, status filters, item summaries, totals, status badges, and empty/error states.
- [x] 6.2 Add `/customer/orders/[orderId]` with order header, items, delivery snapshot, payment details, totals, and status timeline.
- [x] 6.3 Add not-found, forbidden, unauthorized, loading, and error handling for order detail.
- [x] 6.4 Add customer cancellation UI for eligible statuses when the existing order cancel contract is available.
- [x] 6.5 Hide cancellation actions for non-cancelable statuses and refresh order detail after successful cancellation.

## 7. Responsive and Accessibility Pass

- [x] 7.1 Verify mobile account navigation, forms, modals, filters, cards, and order details do not overflow or overlap.
- [x] 7.2 Verify desktop pages use readable constrained widths and preserve the existing storefront visual language.
- [x] 7.3 Verify form controls, icon buttons, dialogs, status labels, and error messages are keyboard-accessible and screen-reader usable.

## 8. Tests and Verification

- [x] 8.1 Add unit tests for customer account normalizers, status mappings, and service request payloads.
- [x] 8.2 Add focused component tests for profile validation, address empty/mutation states, order filters, and order detail status/cancel behavior.
- [x] 8.3 Add or update route protection tests for guest, customer, and admin access expectations on `/customer/*` routes.
- [x] 8.4 Run the relevant web test suite, type checking, and linting commands used by the project.
- [x] 8.5 Manually verify the implemented customer account pages against the Figma Make reference on mobile and desktop.
