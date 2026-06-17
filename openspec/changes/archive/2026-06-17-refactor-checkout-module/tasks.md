## 1. Voucher Checkout Contract

- [x] 1.1 Add checkout-facing input/result types for voucher validation, discount calculation, and redemption in the voucher module.
- [x] 1.2 Extend `VoucherRepository` with lookup methods that load voucher product/category mappings and redemption counts needed for checkout validation.
- [x] 1.3 Implement voucher code normalization, active/date checks, minimum order checks, global usage limit checks, and per-user usage limit checks in `VoucherService`.
- [x] 1.4 Implement voucher scope matching for `ORDER`, `PRODUCT`, and `CATEGORY` vouchers using checkout cart item data.
- [x] 1.5 Implement percent/fixed discount calculation, including maximum discount caps and eligible-amount caps.
- [x] 1.6 Add a transaction-aware voucher redemption method that records successful order redemptions with user, order, voucher, and discount details.
- [x] 1.7 Export `VoucherService` from `VoucherModule` so checkout can inject it.

## 2. Checkout Internal Services

- [x] 2.1 Extend `CheckoutRepository.findActiveCartWithItems` to include the product category data needed for category-scoped vouchers.
- [x] 2.2 Create a checkout cart validation provider for empty cart, product status, approval status, inventory presence, and available stock checks.
- [x] 2.3 Create a checkout totals provider that builds item summaries, subtotal, voucher discount, shipping fee, and total through one shared path.
- [x] 2.4 Create a checkout order mapping/provider for order data and order item snapshot data.
- [x] 2.5 Create a checkout payment provider/factory for COD, MOMO, and VNPAY response behavior.
- [x] 2.6 Register the new checkout providers in `CheckoutModule`.

## 3. Checkout Orchestration

- [x] 3.1 Refactor `CheckoutService.validateCheckout` to delegate cart validation and voucher-aware total calculation.
- [x] 3.2 Refactor `CheckoutService.applyVoucher` to delegate voucher validation and return totals from the shared totals provider.
- [x] 3.3 Refactor `CheckoutService.createOrderFromCart` to recalculate totals inside the transaction before persisting the order.
- [x] 3.4 Wire voucher redemption into successful voucher checkout inside the same transaction as order creation, inventory deduction, payment creation, and cart checkout status update.
- [x] 3.5 Preserve existing checkout controller routes, guards, roles, DTOs, and response shape expectations.

## 4. Tests

- [x] 4.1 Add `VoucherService` unit tests for normalized codes, invalid status/date windows, minimum order failures, usage limit failures, scoped eligibility, capped percent discounts, fixed discounts, and redemption creation.
- [x] 4.2 Update `CheckoutService` unit tests for delegated validation, shared totals, voucher-aware validation, voucher application, COD checkout, MOMO/VNPAY checkout, and transaction rollback.
- [x] 4.3 Add tests proving `POST /checkout/voucher` and `POST /checkout/validate` use matching total calculation rules for the same cart and voucher.
- [x] 4.4 Add tests proving voucher redemption is created only for successful checkout and rolls back when the transaction fails.

## 5. Verification

- [x] 5.1 Run the affected API unit test suite for checkout and vouchers.
- [x] 5.2 Run formatting/linting for the touched API and contract files.
- [x] 5.3 Run OpenSpec validation/status for `refactor-checkout-module` and confirm the change is apply-ready.
