-- Apply after the initial Prisma migration has created the tables.
-- Recommended: put this into a Prisma migration SQL file, not run manually outside migrations.

CREATE UNIQUE INDEX IF NOT EXISTS unique_active_cart_per_user
ON carts (user_id)
WHERE status = 'active';

ALTER TABLE products
ADD CONSTRAINT products_price_non_negative CHECK (price >= 0);

ALTER TABLE inventory_items
ADD CONSTRAINT inventory_stock_non_negative CHECK (stock_quantity >= 0),
ADD CONSTRAINT inventory_reserved_non_negative CHECK (reserved_quantity >= 0),
ADD CONSTRAINT inventory_reserved_not_exceed_stock CHECK (reserved_quantity <= stock_quantity);

ALTER TABLE cart_items
ADD CONSTRAINT cart_items_quantity_positive CHECK (quantity > 0),
ADD CONSTRAINT cart_items_unit_price_non_negative CHECK (unit_price_snapshot >= 0);

ALTER TABLE order_items
ADD CONSTRAINT order_items_quantity_positive CHECK (quantity > 0),
ADD CONSTRAINT order_items_unit_price_non_negative CHECK (unit_price_snapshot >= 0),
ADD CONSTRAINT order_items_total_price_non_negative CHECK (total_price >= 0);

ALTER TABLE orders
ADD CONSTRAINT orders_subtotal_non_negative CHECK (subtotal_amount >= 0),
ADD CONSTRAINT orders_discount_non_negative CHECK (discount_amount >= 0),
ADD CONSTRAINT orders_shipping_fee_non_negative CHECK (shipping_fee >= 0),
ADD CONSTRAINT orders_tax_non_negative CHECK (tax_amount >= 0),
ADD CONSTRAINT orders_total_non_negative CHECK (total_amount >= 0);

ALTER TABLE payments
ADD CONSTRAINT payments_amount_non_negative CHECK (amount >= 0);

ALTER TABLE payment_transactions
ADD CONSTRAINT payment_transactions_amount_non_negative CHECK (amount >= 0);

ALTER TABLE vouchers
ADD CONSTRAINT vouchers_discount_value_non_negative CHECK (discount_value >= 0),
ADD CONSTRAINT vouchers_percent_not_over_100 CHECK (
  discount_type <> 'percent' OR discount_value <= 100
),
ADD CONSTRAINT vouchers_minimum_order_non_negative CHECK (
  minimum_order_amount IS NULL OR minimum_order_amount >= 0
),
ADD CONSTRAINT vouchers_maximum_discount_non_negative CHECK (
  maximum_discount_amount IS NULL OR maximum_discount_amount >= 0
),
ADD CONSTRAINT vouchers_usage_limit_positive CHECK (
  usage_limit IS NULL OR usage_limit > 0
),
ADD CONSTRAINT vouchers_per_user_limit_positive CHECK (
  per_user_limit IS NULL OR per_user_limit > 0
);