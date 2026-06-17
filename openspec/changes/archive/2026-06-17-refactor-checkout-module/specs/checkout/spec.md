## MODIFIED Requirements

### Requirement: Validate checkout

The system SHALL validate cart, stock, delivery information, voucher, and payment method before order creation, and SHALL calculate checkout totals through the same voucher-aware total rules used by final order creation.

#### Scenario: Checkout validation succeeds

- GIVEN an authenticated customer has an active cart with in-stock items
- AND valid delivery information and payment method are provided
- WHEN `POST /checkout/validate` is called
- THEN the system returns a valid checkout summary with subtotal, discount, shippingFee, and total.

#### Scenario: Checkout validation succeeds with voucher

- GIVEN an authenticated customer has an active cart with in-stock items
- AND the request includes a voucher code that is valid for the cart
- WHEN `POST /checkout/validate` is called
- THEN the system returns checkout totals with the voucher discount applied.

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

The system SHALL allow a customer to apply a valid voucher during checkout by delegating voucher validation and discount calculation to the voucher application service.

#### Scenario: Valid voucher applied

- GIVEN a voucher is active, within its valid time range, meets minimum order amount, matches its order/product/category scope, and has remaining usage
- WHEN `POST /checkout/voucher` is called
- THEN the system returns the calculated discount and updated totals.

#### Scenario: Invalid voucher rejected

- GIVEN a voucher is missing, expired, inactive, over limit, below minimum amount, or not applicable to the cart products/categories
- WHEN `POST /checkout/voucher` is called
- THEN the system rejects it with a business rule violation.

#### Scenario: Voucher totals match checkout validation

- GIVEN a customer has an active cart and a valid voucher code
- WHEN the customer calls `POST /checkout/voucher` and `POST /checkout/validate` with the same cart and voucher
- THEN both responses use the same subtotal, discount, shippingFee, and total calculation rules.

### Requirement: Create order from cart

The system SHALL create an order from the customer's active cart only after all checkout validations pass, and SHALL persist totals recalculated inside the checkout transaction.

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

#### Scenario: Successful checkout with voucher

- GIVEN checkout validation passes with a valid voucher code
- WHEN `POST /checkout` is called
- THEN the system creates an order whose discount and total amounts reflect the voucher discount recalculated inside the transaction
- AND creates the voucher redemption in the same transaction.

#### Scenario: Cart is empty at checkout

- GIVEN the customer's active cart has no items
- WHEN `POST /checkout` is called
- THEN the system rejects the request with a business rule violation.

### Requirement: Atomic order creation and stock deduction

The system SHALL create the order, deduct stock, record inventory movements of type SALE, apply voucher redemption if any, and mark the cart checked_out inside a single database transaction.

#### Scenario: Transaction rollback on failure

- GIVEN order creation succeeds but stock deduction fails
- WHEN the checkout transaction fails
- THEN the system rolls back order, order items, voucher redemption, cart status, and inventory changes.

#### Scenario: Transaction rollback after voucher redemption failure

- GIVEN order creation and stock deduction succeed but voucher redemption fails
- WHEN the checkout transaction fails
- THEN the system rolls back order, order items, inventory changes, voucher redemption, and cart status.

## ADDED Requirements

### Requirement: Checkout orchestration boundaries

The checkout module SHALL keep route-facing checkout orchestration separate from reusable cart validation, total calculation, order creation mapping, and payment response creation.

#### Scenario: Checkout services remain reusable

- **WHEN** checkout validation, voucher application, and order creation need checkout totals
- **THEN** they use the same total calculation service rather than separate inline calculations.

#### Scenario: Checkout service delegates focused work

- **WHEN** `CheckoutService` handles a checkout request
- **THEN** cart validation, total calculation, order persistence mapping, and payment payload creation are delegated to focused checkout collaborators.
