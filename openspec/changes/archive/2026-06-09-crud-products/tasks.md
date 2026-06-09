## 1. Module and Route Setup

- [x] 1.1 Create `ProductsModule` under `apps/api/src/app/products` and import `DatabaseModule`.
- [x] 1.2 Register `ProductsModule` in `apps/api/src/app/app.module.ts`.
- [x] 1.3 Add an admin products controller mounted at `/admin/products` with list, create, detail, update, and delete routes.
- [x] 1.4 Protect all admin product routes with `JwtAuthGuard`, `RolesGuard`, and `Roles('admin')`.
- [x] 1.5 Add a public products controller or route coverage for `/products` if missing so public visibility behavior remains explicit.

## 2. DTOs and Validation

- [x] 2.1 Add DTOs for admin product create, update, list query, image input, and inventory input.
- [x] 2.2 Validate required create fields: SKU, name, slug, category id, price, and supported enum values when provided.
- [x] 2.3 Validate optional update fields without requiring unchanged fields.
- [x] 2.4 Validate image arrays for URL, alt text, sort order, and primary-image fields.
- [x] 2.5 Validate inventory fields for non-negative stock quantity, non-negative reserved quantity, and reserved quantity not exceeding stock quantity.
- [x] 2.6 Validate list query parameters for pagination, search, category, price range, stock state, status, approval status, sort field, and sort order.

## 3. Persistence and Domain Logic

- [x] 3.1 Add a product repository or service persistence layer using `DatabaseService`.
- [x] 3.2 Implement admin product listing with pagination metadata, search, filters, allowed sorting, category relation, primary image, and inventory summary.
- [x] 3.3 Implement admin product detail lookup that returns products regardless of public visibility and includes category, images, status, approval status, and inventory fields.
- [x] 3.4 Implement create in a transaction that checks active category assignment, SKU uniqueness, slug uniqueness, creates product, stores images, creates one inventory item, and records initial import movement when stock is greater than zero.
- [x] 3.5 Implement update in a transaction that validates changed category, SKU, slug, price, status, approval status, image collection, and inventory fields.
- [x] 3.6 Replace product images on update only when an image collection is provided.
- [x] 3.7 Update inventory item on product update when inventory fields are provided and record adjustment movement when stock quantity changes.
- [x] 3.8 Implement delete behavior that hard-deletes only products without protected commerce references and archives referenced products by setting status to `ARCHIVED`.
- [x] 3.9 Map Prisma uniqueness, missing record, and constraint errors to API conflict, not-found, validation, or business-rule errors consistent with existing API conventions.

## 4. Public Product Visibility

- [x] 4.1 Ensure public product listing returns only active and approved products.
- [x] 4.2 Ensure public product detail rejects inactive, archived, pending, and rejected products as not found or not visible.
- [x] 4.3 Ensure archived products from admin deletion are excluded from public listing and detail.

## 5. Tests

- [x] 5.1 Add controller tests for admin product RBAC denial and allowed admin route access.
- [x] 5.2 Add service or repository tests for create validation, active category assignment, unique SKU/slug conflicts, image persistence, inventory creation, and initial movement logging.
- [x] 5.3 Add update tests for partial updates, duplicate SKU/slug conflicts, category changes, image replacement, inventory updates, and stock adjustment movement logging.
- [x] 5.4 Add listing tests for pagination, search, filters, sorting, and returned management summary fields.
- [x] 5.5 Add delete/archive tests for hard deletion without references and archive behavior with protected references.
- [x] 5.6 Add public visibility tests for active approved products and hidden inactive, archived, pending, or rejected products.

## 6. Verification

- [x] 6.1 Run the relevant API unit tests for product, auth guard, and user-role interactions.
- [x] 6.2 Run API lint/typecheck or the closest available Nx validation target.
- [x] 6.3 Run OpenSpec validation/status for `crud-products` and confirm all required artifacts remain apply-ready.
