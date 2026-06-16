## Why

The current API E2E tests for the Cart module cover basic CRUD operations and role-based access but do not sufficiently verify domain-level business rules, specifically that a customer cannot add or update an item's quantity to exceed the available stock. Ensuring this behavior is correct at the integration/E2E level is critical to prevent overselling inventory.

## What Changes

- Expand the Cart E2E test suite to explicitly test business rules around inventory availability.
- Ensure that `POST /cart/items` and `PATCH /cart/items/:itemId` reject requests when the requested quantity exceeds the available product stock.
- The tests will cover the core endpoints (`GET /cart`, `POST /cart/items`, `PATCH /cart/items/:itemId`, `DELETE /cart/items/:itemId`, `DELETE /cart`) with a focus on enforcing the "quantity does not exceed stock" rule.

## Capabilities

### New Capabilities

- (None)

### Modified Capabilities

- `cart-api-e2e-tests`: Add requirement to verify business rule violations when requested cart item quantity exceeds available stock.

## Impact

- Cart API E2E tests (`apps/api-e2e/src/api/carts/cart.spec.ts` or related cart tests) will be updated or expanded.
- Test mocks or test database seeding will need to account for stock availability checks if testing through the service layer.