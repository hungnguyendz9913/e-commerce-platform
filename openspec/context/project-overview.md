# Project Overview

## Business Goal

The project builds a modern e-commerce platform that supports the core online shopping lifecycle: account creation, authentication, product discovery, cart management, checkout, payment, order tracking, and administration.

The business goal is to provide a stable shopping experience while practicing a full software development lifecycle with frontend, backend, database, testing, DevOps, and monorepo management.

## Scope

Version 1.0 includes:

- Public storefront for browsing, searching, filtering, and viewing products.
- Customer account flows for registration, login, logout, session/token handling, profile, addresses, cart, checkout, payment, and order history.
- Admin dashboard and CMS flows for product management, inventory management, customer management, order management, product approval, and revenue metrics.
- Payment gateway integration or a mocked provider flow when real credentials are unavailable.
- Unit, integration/API, and Playwright E2E tests for core workflows.
- Docker and CI/CD-ready deployment support.

Out of scope for Version 1.0:

- Native mobile applications.
- AI recommendation features.
- Real-time customer/seller chat.
- Full multi-vendor marketplace behavior unless introduced by a later OpenSpec change.

## Actors

- Guest: browses products, searches/filters, views details, registers, and signs in.
- Customer: manages profile, addresses, cart, checkout, payments, and personal orders.
- Admin: manages products, inventory, orders, customers, approvals, revenue, and dashboard data.
- Payment Gateway: external payment system that processes transactions and sends callbacks/webhooks.

## Version 1.0 Priorities

- Secure authentication and RBAC.
- Product catalog and category browsing.
- Cart and checkout with safe stock validation.
- Transactional order creation and inventory deduction.
- Payment integration with verified, idempotent webhooks.
- Admin management for products, inventory, orders, customers, approvals, and revenue.
- Playwright E2E coverage for main user and admin flows.
