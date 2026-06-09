# Tasks

- [x] Inspect existing auth/user code
- [x] Compare implementation with API docs and SRS
- [x] Ensure registration creates customer role
- [x] Ensure login returns identity and roles
- [x] Ensure /auth/me works for customer/admin
- [x] Ensure /users/me works for profile
- [x] Ensure admin-only routes use RBAC guard
  - Baseline note: no real admin endpoints exist yet. RBAC primitives (`@Roles`, `RolesGuard`, `JwtAuthGuard`) are implemented and unit-tested; real admin endpoints must apply `JwtAuthGuard` + `RolesGuard` + `@Roles(admin)` when introduced.
- [x] Ensure customer resources use ownership checks
  - Baseline note: current `/users/me` uses `CurrentUser().userId` and does not accept a client-supplied user id. Future customer-owned resources such as addresses, cart, orders, and payments must enforce owner checks when implemented.
- [x] Add or update unit tests
- [x] Add or update API/E2E tests
- [x] Run OpenSpec validation
- [x] Run Nx tests
