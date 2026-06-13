# Checkout Specification

## Purpose

Define checkout validation, voucher application, delivery information, order creation from cart, and transactional stock deduction.

## Requirements

### Requirement: Validate checkout

The system SHALL validate cart, stock, delivery information, voucher, and payment method before order creation.

#### Scenario: Checkout validation succeeds

- GIVEN an authenticated customer has an active cart with in-stock items
- AND valid delivery information and payment method are provided
- WHEN `POST /checkout/validate` is called
- THEN the system returns a valid checkout summary.

### Requirement: Apply voucher

The system SHALL allow a customer to apply a valid voucher during checkout.

#### Scenario: Valid voucher applied

- GIVEN a voucher is active, within its valid time range, meets minimum order amount, matches its order/product/category scope, and has remaining usage
- WHEN `POST /checkout/voucher` is called
- THEN the system returns the calculated discount and updated totals.

#### Scenario: Invalid voucher rejected

- GIVEN a voucher is missing, expired, inactive, over limit, below minimum amount, or not applicable to the cart products/categories
- WHEN the customer applies the voucher
- THEN the system rejects it with a business rule violation.

### Requirement: Create order from cart

The system SHALL create an order from the customer's active cart only after all checkout validations pass.

#### Scenario: Successful checkout

- GIVEN checkout validation passes
- WHEN `POST /checkout` is called
- THEN the system creates an order and order items with snapshots
- AND returns the created order summary.

### Requirement: Delivery info validation

The system SHALL require valid recipient name, phone, and shipping address for checkout.

#### Scenario: Missing delivery info

- GIVEN checkout delivery information is incomplete
- WHEN checkout is submitted
- THEN the system rejects the request with a validation error.

### Requirement: Atomic order creation and stock deduction

The system SHALL create the order, deduct stock, record inventory movements, apply voucher redemption, and mark the cart checked out inside a safe transaction.

#### Scenario: Transaction rollback

- GIVEN order creation succeeds but stock deduction fails
- WHEN the checkout transaction fails
- THEN the system rolls back order, order item, voucher redemption, cart status, and inventory changes.

### Requirement: Cart checked out after success

The system SHALL mark the active cart as checked out or clear it after successful checkout.

#### Scenario: Cart no longer active

- GIVEN checkout succeeds
- WHEN the customer retrieves their current cart
- THEN the previously checked-out cart is not reused for new cart operations.
