## 1. Order API E2E Harness

- [x] 1.1 Create `apps/api-e2e/src/api/orders/fixtures.ts` with order ids, list query fixtures, detail fixtures, cancel payloads, and canceled order response fixtures.
- [x] 1.2 Create `apps/api-e2e/src/api/orders/helpers.ts` with an order service mock, reset/call-count helpers, API app setup, auth guard override, role guard provider, and data-envelope assertion helper.
- [x] 1.3 Add `apps/api-e2e/src/api/orders/orders.customer.spec.ts` covering successful customer list, detail, and cancel requests.
- [x] 1.4 Add E2E cases proving guest requests receive 401 and admin/non-customer requests receive 403 for all customer order endpoints without calling the order service.
- [x] 1.5 Add E2E validation cases for invalid list query parameters and invalid cancel payloads without calling the order service.

## 2. Order Endpoint Fixes

- [x] 2.1 Add `JwtAuthGuard`, `RolesGuard`, and customer role metadata to `OrderController` so customer order endpoints match the cart controller access model.
- [x] 2.2 Update order controller unit coverage to assert guard and role metadata, or rely on E2E assertions if the local controller-spec pattern is intentionally minimal.
- [x] 2.3 Update `OrderRepository.getMyOrderDetail` to return the required customer detail projection, including item snapshots, delivery snapshot, amount fields, status, and payment status while preserving ownership filtering.
- [x] 2.4 Ensure `OrderService.getMyOrderDetail` returns not found or an equivalent safe response for missing/cross-customer orders according to existing API error conventions.

## 3. Cancellation Side Effects

- [x] 3.1 Replace the placeholder `OrderService` spec setup with mocked order repository, transaction service, status history repository, and inventory service dependencies.
- [x] 3.2 Add service tests for canceling a pending customer order that verify status update, history creation, inventory restoration, and transaction client usage.
- [x] 3.3 Add service tests proving cross-customer and non-cancelable cancellation attempts reject before status, history, or inventory side effects.
- [x] 3.4 Add or update inventory service/repository tests if cancellation movement references or stock restoration behavior needs direct verification.

## 4. Verification

- [x] 4.1 Run focused order API E2E tests with `nx e2e api-e2e --grep "Order API"` or the closest supported Nx/Playwright filter.
- [x] 4.2 Run API unit tests for orders and inventory with the repository's supported Nx/Jest targets.
- [x] 4.3 Run the broader relevant API E2E suite if focused tests pass.
- [x] 4.4 Run `openspec status --change "order-customer-e2e"` and confirm all required artifacts are complete before implementation handoff.
