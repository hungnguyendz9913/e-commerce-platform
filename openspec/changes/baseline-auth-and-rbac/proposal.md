# Baseline Auth and RBAC

## Why

The repository already contains early authentication, user, session, token, role, guard, and `/users/me` code, while the project documents define broader auth/RBAC expectations for the platform. This change exists to align the existing implementation and documentation before future modules depend on identity, roles, ownership, and admin/customer access rules.

## Scope

- Registration creates customer accounts and assigns the customer role.
- Login returns identity and roles with secure token/session handling.
- Logout invalidates the authenticated session.
- Forgot/reset password is included because current auth code exposes those endpoints.
- `/auth/me` returns current authenticated identity and roles.
- `/users/me` returns current profile information.
- Roles, guards, decorators, and access-level rules are reviewed for customer/admin behavior.
- Customer ownership and admin-only access rules are documented for future modules.

## Out of Scope

- Product module implementation.
- Cart module implementation.
- Checkout implementation.
- Payment implementation.
- Admin dashboard implementation.
- New application source code changes as part of OpenSpec setup.
- Database schema redesign outside auth/user alignment.

## Success Criteria

- Auth and user specs describe the required baseline behavior.
- Future changes can rely on a clear distinction between public, customer, admin, and gateway access.
- Any implementation follow-up has a concrete task list and validation expectations.
