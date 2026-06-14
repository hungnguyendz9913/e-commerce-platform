## Why

Customer order endpoints currently lack E2E coverage, so regressions in authentication, authorization, response shape, and cancellation side effects can pass unnoticed. The current order controller and repository show likely gaps around customer-only access and order detail contents, making this test coverage useful before expanding checkout and payment flows.

## What Changes

- Add customer order API E2E tests for listing orders, viewing order detail, and canceling an order.
- Cover guest and non-customer rejection for all customer order endpoints.
- Cover validation and business-rule behavior for order listing filters and cancellation requests.
- Use the tests to expose and then fix defects in the order customer flow, including missing customer guards/roles and incomplete order detail data.
- Verify customer cancellation restores inventory stock and records order status history/movement side effects at the service/repository boundary where appropriate.

## Capabilities

### New Capabilities
- `order-api-e2e-tests`: Customer-facing order API E2E coverage for authentication, authorization, listing, detail, cancellation, and expected error paths.

### Modified Capabilities
- `orders`: Clarify customer order endpoints require authenticated customer access and order detail returns items plus delivery, amount, status, and payment snapshots.

## Impact

- Affected API code: `apps/api/src/app/orders/order.controller.ts`, `apps/api/src/app/orders/order.service.ts`, `apps/api/src/app/orders/order.repository.ts`, and related order tests.
- Affected E2E code: new order API tests and helpers under `apps/api-e2e/src/api/orders/`.
- Affected domain behavior: customer order access control, order detail projection, cancellation status history, and inventory restoration expectations.
