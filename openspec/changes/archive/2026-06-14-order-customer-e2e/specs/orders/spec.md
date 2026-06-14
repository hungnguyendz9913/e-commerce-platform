## MODIFIED Requirements

### Requirement: Customer order history
The system SHALL allow authenticated customers to list only their own orders. Guest users and authenticated non-customer users MUST NOT access the customer order history endpoint.

#### Scenario: List my orders
- GIVEN a customer is authenticated
- WHEN `GET /orders` is called
- THEN the system returns paginated orders belonging to that customer.

#### Scenario: Guest cannot list customer orders
- GIVEN no customer is authenticated
- WHEN `GET /orders` is called
- THEN the system rejects the request as unauthenticated.

#### Scenario: Non-customer cannot list customer orders
- GIVEN an authenticated user does not have the customer role
- WHEN `GET /orders` is called
- THEN the system rejects the request as forbidden.

### Requirement: Customer order detail
The system SHALL allow authenticated customers to view details for their own orders. Order detail MUST include order header, item snapshots, delivery snapshot, amounts, status, and payment status.

#### Scenario: View my order
- GIVEN an order belongs to the authenticated customer
- WHEN `GET /orders/{orderId}` is called
- THEN the system returns order header, items, delivery snapshot, amounts, status, and payment status.

#### Scenario: Guest cannot view customer order detail
- GIVEN no customer is authenticated
- WHEN `GET /orders/{orderId}` is called
- THEN the system rejects the request as unauthenticated.

#### Scenario: Non-customer cannot view customer order detail
- GIVEN an authenticated user does not have the customer role
- WHEN `GET /orders/{orderId}` is called
- THEN the system rejects the request as forbidden.

### Requirement: Customer cancel order
The system SHALL allow authenticated customers to cancel their own orders only when status rules allow it. Successful customer cancellation MUST record status history and restore inventory for canceled order items.

#### Scenario: Cancel pending order
- GIVEN a customer's order is in a cancelable status
- WHEN `POST /orders/{orderId}/cancel` is called
- THEN the system changes status to canceled
- AND records status history
- AND restores inventory for the canceled order items.

#### Scenario: Cancel non-cancelable order
- GIVEN a customer's order is shipped, delivered, refunded, or otherwise not cancelable
- WHEN cancellation is requested
- THEN the system rejects the request with a business rule violation.

#### Scenario: Guest cannot cancel customer order
- GIVEN no customer is authenticated
- WHEN `POST /orders/{orderId}/cancel` is called
- THEN the system rejects the request as unauthenticated.

#### Scenario: Non-customer cannot cancel customer order
- GIVEN an authenticated user does not have the customer role
- WHEN `POST /orders/{orderId}/cancel` is called
- THEN the system rejects the request as forbidden.

### Requirement: Ownership check
The system SHALL prevent customers from accessing or mutating another customer's orders.

#### Scenario: Cross-customer order access
- GIVEN customer A is authenticated
- WHEN customer A requests customer B's order
- THEN the system rejects the request with forbidden or not found.

#### Scenario: Cross-customer order cancellation
- GIVEN customer A is authenticated
- WHEN customer A requests cancellation for customer B's order
- THEN the system rejects the request with forbidden or not found
- AND the system does not update order status, write status history, or restore inventory.
