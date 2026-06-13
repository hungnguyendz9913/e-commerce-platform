## 1. Runner Setup

- [x] 1.1 Add Playwright configuration for `apps/api-e2e` that uses API request testing and the existing API global prefix.
- [x] 1.2 Update the `api-e2e` Nx target so `npx nx e2e api-e2e` discovers and runs Playwright API specs.
- [x] 1.3 Preserve or migrate existing auth/profile API E2E coverage so the runner change does not drop current coverage.

## 2. Product Test Structure

- [x] 2.1 Create `apps/api-e2e/src/api/products` as the dedicated product API E2E test area.
- [x] 2.2 Add reusable product fixtures for documented public product, admin product, category, image, inventory, create payload, and update payload shapes.
- [x] 2.3 Add reusable API test helpers for starting the isolated Nest test app, creating authenticated admin/customer request states, and asserting documented response envelopes.

## 3. Public Product E2E Coverage

- [x] 3.1 Add Playwright API tests for `GET /products` with documented query parameters, visible product filtering, and pagination metadata assertions.
- [x] 3.2 Add Playwright API tests for `GET /products/{id}` returning documented product detail fields for a visible product.
- [x] 3.3 Add Playwright API tests verifying hidden, inactive, archived, pending, or rejected product detail is not publicly visible.

## 4. Admin Product E2E Coverage

- [x] 4.1 Add Playwright API tests for authenticated admin `GET /admin/products` with documented filters and pagination metadata assertions.
- [x] 4.2 Add Playwright API tests for authenticated admin `POST /admin/products` using the documented create payload and response shape.
- [x] 4.3 Add Playwright API tests for authenticated admin `PATCH /admin/products/{productId}` using the documented update payload and response shape.
- [x] 4.4 Add Playwright API tests for authenticated admin `DELETE /admin/products/{productId}` covering documented delete or archive response behavior.
- [x] 4.5 Add Playwright API tests for invalid product payloads and duplicate SKU or slug conflicts.

## 5. Access Control Coverage

- [x] 5.1 Add Playwright API tests verifying guest requests to `/admin/products` endpoints return unauthenticated errors.
- [x] 5.2 Add Playwright API tests verifying authenticated non-admin requests to `/admin/products` endpoints return forbidden errors.

## 6. Verification

- [x] 6.1 Run `npx nx e2e api-e2e` and fix any product E2E failures.
- [x] 6.2 Run relevant lint or typecheck command for `api-e2e` if available.
- [x] 6.3 Validate the OpenSpec change with `openspec validate test-products-e2e --strict`.
