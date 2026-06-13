## Purpose

Voucher API E2E coverage verifies public voucher discovery, admin voucher management, access control, request validation, and maintainable test organization.

## Requirements

### Requirement: Voucher API E2E tests cover public discovery endpoints
The voucher API E2E suite SHALL cover public voucher discovery routes through the API global prefix and assert their success status codes, response envelopes, and service delegation.

#### Scenario: Public product voucher discovery
- **WHEN** a request calls `GET /vouchers/products/{productId}`
- **THEN** the suite MUST verify that the API returns `200 OK` with a voucher `data` envelope
- **AND** it MUST verify that the voucher service receives the route `productId`.

#### Scenario: Public category voucher discovery
- **WHEN** a request calls `GET /vouchers/categories/{categoryId}`
- **THEN** the suite MUST verify that the API returns `200 OK` with a voucher `data` envelope
- **AND** it MUST verify that the voucher service receives the route `categoryId`.

### Requirement: Voucher API E2E tests cover admin voucher management endpoints
The voucher API E2E suite SHALL cover admin voucher management routes through the API global prefix and assert their success status codes, response envelopes, and service delegation.

#### Scenario: Admin creates voucher
- **WHEN** an authenticated admin calls `POST /admin/vouchers` with a valid create voucher payload
- **THEN** the suite MUST verify that the API returns `201 Created` with a voucher `data` envelope
- **AND** it MUST verify that the voucher service receives the create voucher payload.

#### Scenario: Admin lists vouchers
- **WHEN** an authenticated admin calls `GET /admin/vouchers` with valid query parameters
- **THEN** the suite MUST verify that the API returns `200 OK` with a voucher list `data` envelope
- **AND** it MUST verify that the voucher service receives the parsed query parameters.

#### Scenario: Admin gets voucher detail
- **WHEN** an authenticated admin calls `GET /admin/vouchers/{voucherId}`
- **THEN** the suite MUST verify that the API returns `200 OK` with a voucher `data` envelope
- **AND** it MUST verify that the voucher service receives the route `voucherId`.

#### Scenario: Admin updates voucher before start
- **WHEN** an authenticated admin calls `PATCH /admin/vouchers/{voucherId}` with a valid update voucher payload
- **THEN** the suite MUST verify that the API returns `200 OK` with a voucher `data` envelope
- **AND** it MUST verify that the voucher service receives the route `voucherId` and update voucher payload.

#### Scenario: Admin deactivates voucher
- **WHEN** an authenticated admin calls `PATCH /admin/vouchers/{voucherId}/deactivate`
- **THEN** the suite MUST verify that the API returns `200 OK` with a voucher `data` envelope or success envelope
- **AND** it MUST verify that the voucher service receives the route `voucherId`.

### Requirement: Voucher API E2E tests enforce admin access
The voucher API E2E suite SHALL verify that admin voucher management endpoints are available only to authenticated admins.

#### Scenario: Guest cannot access admin voucher endpoints
- **WHEN** a guest calls any admin voucher management endpoint
- **THEN** the suite MUST verify that the API returns an unauthenticated error
- **AND** it MUST verify that the voucher service is not called.

#### Scenario: Customer cannot access admin voucher endpoints
- **WHEN** an authenticated customer calls any admin voucher management endpoint
- **THEN** the suite MUST verify that the API returns a forbidden error
- **AND** it MUST verify that the voucher service is not called.

### Requirement: Voucher API E2E tests cover admin request validation
The voucher API E2E suite SHALL verify that invalid admin voucher request payloads and query values are rejected before reaching voucher service methods.

#### Scenario: Create voucher rejects invalid payload
- **WHEN** an authenticated admin calls `POST /admin/vouchers` with missing required fields, invalid discount values, or invalid date values
- **THEN** the suite MUST verify that the API returns a validation error
- **AND** it MUST verify that the voucher service is not called for the invalid request.

#### Scenario: Update voucher rejects invalid payload
- **WHEN** an authenticated admin calls `PATCH /admin/vouchers/{voucherId}` with invalid update fields
- **THEN** the suite MUST verify that the API returns a validation error
- **AND** it MUST verify that the voucher service is not called for the invalid request.

#### Scenario: List vouchers rejects invalid query
- **WHEN** an authenticated admin calls `GET /admin/vouchers` with invalid pagination, sorting, or filter query values
- **THEN** the suite MUST verify that the API returns a validation error
- **AND** it MUST verify that the voucher service is not called for the invalid request.

### Requirement: Voucher API E2E files are organized for maintainability
The API E2E project SHALL keep voucher API tests, fixtures, service mocks, and assertions in a dedicated voucher API test area.

#### Scenario: Voucher tests use reusable fixtures and helpers
- **WHEN** voucher API E2E tests are added
- **THEN** voucher-specific fixtures and mock helpers MUST be reusable across public and admin endpoint scenarios
- **AND** the tests MUST use the shared API E2E support helpers for Nest app setup, authenticated request headers, and resource cleanup.

#### Scenario: API E2E command runs voucher tests
- **WHEN** `npx nx e2e api-e2e` is executed
- **THEN** the command MUST discover and run the voucher API E2E tests.
