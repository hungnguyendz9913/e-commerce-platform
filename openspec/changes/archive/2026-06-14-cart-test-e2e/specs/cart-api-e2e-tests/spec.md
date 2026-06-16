## ADDED Requirements

### Requirement: Cart API E2E tests enforce stock limits
The cart API E2E suite SHALL verify that the API enforces stock limits when adding or updating cart items.

#### Scenario: Add item rejects quantity exceeding stock
- **WHEN** an authenticated customer calls `POST /cart/items` with a quantity greater than the available stock
- **THEN** the suite MUST verify that the API rejects the request due to stock limits (e.g. business rule violation).

#### Scenario: Update item rejects quantity exceeding stock
- **WHEN** an authenticated customer calls `PATCH /cart/items/{itemId}` with a quantity greater than the available stock
- **THEN** the suite MUST verify that the API rejects the request due to stock limits.
