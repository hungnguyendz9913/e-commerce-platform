# Domain Map

## Backend Modules

- AuthModule: registration, login, refresh, logout, forgot/reset password, session/token handling, current identity, password hashing, JWT/session verification, and role claims.
- UsersModule: current profile, profile update, addresses, customer ownership checks, and admin customer lookup when exposed through admin APIs.
- UserRoleModule: role lookup/creation and role assignment.
- ProductsModule: public product listing/detail, admin product CRUD, product visibility, status, approval status, images, SKU, slug, and price rules.
- CategoriesModule: category hierarchy, active category visibility, category listing, and category-product relationship.
- InventoryModule: one inventory item per product, stock/reserved quantities, movement logs, manual adjustment, stock validation, deduction, cancellation, refund, and overselling prevention.
- CartModule: active customer cart, item add/update/remove/clear, price snapshots, cart totals, stock validation, and ownership.
- VouchersModule: voucher validation, scope-based product/category applicability, discount calculation, active/time validity, minimum order amount, maximum discount, global limits, per-user limits, and redemptions.
- CheckoutModule: checkout validation, delivery information validation, voucher application, payment method selection, cart-to-order orchestration, and transactional stock deduction.
- OrdersModule: order creation, customer history/detail/cancel, status history, order status policy, order item snapshots, and admin lifecycle updates.
- PaymentsModule: payment creation, status lookup, provider adapters, external payment references, transaction records, webhook signature verification, idempotent webhook event processing, and payment/order status updates.
- AdminModule: dashboard, revenue metrics, product management, inventory management, order management, customer management, product approval, and audit visibility.
- Audit/Event handlers: audit logs and asynchronous side effects from domain events.

## Access Summary

- Public: product/category read, registration, login, forgot/reset password.
- Customer: profile, addresses, cart, checkout, personal orders, own payment status.
- Admin: product, inventory, customer, order, approval, dashboard, and revenue management.
- Gateway: payment webhook endpoints after valid provider signature verification.
