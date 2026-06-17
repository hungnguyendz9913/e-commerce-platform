## Why

Checkout currently mixes cart validation, total calculation, voucher placeholder logic, order persistence, payment setup, and inventory deduction inside one service. This makes the module harder to extend safely, especially because voucher discount calculation and redemption are specified behavior but are not yet wired into checkout.

## What Changes

- Refactor checkout business logic into smaller, explicit collaborators for cart validation, total calculation, order creation, and payment payload creation.
- Replace checkout's local voucher placeholder with a real integration point to the voucher application service once voucher validation and discount calculation are available.
- Ensure checkout validation, voucher application, and order creation calculate totals consistently from the same rules.
- Keep the existing public checkout endpoints stable: `POST /checkout/validate`, `POST /checkout/voucher`, and `POST /checkout`.
- Preserve transactional order creation, order item snapshotting, inventory deduction, payment creation, voucher redemption, and cart checkout status updates.
- Add focused unit coverage for the refactored services and regression coverage for voucher totals and transactional behavior.

## Capabilities

### New Capabilities

### Modified Capabilities
- `checkout`: Refactor checkout internals while preserving existing API behavior and ensuring voucher discounts are applied consistently during validation, voucher application, and order creation.
- `vouchers`: Expose checkout-facing voucher validation, discount calculation, and redemption behavior that checkout can call without duplicating voucher rules.

## Impact

- **APIs**: Existing checkout endpoints remain stable; response totals become voucher-aware when a voucher code is provided.
- **Application services**: `CheckoutService` becomes an orchestrator over smaller checkout helpers and `VoucherService`/`VouchersService` checkout-facing methods.
- **Database**: Existing order, order item, inventory, cart, payment, voucher, and voucher redemption tables continue to be used within transaction boundaries.
- **Tests**: Checkout service tests need to be updated around the new collaborators, voucher integration, and rollback expectations.
