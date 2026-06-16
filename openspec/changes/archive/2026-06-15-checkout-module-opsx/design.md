# Design: Checkout Module

## Overview

The `CheckoutModule` is a NestJS feature module that orchestrates the full checkout flow: validation, voucher application, and order creation from cart. It runs the critical path — stock validation, order creation, inventory deduction, and cart state change — inside a single Prisma `$transaction` via `TransactionService`. Payment is mocked for this change; real gateway integration is deferred.

## Module Structure

```
apps/api/src/app/checkout/
  checkout.module.ts
  checkout.controller.ts
  checkout.service.ts
  checkout.repository.ts
```

DTOs live in `libs/shared/types` or `libs/shared/api-contracts` following the existing pattern (e.g., `@e-commerce-platform/api-contracts`).

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /checkout/validate | CUSTOMER | Pre-validate cart, stock, delivery info, returns summary |
| POST | /checkout/voucher | CUSTOMER | Apply voucher and return updated totals |
| POST | /checkout | CUSTOMER | Create order from active cart |

All endpoints require `JwtAuthGuard` + `RolesGuard` with `CUSTOMER` role, matching the pattern in `OrderController`.

## DTOs

### CheckoutDto
```typescript
class DeliveryInfoDto {
  recipientName: string;   // @IsString, @IsNotEmpty
  recipientPhone: string;  // @IsString, @IsNotEmpty
  shippingAddress: string; // @IsString, @IsNotEmpty
}

class CheckoutDto {
  deliveryInfo: DeliveryInfoDto;
  paymentMethod: PaymentMethod; // enum: COD | MOMO | VNPAY
  voucherCode?: string;         // @IsOptional, @IsString
}
```

### ApplyVoucherDto
```typescript
class ApplyVoucherDto {
  voucherCode: string;          // @IsString, @IsNotEmpty
  deliveryInfo: DeliveryInfoDto; // needed for total calculation
}
```

## CheckoutService

### validateCheckout(userId, dto)
1. Load active cart with items + product + inventoryItem.
2. Assert cart is not empty.
3. For each cart item: assert product is active & approved, assert available stock >= quantity.
4. Calculate subtotal = sum(unitPriceSnapshot * quantity).
5. Apply voucher discount if voucherCode provided (delegate to VouchersService).
6. Calculate shippingFee (fixed or 0 for now).
7. Return `{ items, subtotal, discount, shippingFee, total }`.

### applyVoucher(userId, dto)
1. Load active cart with items.
2. Calculate subtotal.
3. Delegate to VouchersService to validate and calculate discount.
4. Return updated `{ subtotal, discount, shippingFee, total, voucherCode }`.

### createOrderFromCart(userId, dto)

Runs entirely inside `transactionService.run(async (tx) => { ... })`:

1. Load active cart with items + product + inventoryItem (within tx).
2. Assert cart is not empty.
3. For each cart item: assert product active/approved, assert stock >= quantity.
4. Calculate totals (subtotal, discount, shippingFee, total).
5. Generate unique order number (e.g., timestamp + random suffix).
6. Create `Order` record with delivery snapshot, amounts, paymentMethod, status `PENDING`.
7. Create `OrderItem` records with snapshots:
   - `productNameSnapshot = product.name`
   - `skuSnapshot = product.sku`
   - `unitPriceSnapshot = cartItem.unitPriceSnapshot`
8. For each item: deduct stock via `inventoryService.deductStock(productId, qty, orderId, tx)`.
9. Create `InventoryMovement` with type `SALE` and referenceId = orderId (inside deductStock or explicitly).
10. If voucherCode provided: validate and create `VoucherRedemption` record.
11. Mark cart status = `CHECKED_OUT`.
12. Handle payment:
    - **COD**: no payment record needed at this point, return order.
    - **MOMO/VNPAY**: create `Payment` record with status `PENDING`, return `{ order, paymentUrl: "<mock_url>" }`.

### Error types
- Empty cart → `UnprocessableEntityException` with `BUSINESS_RULE_VIOLATION`
- Inactive/unapproved product → `UnprocessableEntityException` with `BUSINESS_RULE_VIOLATION`
- Insufficient stock → `UnprocessableEntityException` with `BUSINESS_RULE_VIOLATION`
- Invalid voucher → `UnprocessableEntityException` with `BUSINESS_RULE_VIOLATION`
- Missing delivery fields → `BadRequestException` (caught by class-validator pipe)

## Inventory Integration

Add `deductStockForCheckout(productId, quantity, orderId, tx)` to `InventoryService`:
1. Load inventory item within the transaction using `SELECT ... FOR UPDATE` semantics (Prisma handles locking via the transaction isolation level).
2. Assert `stockQuantity - reservedQuantity >= quantity`.
3. Decrease `stockQuantity` by `quantity`.
4. Record `InventoryMovement` with type `SALE`, beforeQuantity, afterQuantity, referenceId = orderId.

## Payment Mock Strategy

- No real gateway calls.
- **COD**: return order directly after creation. No `Payment` record required at checkout time.
- **MOMO**: create `Payment` { orderId, method: MOMO, status: PENDING, amount: total }, return `{ order, paymentUrl: "https://mock.momo.vn/pay?orderId=<id>" }`.
- **VNPAY**: same pattern, return `{ order, paymentUrl: "https://mock.vnpay.vn/pay?orderId=<id>" }`.
- Real gateway adapters plugged in later via `PaymentsModule` without changing `CheckoutService`.

## CheckoutRepository

Responsible for:
- `findActiveCartWithItems(userId, tx)` — cart + items + product (name, sku, price, status, approvalStatus) + inventoryItem.
- `createOrder(data, tx)` — create order row.
- `createOrderItems(items, tx)` — bulk create order items with snapshots.
- `markCartCheckedOut(cartId, tx)` — update cart status to `CHECKED_OUT`.
- `createPayment(data, tx)` — create payment row (used for non-COD methods).

## Module Wiring

```typescript
@Module({
  imports: [AuthModule, InventoryModule, VouchersModule],
  controllers: [CheckoutController],
  providers: [CheckoutService, CheckoutRepository],
})
export class CheckoutModule {}
```

Register `CheckoutModule` in `AppModule`.

## Voucher Integration

`VouchersModule` must export a `VouchersService` with:
- `validateAndCalculateDiscount(voucherCode, cartItems, subtotal, userId)` — returns `{ discount, voucherRecord }` or throws.
- `createRedemption(voucherId, orderId, userId, discount, tx)` — persists the redemption within the transaction.

If `VouchersModule` does not yet export these methods, the checkout service applies 0 discount and skips voucher redemption (guarded by a feature flag or null check).

## Sequence Diagram

```
Customer → POST /checkout
  → CheckoutController.checkout()
    → CheckoutService.createOrderFromCart()
      → TransactionService.run(tx =>
          CartRepository.findActiveCartWithItems()
          [validate cart, products, stock]
          [calculate totals]
          OrderRepository.createOrder()
          OrderRepository.createOrderItems() [with snapshots]
          InventoryService.deductStockForCheckout() x N items
            → InventoryMovement type SALE
          [if voucher] VouchersService.createRedemption()
          CartRepository.markCartCheckedOut()
          [if MOMO/VNPAY] PaymentRepository.createPayment()
        )
      → return { order } or { order, paymentUrl }
```