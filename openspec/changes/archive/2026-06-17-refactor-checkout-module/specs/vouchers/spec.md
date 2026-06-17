## MODIFIED Requirements

### Requirement: Voucher validation

The system SHALL validate voucher code, status, dates, order amount, scope applicability, and usage limits before applying a discount, and SHALL expose this validation as a checkout-facing service method.

#### Scenario: Voucher is valid

- GIVEN a voucher is active, currently valid, meets minimum amount, and has remaining usage
- AND the cart satisfies the voucher scope
- WHEN a customer applies the code during checkout
- THEN the system calculates the discount and returns updated totals.

#### Scenario: Checkout-facing validation returns discount details

- GIVEN a voucher is valid for a customer's checkout cart
- WHEN checkout requests voucher validation and discount calculation
- THEN the voucher service returns the normalized voucher code, voucher id, eligible amount, discount amount, and any data needed for final redemption.

### Requirement: Voucher scope applicability

The system SHALL support order-wide, product-specific, and category-specific voucher scopes and SHALL calculate product/category-scoped discounts only from eligible cart items.

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
- WHEN a customer's cart contains products in mapped and unmapped categories
- THEN the system calculates the discount only from products in mapped categories.

#### Scenario: Scoped voucher has no eligible cart items

- GIVEN a voucher is scoped to products or categories
- AND the customer's cart contains no matching eligible items
- WHEN checkout requests voucher validation
- THEN the system rejects the voucher with a business rule violation.

### Requirement: Redemption linked to order

The system SHALL create voucher redemptions only for successful final orders through a transaction-aware voucher service method.

#### Scenario: Checkout succeeds with voucher

- GIVEN checkout succeeds with a voucher
- WHEN the order is committed
- THEN the system links a voucher redemption to the order and user.

#### Scenario: Checkout fails with voucher

- GIVEN checkout fails after voucher validation
- WHEN the transaction rolls back
- THEN the system does not create a voucher redemption.

#### Scenario: Checkout records redemption through voucher service

- GIVEN checkout succeeds with a validated voucher
- WHEN checkout creates the final order
- THEN checkout asks the voucher service to create the redemption with the order id, user id, voucher id, discount amount, and transaction client.

## ADDED Requirements

### Requirement: Voucher checkout discount calculation

The voucher service SHALL calculate checkout discounts from normalized voucher codes, subtotal, and cart item data without requiring checkout to duplicate voucher business rules.

#### Scenario: Percent voucher discount is capped

- **WHEN** a percent voucher has a maximum discount amount and the calculated percentage exceeds that cap
- **THEN** the voucher service returns the capped discount amount.

#### Scenario: Fixed voucher discount does not exceed eligible amount

- **WHEN** a fixed amount voucher discount is greater than the eligible cart amount
- **THEN** the voucher service returns a discount no larger than the eligible amount.

#### Scenario: Voucher code is normalized for checkout

- **WHEN** checkout validates a voucher code containing lowercase letters or surrounding whitespace
- **THEN** the voucher service validates and returns the trimmed uppercase voucher code.
