## Why

The cart module has unit coverage and OpenSpec requirements, but it does not yet have API E2E coverage for the customer-facing cart endpoints. Adding focused API boundary tests reduces regression risk around route wiring, authentication, request validation, response envelopes, and service delegation for core cart workflows.

## What Changes

- Add API E2E tests for the customer cart endpoints using the existing Playwright request-based API E2E pattern.
- Cover authenticated customer flows for retrieving the active cart, adding an item, updating item quantity, removing an item, and clearing the cart.
- Cover expected validation and access behavior where it protects the tested routes, including guest rejection and invalid quantity payloads.
- Keep cart test fixtures, service mocks, setup helpers, and assertions organized so the API E2E suite remains maintainable.

## Capabilities

### New Capabilities
- `cart-api-e2e-tests`: Defines expected API E2E coverage and structure for the cart module endpoints.

### Modified Capabilities

None.

## Impact

- Affected test project: `apps/api-e2e`.
- Affected behavior under test: `GET /cart`, `POST /cart/items`, `PATCH /cart/items/{itemId}`, `DELETE /cart/items/{itemId}`, and `DELETE /cart`.
- Affected source files during implementation will likely include new API E2E specs, cart fixtures, and cart-specific test helpers.
- No runtime cart API behavior, DTO contracts, persistence models, or database schema changes are intended.
