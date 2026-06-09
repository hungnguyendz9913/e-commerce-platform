# Auth Spec Delta

## ADDED Requirements

### Requirement: Baseline auth endpoints
The system SHALL provide registration, login, logout, refresh when token rotation is used, forgot password, reset password, and `/auth/me` behavior consistent with the documented auth contract.

#### Scenario: Register creates customer identity
- GIVEN a guest registers with valid unique email and password data
- WHEN registration succeeds
- THEN the system creates an active user
- AND stores only a password hash
- AND assigns the `customer` role
- AND returns customer-safe identity data.

#### Scenario: Login includes roles
- GIVEN an active user has one or more persisted roles
- WHEN login succeeds
- THEN the system returns session/token data
- AND includes the user's roles in the authenticated identity payload.

#### Scenario: Auth me returns identity and roles
- GIVEN a customer or admin has a valid authenticated session
- WHEN `GET /auth/me` is called
- THEN the system returns current identity, roles, and status
- AND omits password hashes, token hashes, and secrets.

#### Scenario: Logout revokes current session
- GIVEN an authenticated user has an active session
- WHEN `POST /auth/logout` is called
- THEN the system revokes that session
- AND later use of that session is rejected.

### Requirement: Baseline RBAC enforcement
The system SHALL use role metadata and a role guard for admin-only behavior.

#### Scenario: Customer cannot use admin endpoint
- GIVEN a user is authenticated with only the `customer` role
- WHEN the user requests an endpoint requiring `admin`
- THEN the system rejects the request with a forbidden error.

#### Scenario: Admin can use admin endpoint
- GIVEN a user is authenticated with the `admin` role
- WHEN the user requests an endpoint requiring `admin`
- THEN the role guard allows the request.

### Requirement: Password reset baseline
The system SHALL support forgot/reset password behavior without leaking account existence.

#### Scenario: Forgot password generic response
- GIVEN an email is submitted to forgot password
- WHEN the email is unknown, inactive, or active
- THEN the system returns a generic reset message.

#### Scenario: Reset password revokes sessions
- GIVEN a valid reset token and valid new password
- WHEN password reset succeeds
- THEN the system updates the password hash
- AND revokes existing sessions for that user.
