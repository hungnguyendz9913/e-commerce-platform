## Context

`CheckoutService` currently owns every checkout concern: active cart lookup, cart item validation, subtotal calculation, voucher placeholder totals, order creation, order item snapshots, stock deduction, cart status changes, and mock payment creation. The checkout spec already requires voucher-aware validation and atomic voucher redemption, while the current implementation still returns zero discount and does not call `VoucherService`.

`VoucherService` also mostly forwards to `VoucherRepository`, so checkout should not duplicate voucher rules while voucher validation and discount calculation are being hardened. This change creates clear application-service boundaries between checkout orchestration, reusable checkout calculations, and voucher-owned discount rules.

## Goals / Non-Goals

**Goals:**
- Keep the existing checkout controller routes and request DTOs stable.
- Make checkout totals deterministic and shared across `validateCheckout`, `applyVoucher`, and `createOrderFromCart`.
- Move cart item availability checks, checkout summary construction, payment payload creation, and order persistence mapping out of the main checkout orchestration path.
- Integrate checkout with `VoucherService` for voucher validation, discount calculation, and successful-order redemption.
- Keep order creation, stock deduction, payment creation, voucher redemption, and cart checkout status changes inside one database transaction.
- Add focused tests around the new service boundaries and voucher-aware totals.

**Non-Goals:**
- Implement real payment gateway integrations for MOMO or VNPAY.
- Change checkout endpoint paths, authentication, role requirements, or request DTO names.
- Redesign the cart, inventory, order, payment, or voucher database schema unless a missing relation include is required for voucher scope checks.
- Complete every admin voucher CRUD hardening task beyond the checkout-facing validation/redemption path needed by this refactor.

## Decisions

1. Keep `CheckoutService` as the public application orchestrator.

   `CheckoutService` remains the controller dependency, but delegates validation, total calculation, order write mapping, and payment creation to smaller providers. This keeps the API surface stable while making the implementation easier to test. The alternative was replacing `CheckoutService` with separate route-specific services, but that would spread transaction orchestration across more public classes.

2. Add checkout-specific internal providers instead of large static helper functions.

   Introduce injectable collaborators such as `CheckoutCartValidator`, `CheckoutTotalsService`, `CheckoutOrderFactory`, and `CheckoutPaymentFactory` under the checkout module. Injectable services fit NestJS testing patterns and allow voucher and repository dependencies to remain explicit. Plain functions were considered, but they become awkward once voucher validation and transaction-aware behavior are involved.

3. Let `VoucherService` own voucher validation and discount calculation.

   Checkout passes `userId`, normalized voucher code, subtotal, cart item product/category/price data, and an optional transaction client into a checkout-facing voucher method. `VoucherService` returns the voucher identity, eligible amount, discount, and normalized code. Checkout never reimplements voucher active date, scope, minimum amount, global usage limit, or per-user limit rules. The alternative was keeping placeholder discount logic inside checkout, but that would violate the voucher capability boundary and make later fixes riskier.

4. Recalculate voucher totals inside the checkout transaction.

   `validateCheckout` and `applyVoucher` may calculate preview totals outside a transaction, but `createOrderFromCart` must recalculate totals after loading the cart inside the transaction. This prevents stale preview data from becoming the final order amount. The trade-off is duplicated service calls, but the final write path remains authoritative.

5. Record voucher redemption only after order creation and before cart checkout status update within the same transaction.

   The order id is required for redemption linkage, and keeping redemption in the transaction preserves rollback behavior if inventory deduction, payment creation, or cart updates fail. Checkout should call a transaction-aware `VoucherService` redemption method and not write voucher redemption rows directly.

6. Preserve mock payment behavior behind a small factory.

   COD returns the order without payment data, while MOMO and VNPAY create `PENDING` payment records and return mock URLs. A factory keeps provider mapping out of the orchestration path and prepares for real provider adapters later without changing this change's scope.

## Risks / Trade-offs

- Voucher methods are not yet checkout-ready -> Implement the minimum checkout-facing `VoucherService` validation, calculation, and redemption methods before wiring checkout to them.
- Product category data may be missing from checkout cart includes -> Extend `CheckoutRepository.findActiveCartWithItems` to include the product category id needed for category-scoped vouchers.
- Preview totals can differ from final totals if cart, stock, or voucher usage changes -> Always recalculate inside the final checkout transaction and persist only transaction-calculated totals.
- More providers can feel heavier than one service -> Keep providers scoped to checkout internals and covered by narrow unit tests.
- Voucher usage limit checks can race under concurrent checkouts -> Perform final limit checks and redemption creation inside the transaction; consider stronger database constraints or locking separately if needed.
