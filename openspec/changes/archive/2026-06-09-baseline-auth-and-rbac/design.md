# Baseline Auth and RBAC Design

## Expected Architecture

Authentication and user identity are implemented through:

- `AuthModule`: owns registration, login, refresh, logout, forgot password, reset password, and `/auth/me`.
- `UsersModule`: owns `/users/me`, profile behavior, and future address/customer ownership behavior.
- `UserRoleModule`: owns role lookup/creation and role assignment.
- `PasswordService`: hashes passwords, verifies passwords, and hashes tokens when needed.
- `TokenService`: creates and verifies access tokens, refresh tokens, and password reset tokens.
- `SessionRepository`: stores, finds, rotates, and revokes refresh/session state.
- `JwtAuthGuard` or equivalent session guard: authenticates protected requests and attaches the current user.
- `RolesGuard`: enforces role metadata.
- `@Roles(...)`: declares required roles on protected handlers/classes.
- `@CurrentUser()`: injects the authenticated user into controllers.

## Role Model

- `guest` is not persisted as a role. It represents an unauthenticated request.
- `customer` and `admin` are persisted roles.
- Registration creates normal customer accounts and assigns `customer`.
- Admin assignment must be controlled and must not be available through public registration.

## Access Levels

- Public: no authentication required, such as registration, login, product browsing, and password recovery initiation.
- Customer: authenticated customer access for profile, addresses, cart, checkout, orders, and own payment status.
- Admin: authenticated admin access for management endpoints.
- Gateway: payment webhook access guarded by provider signature verification instead of user login.

## `/auth/me` vs `/users/me`

- `/auth/me` returns current authenticated identity and role information needed for session validation and route authorization.
- `/users/me` returns profile information and future profile-specific fields such as avatar and addresses.
- Neither endpoint may return password hashes, refresh token hashes, reset tokens, provider secrets, or other sensitive data.

## Security Rules

- Passwords must be stored only as secure hashes.
- Token secrets must come from environment configuration and must not be committed or exposed to frontend code.
- Plaintext passwords must never be logged or returned.
- Refresh tokens must be stored only as hashes if persisted.
- Logout must revoke the current session.
- Password reset must avoid account enumeration and revoke existing sessions after a successful reset.
- RBAC checks must run after authentication and before protected admin behavior.
- Customer resources require ownership checks in addition to authentication.
