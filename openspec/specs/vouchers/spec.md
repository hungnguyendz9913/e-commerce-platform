# Vouchers Specification

## Purpose

Define voucher validation, discount calculation, usage limits, and redemption linkage to final orders.

## Requirements

### Requirement: Voucher validation

The system SHALL validate voucher code, status, dates, order amount, scope applicability, and usage limits before applying a discount.

#### Scenario: Voucher is valid

- GIVEN a voucher is active, currently valid, meets minimum amount, and has remaining usage
- AND the cart satisfies the voucher scope
- WHEN a customer applies the code during checkout
- THEN the system calculates the discount and returns updated totals.

### Requirement: Voucher scope applicability

The system SHALL support order-wide, product-specific, and category-specific voucher scopes.

#### Scenario: Order scoped voucher

- GIVEN a voucher has `ORDER` scope
- WHEN a customer applies the voucher
- THEN the system applies the discount to the eligible order amount without requiring voucher product or category mappings.

#### Scenario: Product scoped voucher

- GIVEN a voucher has `PRODUCT` scope
- AND the voucher has at least one `voucher_products` mapping
- WHEN a customer's cart contains mapped and unmapped products
- THEN the system calculates the discount only from mapped products.

#### Scenario: Category scoped voucher

- GIVEN a voucher has `CATEGORY` scope
- AND the voucher has at least one `voucher_categories` mapping
- WHEN a customer's cart contains products from mapped and unmapped categories
- THEN the system calculates the discount only from products in mapped categories.

### Requirement: Active and time validity

The system SHALL reject inactive, expired, or not-yet-started vouchers.

#### Scenario: Expired voucher

- GIVEN a voucher expiration time is in the past
- WHEN the customer applies the code
- THEN the system rejects the voucher with a business rule violation.

### Requirement: Minimum order amount

The system SHALL enforce voucher minimum order amounts.

#### Scenario: Order below minimum

- GIVEN a voucher requires a minimum order amount
- WHEN the cart subtotal is lower than that amount
- THEN the system rejects the voucher.

### Requirement: Global and per-user usage limits

The system SHALL enforce global usage limits and per-user usage limits.

#### Scenario: Per-user limit reached

- GIVEN a customer has already redeemed the voucher up to the per-user limit
- WHEN the customer applies the voucher again
- THEN the system rejects the voucher.

### Requirement: Redemption linked to order

The system SHALL create voucher redemptions only for successful final orders.

#### Scenario: Checkout succeeds with voucher

- GIVEN checkout succeeds with a voucher
- WHEN the order is committed
- THEN the system links a voucher redemption to the order and user.

#### Scenario: Checkout fails with voucher

- GIVEN checkout fails after voucher validation
- WHEN the transaction rolls back
- THEN the system does not create a voucher redemption.
