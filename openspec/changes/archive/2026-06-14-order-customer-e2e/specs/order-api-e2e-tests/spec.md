## ADDED Requirements

### Requirement: Customer order API E2E coverage
The system SHALL provide E2E tests for customer-facing order endpoints using the existing API E2E harness, mocked order service, token auth guard override, role guard, and response envelope assertions.

#### Scenario: List orders returns the authenticated customer's orders
- **WHEN** an authenticated customer calls `GET /api/orders` with valid query parameters
- **THEN** the response status is 200
- **AND** the response includes a `data` array and pagination `meta`
- **AND** the order service is called with the authenticated customer user id and transformed query values.

#### Scenario: View order detail returns a customer order detail
- **WHEN** an authenticated customer calls `GET /api/orders/{orderId}`
- **THEN** the response status is 200
- **AND** the response includes order header, item snapshots, delivery snapshot, amount fields, status, and payment status
- **AND** the order service is called with the authenticated customer user id and order id.

#### Scenario: Cancel order accepts an optional reason
- **WHEN** an authenticated customer calls `POST /api/orders/{orderId}/cancel` with a valid reason
- **THEN** the response status is 201
- **AND** the response includes the canceled order
- **AND** the order service is called with the authenticated customer user id, order id, and cancel payload.

#### Scenario: Guest requests are rejected
- **WHEN** a request without an authentication token calls any customer order endpoint
- **THEN** the response status is 401
- **AND** the order service is not called.

#### Scenario: Non-customer requests are rejected
- **WHEN** an authenticated non-customer calls any customer order endpoint
- **THEN** the response status is 403
- **AND** the order service is not called.

#### Scenario: Invalid list query is rejected
- **WHEN** an authenticated customer calls `GET /api/orders` with invalid pagination, date, status, payment status, sort field, or sort order values
- **THEN** the response status is 400
- **AND** the order service is not called.

#### Scenario: Invalid cancel payload is rejected
- **WHEN** an authenticated customer calls `POST /api/orders/{orderId}/cancel` with unknown fields or an invalid reason value
- **THEN** the response status is 400
- **AND** the order service is not called.

### Requirement: Order cancellation side-effect tests
The system SHALL include focused tests that verify customer cancellation updates order state, writes status history, and restores inventory through the existing transaction path.

#### Scenario: Cancel pending order restores stock and records history
- **WHEN** the order service cancels an authenticated customer's pending order with items
- **THEN** it updates the order status to canceled in the transaction
- **AND** it records order status history with the customer as changed-by user
- **AND** it restores inventory for each order item with cancellation movement references.

#### Scenario: Cancel another customer's order is rejected before side effects
- **WHEN** the order service receives a cancellation request for an order owned by another customer
- **THEN** it rejects the request with a forbidden error
- **AND** it does not update order status, write status history, or restore inventory.

#### Scenario: Cancel non-cancelable order is rejected before side effects
- **WHEN** the order service receives a cancellation request for a non-cancelable order status
- **THEN** it rejects the request with a business rule violation
- **AND** it does not update order status, write status history, or restore inventory.
