# Architecture

## Nx Monorepo Structure

The repository is an Nx workspace with:

- `apps/web`: Next.js frontend application.
- `apps/api`: NestJS backend API application.
- `apps/web-e2e`: Playwright E2E tests for the web application.
- `apps/api-e2e`: API E2E test project.
- `libs/infrastructure/database`: Prisma schema, generated Prisma client, and database module/service.
- `libs/shared/types`: shared DTOs, role enums, constraints, and generated declarations.
- `libs/shared/utils`: shared utilities such as Prisma error helpers.

The SDD also proposes future domain and shared libraries such as `libs/domain/*`, `libs/shared/dto`, `libs/shared/validation`, and `libs/shared/ui`. Add them only through approved changes.

## Backend Architecture

The backend is a modular NestJS monolith. Each domain module should follow the local layering pattern:

- Controllers receive HTTP requests and apply guards, decorators, pipes, and DTO validation.
- DTOs define request shape and validation rules.
- Services and use cases implement application behavior and orchestration.
- Domain policies enforce business rules such as RBAC, ownership, order transitions, voucher validity, and stock rules.
- Repositories isolate database access through Prisma.
- Events publish important domain changes for audit, payment, inventory, notification, or other side effects.

Current implemented backend scope includes auth, user, user-role, session, JWT guard, roles guard, password service, token service, `/auth/*`, and `/users/me`. Most commerce modules are currently represented by documentation and Prisma schema rather than application controllers/services.

## Frontend Architecture

The SDD defines these frontend page groups:

- Public storefront: home, product listing, product detail, category browsing.
- Auth pages: login and registration.
- Customer pages: profile, cart, checkout, orders, order detail.
- Admin pages: dashboard, products, inventory, orders, customers, approvals, revenue.

Current frontend implementation is minimal and only contains the initial app shell and example route.

## Event-driven Design

The backend remains one deployable API service, but domain events coordinate side effects. Documented events include `ProductCreated`, `InventoryUpdated`, `OrderCreated`, `PaymentUpdated`, `OrderStatusChanged`, and `VoucherRedeemed`.

Events must not replace transactional consistency. Checkout must create orders, snapshot order items, deduct stock, apply voucher redemption, and mark carts checked out inside a safe database transaction before publishing side effects.
