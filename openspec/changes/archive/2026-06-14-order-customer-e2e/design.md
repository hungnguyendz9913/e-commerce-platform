## Context

The API E2E suite already has isolated controller-level Playwright coverage for carts, products, and vouchers using mocked services, token-based guard overrides, and response envelope assertions. Customer order endpoints do not have equivalent E2E coverage yet. The current order controller also differs from the customer cart controller because it does not declare `JwtAuthGuard`, `RolesGuard`, or customer role metadata, and order detail currently delegates to a repository query that returns only the base order row.

The order specification expects customers to list their own orders, view full order details, cancel eligible orders, and be blocked from other customers' orders. Cancellation also touches order history and inventory restoration, so the implementation needs both HTTP-level tests and focused service/repository tests for side effects that are not observable through a mocked controller E2E app.

## Goals / Non-Goals

**Goals:**

- Add order API E2E coverage that follows the existing `apps/api-e2e/src/api/*` conventions.
- Verify customer-only access for `GET /orders`, `GET /orders/:id`, and `POST /orders/:id/cancel`.
- Verify request validation for list query parameters and cancel payloads.
- Fix order customer endpoint defects exposed by the tests, especially missing guards/role metadata and incomplete detail projection.
- Verify cancellation status history and inventory restoration behavior with focused service/repository tests.

**Non-Goals:**

- Build checkout/order creation, payment capture, shipment, or admin order management flows.
- Add real database-backed E2E scenarios; this change keeps the current controller-isolated E2E style.
- Redesign order DTOs beyond the response fields required by existing order specs.

## Decisions

- Use controller-isolated Playwright E2E tests for HTTP behavior.
  - Rationale: This matches the existing cart/product/voucher E2E suite and keeps tests fast and deterministic.
  - Alternative considered: full database-backed E2E tests. Deferred because current API E2E infrastructure uses mocked services for controller contract coverage.

- Add order-specific E2E helpers and fixtures.
  - Rationale: Fixtures make response shape, service calls, auth rejection, and validation cases easy to scan and maintain.
  - Alternative considered: inline fixtures in the spec file. Rejected because order list/detail/cancel payloads are larger than cart fixtures.

- Test side effects with focused unit/service tests, not only controller E2E tests.
  - Rationale: A mocked order service can verify route behavior but cannot prove cancellation calls inventory restoration and status history in one transaction.
  - Alternative considered: expose side effects through E2E mocks. Rejected because it would test mock wiring rather than domain behavior.

- Fix customer access at the controller boundary using `@UseGuards(JwtAuthGuard, RolesGuard)` and `@Roles(RoleValues.CUSTOMER)`.
  - Rationale: This aligns orders with the cart controller and prevents unauthenticated or non-customer access before service execution.
  - Alternative considered: rely only on service user IDs. Rejected because unauthenticated requests should not reach controller methods and admins should not be treated as customers.

- Return a complete customer order detail projection from the repository.
  - Rationale: The orders spec requires header, items, delivery snapshot, amounts, status, and payment status. Returning only the order row misses the items needed by customers and tests.
  - Alternative considered: map detail shape in the service after loading multiple queries. A single repository projection is simpler and keeps ownership filtering in one query.

## Risks / Trade-offs

- Mocked E2E tests can miss Prisma mapping mistakes -> Add repository/service unit tests around detail projection and cancellation side effects where needed.
- Tight response-shape assertions can become noisy as DTOs evolve -> Assert required fields and envelope shape rather than every incidental property.
- Controller guard additions can change existing unauthenticated behavior -> Align expected behavior with cart endpoints: guests receive 401 and non-customers receive 403.
- Cancellation inventory restoration may currently increase stock rather than decrease reserved quantity -> Capture expected behavior in tests and leave broader reservation accounting changes to a future checkout/inventory proposal if needed.
