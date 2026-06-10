# Orders Specification

## Purpose

Define customer order history, order detail, cancellation, ownership checks, and admin order status management.

## Requirements

### Requirement: Customer order history

The system SHALL allow customers to list only their own orders.

#### Scenario: List my orders

- GIVEN a customer is authenticated
- WHEN `GET /orders` is called
- THEN the system returns paginated orders belonging to that customer.

### Requirement: Customer order detail

The system SHALL allow customers to view details for their own orders.

#### Scenario: View my order

- GIVEN an order belongs to the authenticated customer
- WHEN `GET /orders/{orderId}` is called
- THEN the system returns order header, items, delivery snapshot, amounts, status, and payment status.

### Requirement: Customer cancel order

The system SHALL allow customers to cancel their own orders only when status rules allow it.

#### Scenario: Cancel pending order

- GIVEN a customer's order is in a cancelable status
- WHEN `POST /orders/{orderId}/cancel` is called
- THEN the system changes status to canceled
- AND records status history.

#### Scenario: Cancel non-cancelable order

- GIVEN a customer's order is shipped, delivered, refunded, or otherwise not cancelable
- WHEN cancellation is requested
- THEN the system rejects the request with a business rule violation.

### Requirement: Ownership check

The system SHALL prevent customers from accessing another customer's orders.

#### Scenario: Cross-customer order access

- GIVEN customer A is authenticated
- WHEN customer A requests customer B's order
- THEN the system rejects the request with forbidden or not found.

### Requirement: Admin order status update

The system SHALL allow admins to update order status through admin endpoints.

#### Scenario: Admin updates status

- GIVEN an authenticated admin submits a valid target status and note
- WHEN `PATCH /admin/orders/{orderId}/status` is called
- THEN the system updates the order status
- AND records order status history.

### Requirement: Order status transition rules

The system SHALL enforce allowed order status transitions.

#### Scenario: Invalid transition

- GIVEN an order is delivered
- WHEN an admin attempts to move it back to pending
- THEN the system rejects the transition with a business rule violation.
