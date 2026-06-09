# Admin Specification

## Purpose

Define admin-only dashboard, product, inventory, order, customer, approval, and revenue management behavior.

## Requirements

### Requirement: Admin-only access
The system SHALL restrict all `/admin` endpoints to authenticated users with the `admin` role.

#### Scenario: Customer denied
- GIVEN an authenticated customer
- WHEN the customer calls an admin endpoint
- THEN the system rejects the request with a forbidden error.

### Requirement: Admin dashboard
The system SHALL provide dashboard metrics for admin users.

#### Scenario: Dashboard summary
- GIVEN an authenticated admin
- WHEN `GET /admin/dashboard` is called
- THEN the system returns dashboard metrics such as revenue, orders, customers, pending orders, and low stock products.

### Requirement: Product management
The system SHALL allow admins to list, create, update, deactivate, and manage product approval status.

#### Scenario: Admin manages product
- GIVEN an authenticated admin submits valid product data
- WHEN an admin product endpoint is called
- THEN the system applies the product change according to SKU, slug, status, and approval rules.

### Requirement: Inventory management
The system SHALL allow admins to update inventory and view low stock information.

#### Scenario: Admin updates inventory
- GIVEN an authenticated admin submits a valid non-negative stock value
- WHEN `PATCH /admin/inventory/{productId}` is called
- THEN the system updates stock and records a movement.

### Requirement: Order management
The system SHALL allow admins to list orders and update order statuses according to transition rules.

#### Scenario: Admin order status update
- GIVEN an authenticated admin submits a valid transition
- WHEN `PATCH /admin/orders/{orderId}/status` is called
- THEN the system updates status and records status history.

### Requirement: Customer management
The system SHALL allow admins to list and inspect customer records without exposing secrets.

#### Scenario: Admin customer listing
- GIVEN an authenticated admin
- WHEN `GET /admin/customers` is called
- THEN the system returns paginated customer data without passwords, hashes, or token secrets.

### Requirement: Product approval
The system SHALL allow admins to approve or reject products.

#### Scenario: Approve product
- GIVEN a product is pending approval
- WHEN an admin approves it
- THEN the product approval status becomes approved
- AND it can be publicly visible only if its product status is active.

### Requirement: Revenue metrics
The system SHALL provide admin revenue metrics.

#### Scenario: Revenue endpoint
- GIVEN completed or paid orders exist
- WHEN `GET /admin/revenue` is called by an admin
- THEN the system returns revenue metrics based on documented order and payment status rules.
