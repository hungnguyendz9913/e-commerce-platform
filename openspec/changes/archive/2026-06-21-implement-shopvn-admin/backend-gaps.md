## Backend Contract Gap List

Confirmed existing admin contracts:

- Products: `GET/POST /admin/products`, `GET/PATCH/DELETE /admin/products/:id`.
- Categories: `GET/POST /admin/categories`, `GET/PATCH/DELETE /admin/categories/:id`.
- Vouchers: `GET/POST /admin/vouchers`, `GET/PATCH /admin/vouchers/:voucherId`, `PATCH /admin/vouchers/:voucherId/deactivate`.
- Product approval can be represented through the existing admin product update contract by changing `approvalStatus`.
- Inventory create/update is available only through admin product create/update payloads.

Confirmed missing or unsupported admin contracts:

- Dashboard summary and recent activity endpoint.
- Dedicated inventory list, low-stock query, stock-adjustment endpoint, and inventory movement listing.
- Admin order list/detail/status transition endpoints. Existing order routes are customer-scoped under `/orders`.
- Admin customer list and customer status mutation endpoints.
- Dedicated approval queue endpoint. Approval UI must use product listing filters and product update where available.
- Revenue summary, grouped revenue series, and export endpoints.
- Admin payment history endpoint.
- Webhook log listing and webhook payload detail endpoint.
- Audit log listing, filtering, and before/after detail endpoint.

Frontend implication:

- Production UI must hide or clearly disable missing mutation actions and show backend-gap empty states for missing read surfaces.
- Product, category, and voucher actions may call backend-backed contracts.
- Inventory actions may only be exposed as product inventory fields in product create/edit until dedicated inventory contracts exist.
