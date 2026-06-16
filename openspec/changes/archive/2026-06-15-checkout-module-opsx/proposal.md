## Why

The platform currently lacks a checkout flow for users to finalize their purchases from their carts. We need a reliable, transactional checkout process that handles stock validation, order creation, inventory deduction, and payment initiation to ensure accurate order fulfillment and consistent data state.

## What Changes

- Create `CheckoutModule` to encapsulate all checkout-related endpoints and business logic.
- Implement checkout validation API to pre-check cart state, stock, and vouchers before finalizing.
- Implement the main checkout API that orchestrates order creation from the user's active cart.
- Add voucher application support during checkout.
- Enforce atomic transactions for order creation, order item snapshotting, inventory deduction, and cart state update.
- Implement a mock payment strategy for COD and e-wallets (Momo/VNPay), deferring real gateway integration.

## Capabilities

### New Capabilities
- `checkout`: Encompasses checkout validation, order creation from cart, transactional inventory updates, and mock payment initialization.

### Modified Capabilities

## Impact

- **APIs**: New endpoints `POST /checkout/validate`, `POST /checkout`, and `POST /checkout/voucher`.
- **Database**: Heavy reliance on Prisma `$transaction` spanning `Cart`, `Order`, `OrderItem`, `Product`, `Inventory`, and `Payment` tables.
- **Dependencies**: Requires interaction with Voucher Service (if ready), Inventory Service, and Payment Service.