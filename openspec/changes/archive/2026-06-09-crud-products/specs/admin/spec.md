## MODIFIED Requirements

### Requirement: Product management
The system SHALL allow admins to list, read, create, update, delete or archive, and manage product approval status through protected product management endpoints.

#### Scenario: Admin manages product
- GIVEN an authenticated admin submits valid product data
- WHEN an admin product endpoint is called
- THEN the system applies the product change according to SKU, slug, category, price, image, inventory, status, and approval rules.

#### Scenario: Admin lists managed products
- GIVEN an authenticated admin
- WHEN `GET /admin/products` is called with supported query parameters
- THEN the system returns a paginated product management listing
- AND includes status, approval status, category, image, and inventory summary fields needed for catalog management.

#### Scenario: Admin reads managed product detail
- GIVEN an authenticated admin requests an existing product
- WHEN `GET /admin/products/{id}` is called
- THEN the system returns product detail regardless of public visibility
- AND includes category, images, inventory fields, status, and approval status.

#### Scenario: Admin removes managed product
- GIVEN an authenticated admin requests product deletion
- WHEN `DELETE /admin/products/{id}` is called
- THEN the system deletes the product only when commerce history allows hard deletion
- AND otherwise archives the product so it is no longer publicly visible.

#### Scenario: Product management denied to non-admin
- GIVEN a guest or authenticated customer
- WHEN the user calls a `/admin/products` endpoint
- THEN the system rejects the request with an unauthenticated or forbidden error.
