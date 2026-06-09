# Project: Fullstack E-commerce Platform with TypeScript

## Overview

Fullstack E-commerce Platform with TypeScript is an Nx monorepo project for a modern online shopping platform. It provides a Next.js storefront and admin UI, a NestJS REST API backend, shared TypeScript libraries, Prisma-backed persistence, and Playwright end-to-end testing.

The backend architecture is a modular monolith. Domain modules communicate through normal service/repository calls for request handling and publish internal domain events for side effects such as order creation, inventory updates, payment status changes, and audit logging.

## Main Stack

- Nx monorepo
- Next.js frontend
- NestJS backend
- TypeScript across the stack
- Playwright for E2E testing
- Prisma and PostgreSQL-oriented relational database design

## Actors

- `guest`: unauthenticated visitor who can browse products, search/filter, view details, register, and sign in.
- `customer`: authenticated user who can manage profile, cart, checkout, payments, and personal orders.
- `admin`: privileged user who manages products, inventory, customers, orders, product approvals, revenue, and dashboard data.
- `payment gateway`: external actor that processes payments and sends verified webhook events.

## Core Modules

- auth
- users
- products
- categories
- inventory
- cart
- vouchers
- checkout
- orders
- payments
- admin

## Constraints

- Use the Nx monorepo.
- Use Next.js for the frontend.
- Use NestJS for the backend.
- Use TypeScript across the stack.
- Use Playwright for E2E testing.
- Enforce RBAC for protected routes and admin functions.
- Protect secrets, credentials, password hashes, tokens, and payment secrets.
- Checkout, order creation, and stock deduction must be transactional and concurrency-safe.
- Payment webhooks must verify provider signatures and be idempotent.
- Keep API responses and errors consistent with the documented REST JSON contract.

## OpenSpec Rule

For non-trivial changes, create an OpenSpec proposal before implementation. A non-trivial change includes new modules, new API behavior, database model changes, security changes, checkout/order/payment changes, and any cross-cutting refactor.
