## 1. Cart E2E Test Structure

- [x] 1.1 Create `apps/api-e2e/src/api/carts` for cart API E2E specs, fixtures, and helpers.
- [x] 1.2 Add cart fixtures for active cart response data, cart item response data, add-item payloads, update-quantity payloads, item ids, and product ids.
- [x] 1.3 Add cart API E2E helpers for creating a mocked `CartService`, resetting mock calls, starting an isolated Nest test app with `CartController`, and closing test resources.

## 2. Route Protection

- [x] 2.1 Verify `CartController` applies customer authentication and role guards for every cart endpoint; add the minimal guard metadata if the current controller does not enforce the existing customer-only cart requirement.
- [x] 2.2 Add E2E tests proving guest requests to `GET /cart`, `POST /cart/items`, `PATCH /cart/items/{itemId}`, `DELETE /cart/items/{itemId}`, and `DELETE /cart` return unauthenticated errors without calling `CartService`.
- [x] 2.3 Add E2E tests proving authenticated non-customer requests to the same cart endpoints return forbidden errors without calling `CartService`.

## 3. Cart Endpoint Success Coverage

- [x] 3.1 Add a Playwright API test for authenticated customer `GET /cart` returning the documented active cart `data` envelope and delegating with the current user's `userId`.
- [x] 3.2 Add a Playwright API test for authenticated customer `POST /cart/items` returning `201 Created`, the documented cart item `data` envelope, and delegating with `userId` plus the add-item DTO.
- [x] 3.3 Add a Playwright API test for authenticated customer `PATCH /cart/items/{itemId}` returning `200 OK`, the documented updated item `data` envelope, and delegating with `userId`, `itemId`, and the update DTO.
- [x] 3.4 Add a Playwright API test for authenticated customer `DELETE /cart/items/{itemId}` returning `{ data: { success: true } }` and delegating with `userId` plus `itemId`.
- [x] 3.5 Add a Playwright API test for authenticated customer `DELETE /cart` returning `{ data: { success: true } }` and delegating with `userId`.

## 4. Validation Coverage

- [x] 4.1 Add E2E tests proving `POST /cart/items` rejects invalid `productId`, non-integer quantity, and non-positive quantity before `CartService.addItemToCart` is called.
- [x] 4.2 Add E2E tests proving `PATCH /cart/items/{itemId}` rejects missing quantity, non-integer quantity, and non-positive quantity before `CartService.updateCartItemQuantity` is called.

## 5. Verification

- [x] 5.1 Run `npx nx e2e api-e2e` and fix cart E2E failures.
- [x] 5.2 Run relevant lint or typecheck command for the affected API/API-E2E projects if available.
- [x] 5.3 Validate the OpenSpec change with `openspec validate cart-module-test --strict`.
