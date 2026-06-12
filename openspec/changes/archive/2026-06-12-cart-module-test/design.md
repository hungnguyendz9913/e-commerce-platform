## Context

The cart module exposes `GET /cart`, `POST /cart/items`, `PATCH /cart/items/{itemId}`, `DELETE /cart/items/{itemId}`, and `DELETE /cart` for authenticated customers. The repository already has Playwright request-based API E2E patterns under `apps/api-e2e/src/api`, shared Nest test-app helpers in `apps/api-e2e/src/support/api-test-app.ts`, and product API E2E tests that validate routes, guards, validation pipes, status codes, and response envelopes with mocked services.

The cart runtime requirements already exist in `openspec/specs/cart/spec.md`, and the documented API contract lives in `docs/api_documentation.md`. This change adds E2E test coverage for those existing cart contracts. The implementation should avoid database lifecycle work unless an existing stable database harness is already available.

## Goals / Non-Goals

**Goals:**

- Add Playwright API request tests for the five documented cart endpoints.
- Verify authenticated customer requests call `CartService` with the current user's `userId`, route params, and DTO payloads.
- Verify response envelopes and status codes for get cart, add item, update quantity, remove item, and clear cart.
- Verify route protection for guests and non-customer roles where applicable.
- Verify DTO validation for invalid add-item and update-quantity payloads.
- Keep cart E2E fixtures and helpers organized in a dedicated cart API test area.

**Non-Goals:**

- Add browser UI cart tests.
- Add database-backed cart integration tests, seed data, or transaction cleanup.
- Change cart business rules, persistence schema, or DTO contracts beyond minimal route wiring needed to satisfy the existing customer-only cart requirement.
- Rework unrelated API E2E tests.

## Decisions

1. Use the existing Playwright API E2E style with an isolated Nest test application.

   Rationale: `apps/api-e2e` already starts lightweight Nest applications, uses `APIRequestContext`, and mocks service providers. This validates controller routing, global prefix handling, guards, pipes, error mapping, and response shape without adding database flake.

   Alternative considered: Drive tests through the full `AppModule` and a real database. That would provide deeper integration, but it requires reliable cart/product/user seeds and cleanup outside this change's scope.

2. Create a dedicated cart API E2E folder.

   Rationale: Cart tests need reusable fixtures for cart summaries, cart items, request payloads, and mock service helpers. A folder such as `apps/api-e2e/src/api/carts` keeps the suite consistent with the existing product E2E structure and prevents one-off duplication.

   Expected structure:

   - `apps/api-e2e/src/api/carts/cart.spec.ts`
   - `apps/api-e2e/src/api/carts/fixtures.ts`
   - `apps/api-e2e/src/api/carts/helpers.ts`

   Alternative considered: Put all tests directly in one top-level `cart.spec.ts`. That is faster initially but scales poorly once stock, ownership, and checkout-adjacent cases are added.

3. Mock `CartService` at the API boundary.

   Rationale: The E2E target is the HTTP boundary: paths, methods, guards, validation, current-user injection, status codes, and response payloads. Mocking `CartService` makes these assertions deterministic and mirrors current product API E2E practice.

   Alternative considered: Mock `CartRepository` and `ProductsService` under a real `CartService`. That would test more cart business logic but belongs in service or integration tests and would make route tests harder to read.

4. Treat `docs/api_documentation.md` and `openspec/specs/cart/spec.md` as the contract.

   Rationale: The tests should assert the documented cart API paths, customer-only access, request payloads, response envelopes, and success statuses. If the current controller or service response shape differs from the docs, implementation should either align the route boundary with the documented contract or document the mismatch before changing scope.

   Alternative considered: Encode the current controller return values exactly. That could preserve implementation quirks while missing the documented API contract the frontend depends on.

## Risks / Trade-offs

- Current cart guard wiring may not enforce customer authentication as documented -> Add tests that prove guest and non-customer requests are rejected, and make the minimal controller metadata fix if those tests expose a gap.
- Mocked service tests can miss repository or stock-calculation regressions -> Keep assertions focused on API boundary behavior and leave database-backed stock validation to service or integration tests.
- Cart response shape may not currently match the documented `data` envelope -> Prefer the documented contract in fixtures and tests; treat any mismatch as an implementation finding during apply.
- Test helper duplication can grow across product and cart suites -> Reuse existing support helpers and keep cart-specific helper code small.
