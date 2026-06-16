## 1. Setup E2E Test Mock Expectations

- [x] 1.1 In `apps/api-e2e/src/api/carts/helpers.ts` (if needed) or directly in the tests, determine how the cart service mock throws domain/business rule errors for stock limits (e.g., throwing a `BadRequestException` or a specific domain error class mapped to 400).

## 2. Implement E2E Tests for Stock Limits

- [x] 2.1 In `apps/api-e2e/src/api/carts/cart.spec.ts`, add a test for `POST /cart/items` that simulates the user requesting a quantity exceeding stock. Mock `cartService.addItemToCart` to reject with an appropriate insufficient stock error, and assert that the API responds with a `4xx` error code (e.g. `400 Bad Request`).
- [x] 2.2 In `apps/api-e2e/src/api/carts/cart.spec.ts`, add a test for `PATCH /cart/items/:itemId` that simulates the user updating an item to a quantity exceeding stock. Mock `cartService.updateCartItemQuantity` to reject with an appropriate insufficient stock error, and assert that the API responds with a `4xx` error code.

## 3. Verify and Run Tests

- [x] 3.1 Run the api-e2e tests for carts (`npx nx e2e api-e2e` or specifically the cart tests) to ensure the new tests pass and do not break any existing functionality.