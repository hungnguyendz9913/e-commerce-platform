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
- THEN the system returns a valid checkout summary with subtotal, discount, shippingFee, and total.

#### Scenario: Cart is empty

- GIVEN the customer's active cart has no items
- WHEN `POST /checkout/validate` is called
- THEN the system rejects the request with a business rule violation.

#### Scenario: Product no longer active or approved

- GIVEN a cart item contains a product that is inactive or unapproved
- WHEN `POST /checkout/validate` is called
- THEN the system rejects the request with a business rule violation.

#### Scenario: Insufficient stock

- GIVEN a cart item quantity exceeds available stock
- WHEN `POST /checkout/validate` is called
- THEN the system rejects the request with a business rule violation.

### Requirement: Apply voucher

The system SHALL allow a customer to apply a valid voucher during checkout.

#### Scenario: Valid voucher applied

- GIVEN a voucher is active, within its valid time range, meets minimum order amount, matches its order/product/category scope, and has remaining usage
- WHEN `POST /checkout/voucher` is called
- THEN the system returns the calculated discount and updated totals.

#### Scenario: Invalid voucher rejected

- GIVEN a voucher is missing, expired, inactive, over limit, below minimum amount, or not applicable to the cart products/categories
- WHEN `POST /checkout/voucher` is called
- THEN the system rejects it with a business rule violation.

### Requirement: Create order from cart

The system SHALL create an order from the customer's active cart only after all checkout validations pass.

#### Scenario: Successful COD checkout

- GIVEN checkout validation passes and paymentMethod is `COD`
- WHEN `POST /checkout` is called
- THEN the system creates an order with order items containing snapshots
- AND marks the cart as checked_out
- AND returns the created order.

#### Scenario: Successful Momo/VNPay checkout

- GIVEN checkout validation passes and paymentMethod is `MOMO` or `VNPAY`
- WHEN `POST /checkout` is called
- THEN the system creates an order
- AND creates a payment record with status `PENDING`
- AND returns a fake paymentUrl.

#### Scenario: Cart is empty at checkout

- GIVEN the customer's active cart has no items
- WHEN `POST /checkout` is called
- THEN the system rejects the request with a business rule violation.

### Requirement: Delivery info validation

The system SHALL require valid recipient name, phone, and shipping address for checkout.

#### Scenario: Missing delivery info

- GIVEN checkout delivery information is incomplete or missing required fields
- WHEN `POST /checkout` or `POST /checkout/validate` is submitted
- THEN the system rejects the request with a validation error.

### Requirement: Order item snapshot

The system SHALL snapshot productNameSnapshot, skuSnapshot, and unitPriceSnapshot on each order item at the time of checkout.

#### Scenario: Product data changes after checkout

- GIVEN an order is created with item snapshots
- WHEN the product name, SKU, or price changes afterwards
- THEN the order items retain the original snapshot values.

### Requirement: Atomic order creation and stock deduction

The system SHALL create the order, deduct stock, record inventory movements of type SALE, apply voucher redemption if any, and mark the cart checked_out inside a single database transaction.

#### Scenario: Transaction rollback on failure

- GIVEN order creation succeeds but stock deduction fails
- WHEN the checkout transaction fails
- THEN the system rolls back order, order items, voucher redemption, cart status, and inventory changes.

### Requirement: Cart marked checked_out after success

The system SHALL mark the active cart status as `checked_out` after successful order creation.

#### Scenario: Cart no longer active after checkout

- GIVEN checkout succeeds
- WHEN the customer retrieves their current cart
- THEN the previously checked-out cart is not reused for new cart operations.