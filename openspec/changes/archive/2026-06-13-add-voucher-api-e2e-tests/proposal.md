## Why

The voucher module has controller and service coverage in progress, but it does not yet have API E2E coverage for the public voucher discovery routes or admin voucher management routes. Adding focused API boundary tests reduces regression risk around route wiring, role guards, request validation, response envelopes, and service delegation before voucher behavior becomes checkout-critical.

## What Changes

- Add API E2E coverage for voucher endpoints using the existing Playwright request-based `apps/api-e2e` pattern.
- Cover public product/category voucher discovery routes and admin voucher create/list/detail/update/deactivate routes.
- Cover expected access behavior for admin routes, including guest and non-admin rejection without service delegation.
- Cover DTO validation for admin create/update/query payloads where validation currently protects the route boundary.
- Keep voucher fixtures, service mocks, setup helpers, and assertions organized under a dedicated voucher API E2E test area.

## Capabilities

### New Capabilities

- `voucher-api-e2e-tests`: Defines expected API E2E coverage and structure for voucher module endpoints.

### Modified Capabilities

None.

## Impact

- Affected test project: `apps/api-e2e`.
- Affected behavior under test: `GET /vouchers/products/{productId}`, `GET /vouchers/categories/{categoryId}`, `POST /admin/vouchers`, `GET /admin/vouchers`, `GET /admin/vouchers/{voucherId}`, `PATCH /admin/vouchers/{voucherId}`, and `PATCH /admin/vouchers/{voucherId}/deactivate`.
- Affected source files during implementation will likely include new API E2E specs, voucher fixtures, and voucher-specific test helpers.
- No runtime voucher API behavior, DTO contracts, persistence models, or database schema changes are intended unless the E2E tests expose missing controller wiring required by the existing contract.
