# Inventory Specification

## Purpose

Define stock tracking, movement logs, no-negative-stock rules, and checkout deduction safety.

## Requirements

### Requirement: One inventory item per product
The system SHALL track inventory with at most one inventory item per product.

#### Scenario: Inventory lookup
- GIVEN a product exists
- WHEN inventory is queried for that product
- THEN the system reads the product's single inventory item.

### Requirement: Stock update
The system SHALL allow admins to adjust stock through protected inventory endpoints.

#### Scenario: Admin stock adjustment
- GIVEN an authenticated admin submits a valid stock update
- WHEN `PATCH /admin/inventory/{productId}` is called
- THEN the system updates inventory
- AND records an inventory movement.

### Requirement: Stock movement logs
The system SHALL record inventory movement history for important stock changes.

#### Scenario: Sale movement
- GIVEN checkout deducts stock for an order
- WHEN stock is deducted
- THEN the system records a movement with before quantity, after quantity, quantity, movement type, and reference id.

### Requirement: No negative stock
The system SHALL prevent stock and reserved quantities from becoming negative.

#### Scenario: Invalid stock deduction
- GIVEN available stock is lower than the requested deduction
- WHEN stock deduction is attempted
- THEN the system rejects the operation
- AND leaves stock unchanged.

### Requirement: Checkout stock deduction concurrency safety
The system SHALL deduct checkout stock in a transaction using a concurrency-safe strategy.

#### Scenario: Concurrent checkout for limited stock
- GIVEN two customers attempt to buy the last available unit at the same time
- WHEN both checkouts are processed
- THEN at most one checkout succeeds
- AND inventory never becomes negative.
