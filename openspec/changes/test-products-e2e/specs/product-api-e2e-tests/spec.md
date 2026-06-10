## ADDED Requirements

### Requirement: Product API E2E tests use the docs contract
The product API E2E suite SHALL use `docs/api_documentation.md` as the source of truth for product endpoint paths, access levels, request payloads, response envelopes, and documented response fields.

#### Scenario: Public product endpoints follow documented API paths
- **WHEN** the product API E2E suite tests public product listing and detail
- **THEN** it MUST call `GET /products` and `GET /products/{id}` through the API global prefix
- **AND** it MUST assert documented success response envelopes and key product fields.

#### Scenario: Admin product endpoints follow documented API paths
- **WHEN** the product API E2E suite tests admin product management
- **THEN** it MUST call `GET /admin/products`, `POST /admin/products`, `PATCH /admin/products/{productId}`, and `DELETE /admin/products/{productId}` through the API global prefix
- **AND** it MUST assert documented admin access requirements and response envelopes.

### Requirement: Product API E2E tests cover public catalog behavior
The product API E2E suite SHALL cover public catalog listing, filtering, pagination, and detail visibility behavior.

#### Scenario: Public product list returns visible products
- **WHEN** a public request calls `GET /products` with documented query parameters
- **THEN** the suite MUST verify that the response includes only visible products and pagination metadata.

#### Scenario: Public product detail returns visible product information
- **WHEN** a public request calls `GET /products/{id}` for a visible product
- **THEN** the suite MUST verify that the response includes documented detail fields including price, description, images, category, and stock information.

#### Scenario: Public product detail rejects hidden products
- **WHEN** a public request calls `GET /products/{id}` for an inactive, archived, pending, or rejected product
- **THEN** the suite MUST verify that the response is not found or otherwise not visible.

### Requirement: Product API E2E tests cover admin product management
The product API E2E suite SHALL cover admin product list, create, update, delete or archive, and validation behavior.

#### Scenario: Admin lists products
- **WHEN** an authenticated admin calls `GET /admin/products` with documented filters and pagination parameters
- **THEN** the suite MUST verify that the response includes matching product summaries and pagination metadata.

#### Scenario: Admin creates a product
- **WHEN** an authenticated admin calls `POST /admin/products` with a valid documented product payload
- **THEN** the suite MUST verify that the response creates a product with category, image, status, approval status, and stock data.

#### Scenario: Admin updates a product
- **WHEN** an authenticated admin calls `PATCH /admin/products/{productId}` with valid documented updates
- **THEN** the suite MUST verify that only the submitted product fields are updated in the response.

#### Scenario: Admin deletes or archives a product
- **WHEN** an authenticated admin calls `DELETE /admin/products/{productId}`
- **THEN** the suite MUST verify the documented delete or archive response behavior.

#### Scenario: Invalid or duplicate admin product payload is rejected
- **WHEN** an authenticated admin submits invalid product data or a duplicate SKU or slug
- **THEN** the suite MUST verify that the API rejects the request with the expected validation or conflict status
- **AND** it MUST verify that no successful product response is returned.

### Requirement: Product API E2E tests enforce admin access
The product API E2E suite SHALL verify that admin product endpoints reject guests and authenticated non-admin users.

#### Scenario: Guest cannot manage products
- **WHEN** a guest calls any `/admin/products` endpoint
- **THEN** the suite MUST verify that the API returns an unauthenticated error.

#### Scenario: Non-admin user cannot manage products
- **WHEN** an authenticated non-admin user calls any `/admin/products` endpoint
- **THEN** the suite MUST verify that the API returns a forbidden error.

### Requirement: Product API E2E files are organized for scalability
The API E2E project SHALL keep product tests, fixtures, request helpers, and assertions in a dedicated product API test area.

#### Scenario: Product tests are grouped by concern
- **WHEN** product API E2E tests are added
- **THEN** public product tests MUST be separated from admin product tests
- **AND** shared product fixtures and request helpers MUST be placed in reusable files instead of duplicated across specs.

#### Scenario: API E2E command runs product tests
- **WHEN** `npx nx e2e api-e2e` is executed
- **THEN** the command MUST discover and run the product API E2E tests.
