## 1. Controller Flow

- [x] 1.1 Verify `ProductsController` exposes `GET /products` and `GET /products/:id` and delegates query DTOs and ids to public product service methods.
- [x] 1.2 Verify `AdminProductsController` exposes `GET`, `POST`, `GET :id`, `PATCH :id`, and `DELETE :id` under `/admin/products`.
- [x] 1.3 Ensure admin product routes use `JwtAuthGuard`, `RolesGuard`, and admin role metadata consistently with the app's role guard pattern.
- [x] 1.4 Add or update controller tests for public route prefix/delegation and admin route guards/delegation.

## 2. Product Service Behavior

- [x] 2.1 Ensure public listing applies active and approved visibility filters and returns public summary fields with pagination metadata.
- [x] 2.2 Ensure public detail fetches only active and approved products and returns not found for hidden products.
- [x] 2.3 Ensure admin listing supports search, category, status, approval status, price range, stock filter, sorting, and pagination without public visibility restrictions.
- [x] 2.4 Ensure admin detail returns products regardless of visibility with category, images, status, approval status, stock, reserved quantity, and timestamps.
- [x] 2.5 Ensure create validates active category and unique SKU/slug, persists images, and delegates inventory initialization inside the product transaction.
- [x] 2.6 Ensure update validates changed category and SKU/slug, updates only provided fields, replaces images only when supplied, and delegates inventory updates when supplied.
- [x] 2.7 Ensure delete hard-deletes products without protected references and archives products with cart, order, or inventory movement references.

## 3. Repository and Contracts

- [x] 3.1 Ensure repository queries include product category, ordered images, and inventory item data needed by public and admin response shapes.
- [x] 3.2 Ensure delete-reference lookup includes all protected commerce counts used by the delete-versus-archive decision.
- [x] 3.3 Confirm product DTO imports and enum usage come from `@e-commerce-platform/api-contracts` and do not introduce breaking contract changes.

## 4. Verification

- [x] 4.1 Add or update product service tests for public visibility, admin filtering, create/update inventory delegation, duplicate SKU/slug conflicts, and delete/archive behavior.
- [x] 4.2 Run the relevant product test suite and fix any failures.
- [x] 4.3 Run lint or typecheck for the API package if available and fix product-flow regressions.
