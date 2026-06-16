# cart-api-e2e-tests Specification

## Purpose
TBD - created by archiving change cart-module-test. Update Purpose after archive.
## Requirements
### Requirement: Cart API E2E tests cover documented customer cart endpoints
The cart API E2E suite SHALL cover the documented customer cart endpoints through the API global prefix and assert their success status codes, response envelopes, and service delegation.

#### Scenario: Customer gets active cart
- **WHEN** an authenticated customer calls `GET /cart`
- **THEN** the suite MUST verify that the API returns `200 OK` with the documented cart `data` envelope
- **AND** it MUST verify that the cart service receives the authenticated customer's `userId`.

#### Scenario: Customer adds an item to cart
- **WHEN** an authenticated customer calls `POST /cart/items` with a valid `productId` and `quantity`
- **THEN** the suite MUST verify that the API returns `201 Created` with the documented cart item `data` envelope
- **AND** it MUST verify that the cart service receives the authenticated customer's `userId` and add-item payload.

#### Scenario: Customer updates cart item quantity
- **WHEN** an authenticated customer calls `PATCH /cart/items/{itemId}` with a valid positive `quantity`
- **THEN** the suite MUST verify that the API returns `200 OK` with the documented updated cart item `data` envelope
- **AND** it MUST verify that the cart service receives the authenticated customer's `userId`, route `itemId`, and update payload.

#### Scenario: Customer removes a cart item
- **WHEN** an authenticated customer calls `DELETE /cart/items/{itemId}`
- **THEN** the suite MUST verify that the API returns `200 OK` with `{ "data": { "success": true } }`
- **AND** it MUST verify that the cart service receives the authenticated customer's `userId` and route `itemId`.

#### Scenario: Customer clears active cart
- **WHEN** an authenticated customer calls `DELETE /cart`
- **THEN** the suite MUST verify that the API returns `200 OK` with `{ "data": { "success": true } }`
- **AND** it MUST verify that the cart service receives the authenticated customer's `userId`.

### Requirement: Cart API E2E tests enforce customer access
The cart API E2E suite SHALL verify that cart endpoints are available only to authenticated customers.

#### Scenario: Guest cannot access cart endpoints
- **WHEN** a guest calls any documented cart endpoint
- **THEN** the suite MUST verify that the API returns an unauthenticated error
- **AND** it MUST verify that the cart service is not called.

#### Scenario: Non-customer cannot access cart endpoints
- **WHEN** an authenticated non-customer calls any documented cart endpoint
- **THEN** the suite MUST verify that the API returns a forbidden error
- **AND** it MUST verify that the cart service is not called.

### Requirement: Cart API E2E tests cover request validation
The cart API E2E suite SHALL verify that invalid cart command payloads are rejected before reaching cart service methods.

#### Scenario: Add item rejects invalid payload
- **WHEN** an authenticated customer calls `POST /cart/items` with an invalid `productId` or non-positive `quantity`
- **THEN** the suite MUST verify that the API returns a validation error
- **AND** it MUST verify that the cart service is not called for the invalid request.

#### Scenario: Update quantity rejects invalid payload
- **WHEN** an authenticated customer calls `PATCH /cart/items/{itemId}` with a missing, non-integer, or non-positive `quantity`
- **THEN** the suite MUST verify that the API returns a validation error
- **AND** it MUST verify that the cart service is not called for the invalid request.

### Requirement: Cart API E2E tests enforce stock limits
The cart API E2E suite SHALL verify that the API enforces stock limits when adding or updating cart items.

#### Scenario: Add item rejects quantity exceeding stock
- **WHEN** an authenticated customer calls `POST /cart/items` with a quantity greater than the available stock
- **THEN** the suite MUST verify that the API rejects the request due to stock limits (e.g. business rule violation).

#### Scenario: Update item rejects quantity exceeding stock
- **WHEN** an authenticated customer calls `PATCH /cart/items/{itemId}` with a quantity greater than the available stock
- **THEN** the suite MUST verify that the API rejects the request due to stock limits.

### Requirement: Cart API E2E files are organized for maintainability
The API E2E project SHALL keep cart API tests, fixtures, service mocks, and assertions in a dedicated cart API test area.

#### Scenario: Cart tests use reusable fixtures and helpers
- **WHEN** cart API E2E tests are added
- **THEN** cart-specific fixtures and mock helpers MUST be reusable across cart endpoint scenarios
- **AND** the tests MUST use the shared API E2E support helpers for Nest app setup, authenticated request headers, and resource cleanup.

#### Scenario: API E2E command runs cart tests
- **WHEN** `npx nx e2e api-e2e` is executed
- **THEN** the command MUST discover and run the cart API E2E tests.

