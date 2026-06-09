# Database Map

The documented and current Prisma model is relational and PostgreSQL-oriented. It is designed for transactional consistency in checkout, inventory, orders, payments, vouchers, and audit logging.

## Entity Groups

- Identity: `users`, `roles`, `user_roles`, `sessions`.
- Profile: `addresses`.
- Catalog: `categories`, `products`, `product_images`.
- Inventory: `inventory_items`, `inventory_movements`.
- Cart: `carts`, `cart_items`.
- Promotion: `vouchers`, `voucher_redemptions`.
- Order: `orders`, `order_items`, `order_status_histories`.
- Payment: `payments`, `payment_transactions`, `payment_webhook_events`.
- Audit: `audit_logs`.

## Critical Constraints

- User email is unique.
- Role name is unique.
- Category slug is unique.
- Product SKU is unique.
- Product slug is unique.
- One inventory item exists per product.
- One product row appears once per cart through unique cart/product cart items.
- Voucher code is unique.
- One voucher redemption is linked to a final order.
- Order number is unique.
- External payment transaction id is unique when present.
- Payment webhook external event id is unique for idempotency.
- Manual SQL constraints enforce non-negative prices, stock, order amounts, payment amounts, and voucher amounts.
- A partial unique index is recommended for one active cart per user.

## Critical Integrity Rules

- Passwords must be hashed and plaintext passwords must never be stored.
- Admin access must be represented through persisted roles.
- Product price must be non-negative.
- Public products must be active and approved.
- Stock and reserved quantity must never be negative.
- Reserved quantity must not exceed stock quantity.
- Inventory movements must record sale, cancellation, refund, import, and manual adjustment.
- Cart item quantity must be positive and cannot exceed available stock at checkout.
- Checkout must atomically validate cart, create order and order items, deduct stock, create voucher redemption if any, and mark the cart checked out.
- Order items must snapshot product name, SKU, price, and quantity.
- Order status transitions must follow pending, processing, shipped, delivered, with canceled and refunded as controlled terminal states.
- Payment amount must match the payable order amount.
- Webhook signature verification is required before payment/order status changes.
- Webhook processing must be idempotent using unique external event ids.
