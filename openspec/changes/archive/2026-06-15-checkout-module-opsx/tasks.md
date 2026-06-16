# Tasks: Checkout Module

## Task 1: Add DTOs

**File**: `libs/shared/types` or the api-contracts lib (match existing DTO location)

- [x] Create `DeliveryInfoDto` with `recipientName`, `recipientPhone`, `shippingAddress` — all `@IsString()` `@IsNotEmpty()`.
- [x] Create `CheckoutDto` with `deliveryInfo: DeliveryInfoDto`, `paymentMethod: PaymentMethod` (enum), `voucherCode?: string`.
- [x] Create `ApplyVoucherDto` with `voucherCode: string`, `deliveryInfo: DeliveryInfoDto`.
- [x] Add `PaymentMethod` enum (`COD`, `MOMO`, `VNPAY`) to `@e-commerce-platform/types` if not already present.
- [x] Export all new DTOs from the contracts lib barrel.

## Task 2: Create CheckoutRepository

**File**: `apps/api/src/app/checkout/checkout.repository.ts`

- [x] Inject `DatabaseService` (Prisma client).
- [x] Implement `findActiveCartWithItems(userId, tx?)` — returns cart with items including `product` (name, sku, price, status, approvalStatus) and `product.inventoryItem`.
- [x] Implement `createOrder(data, tx)` — creates order row.
- [x] Implement `createOrderItems(items, tx)` — bulk-creates order items with snapshot fields.
- [x] Implement `markCartCheckedOut(cartId, tx)` — sets cart status to `CHECKED_OUT`.
- [x] Implement `createPayment(data, tx)` — creates payment row for non-COD methods.

## Task 3: Extend InventoryService with deductStockForCheckout

**File**: `apps/api/src/app/inventory/inventory.service.ts`

- [x] Add `deductStockForCheckout(productId: string, quantity: number, orderId: string, tx: DbClient)` method.
- [x] Load inventory item within the transaction.
- [x] Assert available stock (`stockQuantity - reservedQuantity`) >= `quantity`, throw `UnprocessableEntityException` with `BUSINESS_RULE_VIOLATION` if not.
- [x] Decrease `stockQuantity` by `quantity` using `inventoryRepository.decreaseStock()`.
- [x] Record `InventoryMovement` with `movementType: SALE`, `beforeQuantity`, `afterQuantity`, `referenceId: orderId`.

## Task 4: Create CheckoutService

**File**: `apps/api/src/app/checkout/checkout.service.ts`

- [x] Inject `CheckoutRepository`, `TransactionService`, `InventoryService`, `VouchersService` (optional/conditional).

### validateCheckout(userId, dto)
- [x] Load active cart with items.
- [x] Assert cart exists and is not empty.
- [x] For each item: assert product is active + approved, assert available stock >= quantity.
- [x] Calculate `subtotal`, `discount` (0 if no voucher), `shippingFee` (fixed constant for now), `total`.
- [x] Return checkout summary object.

### applyVoucher(userId, dto)
- [x] Load active cart, calculate subtotal.
- [x] Delegate to `VouchersService.validateAndCalculateDiscount()` — if not available, return `{ discount: 0 }`.
- [x] Return `{ subtotal, discount, shippingFee, total, voucherCode }`.

### createOrderFromCart(userId, dto)
- [x] Wrap everything in `transactionService.run(async (tx) => { ... })`.
- [x] Load active cart with items inside tx.
- [x] Assert cart not empty.
- [x] Validate each product (active, approved, stock sufficient).
- [x] Calculate totals.
- [x] Generate unique `orderNumber` (e.g., `ORD-${Date.now()}-${randomInt}`).
- [x] Create `Order` record with delivery info snapshot, amounts, paymentMethod, status `PENDING`.
- [x] Create `OrderItem` records with `productNameSnapshot`, `skuSnapshot`, `unitPriceSnapshot`.
- [x] Call `inventoryService.deductStockForCheckout()` for each item within tx.
- [x] If `voucherCode` provided and `VouchersService` available: validate and call `vouchersService.createRedemption()` within tx.
- [x] Call `checkoutRepository.markCartCheckedOut(cart.id, tx)`.
- [x] If `paymentMethod === COD`: return `{ order }`.
- [x] If `paymentMethod === MOMO`: create payment record (status PENDING), return `{ order, paymentUrl: 'https://mock.momo.vn/pay?orderId=<id>' }`.
- [x] If `paymentMethod === VNPAY`: create payment record (status PENDING), return `{ order, paymentUrl: 'https://mock.vnpay.vn/pay?orderId=<id>' }`.

## Task 5: Create CheckoutController

**File**: `apps/api/src/app/checkout/checkout.controller.ts`

- [x] Apply `@Controller('checkout')`, `@UseGuards(JwtAuthGuard, RolesGuard)`, `@Roles(RoleValues.CUSTOMER)`.
- [x] Implement `POST /checkout/validate` → `checkoutService.validateCheckout(user.userId, dto)`.
- [x] Implement `POST /checkout/voucher` → `checkoutService.applyVoucher(user.userId, dto)`.
- [x] Implement `POST /checkout` → `checkoutService.createOrderFromCart(user.userId, dto)`.

## Task 6: Create CheckoutModule

**File**: `apps/api/src/app/checkout/checkout.module.ts`

- [x] Declare `CheckoutModule` with imports: `AuthModule`, `InventoryModule`, and `VouchersModule` (if exported).
- [x] Register `CheckoutController`, `CheckoutService`, `CheckoutRepository` as providers.

## Task 7: Register in AppModule

**File**: `apps/api/src/app/app.module.ts`

- [x] Add `CheckoutModule` to the `imports` array.

## Task 8: Unit Tests

**Files**: `apps/api/src/app/checkout/checkout.service.spec.ts`

- [x] Test `validateCheckout`: empty cart, inactive product, insufficient stock, success path.
- [x] Test `createOrderFromCart`: COD path returns order, MOMO path returns paymentUrl, transaction rollback on stock failure.
- [x] Test `deductStockForCheckout` in InventoryService: insufficient stock throws, stock decremented, SALE movement created.

## Task 9: E2E / Integration Tests (optional)

- [ ] `POST /checkout/validate` — happy path, empty cart, out-of-stock.
- [ ] `POST /checkout` COD — full flow creates order, order items with snapshots, marks cart checked_out.
- [ ] `POST /checkout` MOMO — returns paymentUrl.
- [ ] `POST /checkout/voucher` — valid voucher returns discount, invalid voucher returns 422.