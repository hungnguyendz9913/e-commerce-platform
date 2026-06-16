## Context

The current E2E test suite for the Cart API does not explicitly cover the scenario where a customer tries to add or update an item with a quantity that exceeds the available stock. This business logic is critical for preventing overselling. To properly test this, we must ensure our mocked Cart Service or e2e fixtures properly account for stock limits, or test the specific failure scenario when stock validation fails.

## Goals / Non-Goals

**Goals:**
- Add test cases to the API E2E test suite (`cart.spec.ts`) to verify that the `POST /cart/items` and `PATCH /cart/items/:itemId` endpoints reject requests when the requested quantity exceeds stock.
- Ensure the cart service mock handles throwing the appropriate domain/business error that simulates insufficient stock if mocking the service layer, or ensure the endpoint responds with the appropriate error payload expected by clients.

**Non-Goals:**
- Modifying the actual Cart domain logic or the cart service itself.
- Adding new API endpoints or modifying the structure of existing cart API requests/responses.

## Decisions

**Mocking Domain Violation:**
Because the API E2E tests for the cart module mock the internal `CartService` (as seen in `helpers.ts` via `createCartServiceMock`), we will configure the mocked `cartService.addItemToCart` and `cartService.updateCartItemQuantity` to simulate business rule violations (insufficient stock) using the standard domain error approach expected by the platform (usually resulting in a `400 Bad Request` or `422 Unprocessable Entity` response with the relevant error message).

**Test implementation:**
Add tests to `cart.spec.ts` that:
- Send a request to `POST /cart/items` with a high quantity.
- Mock the `CartService` to reject with an error representing insufficient stock.
- Assert that the API responds with a `4xx` error indicating the violation.
- Repeat for `PATCH /cart/items/:itemId`.

## Risks / Trade-offs

- **Risk**: Over-mocking. If the API layer changes its error handling logic, the tests might pass falsely or break. 
- **Mitigation**: The API test validates the integration between the controller and the platform's error filters. If the error filter behavior changes, the test will correctly catch the difference in response payloads.
