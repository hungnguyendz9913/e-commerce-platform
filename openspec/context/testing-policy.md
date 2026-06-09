# Testing Policy

## Test Levels

- Unit tests verify services, policies, guards, DTO validation helpers, pricing logic, stock rules, voucher rules, order status policies, payment adapters, and webhook parsing.
- Integration/API tests verify NestJS controllers, guards, request validation, response format, error format, repository interactions, and transaction behavior.
- Playwright E2E tests verify browser workflows through the Next.js UI and backend API.

## Required E2E Flows

The SRS and API documentation identify these priority E2E/API flows:

- User registration.
- User login.
- Protected profile access.
- Product search and filter.
- Product detail viewing.
- Add item to cart.
- Update and remove cart item.
- Checkout with valid delivery information.
- Voucher success and invalid voucher rejection.
- Payment creation or mocked payment flow.
- Customer order history and detail.
- Customer cancel order when status allows.
- Admin login/access.
- Admin creates or updates product.
- Admin updates inventory.
- Admin updates order status.
- Payment webhook processing.

## Change Requirements

Every behavior-changing OpenSpec change must include tests or explicitly explain why tests are unnecessary. Security, checkout, inventory, payment, and RBAC changes require tests unless blocked by missing infrastructure.

## Validation Commands

Prefer Nx targets when available:

- `npx nx test api`
- `npx nx test web`
- `npx nx e2e api-e2e`
- `npx nx e2e web-e2e`
- `npx nx lint <project>`

Run only relevant tests for narrow changes, but broaden coverage for shared contracts, database rules, authentication, checkout, inventory, payment, or admin workflows.
