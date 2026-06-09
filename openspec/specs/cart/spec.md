# Cart Specification

## Purpose

Define customer cart ownership, cart item operations, pricing snapshots, stock validation, and cart clearing.

## Requirements

### Requirement: Get current cart
The system SHALL allow an authenticated customer to retrieve their active cart.

#### Scenario: Customer gets own cart
- GIVEN a customer is authenticated
- WHEN `GET /cart` is called
- THEN the system returns the customer's active cart with items, subtotal, discount, shipping fee, tax if applicable, and total.

### Requirement: Add item
The system SHALL allow an authenticated customer to add a visible product to the cart.

#### Scenario: Add in-stock product
- GIVEN an active approved product has enough stock
- WHEN `POST /cart/items` is called with a valid quantity
- THEN the system adds or merges the item in the customer's active cart
- AND snapshots the unit price.

### Requirement: Update quantity
The system SHALL allow a customer to update quantity for an item in their own cart.

#### Scenario: Update valid quantity
- GIVEN a cart item belongs to the authenticated customer
- WHEN `PATCH /cart/items/{itemId}` is called with a positive quantity within stock
- THEN the system updates the quantity and recalculates totals.

### Requirement: Remove item
The system SHALL allow a customer to remove an item from their own cart.

#### Scenario: Remove cart item
- GIVEN a cart item belongs to the authenticated customer
- WHEN `DELETE /cart/items/{itemId}` is called
- THEN the system removes the item from the cart.

### Requirement: Clear cart
The system SHALL allow a customer to clear their active cart.

#### Scenario: Clear active cart
- GIVEN a customer has an active cart
- WHEN `DELETE /cart` is called
- THEN the system removes all items or marks the cart as cleared according to the persistence design.

### Requirement: Validate quantity against stock
The system SHALL reject cart operations that exceed available stock.

#### Scenario: Quantity exceeds stock
- GIVEN a product has less available stock than requested
- WHEN a customer adds or updates a cart item
- THEN the system rejects the request with a business rule violation.

### Requirement: Customer ownership
The system SHALL prevent customers from reading or modifying another customer's cart.

#### Scenario: Cross-customer cart item update
- GIVEN customer A is authenticated
- WHEN customer A attempts to update customer B's cart item
- THEN the system rejects the request with a forbidden or not found error.
