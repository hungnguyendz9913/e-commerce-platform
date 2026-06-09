## Context

The API is a NestJS modular monolith in an Nx workspace. Current reusable code already exists in broad libraries such as `libs/shared/types`, `libs/shared/utils`, and `libs/infrastructure/database`, while several API-facing contracts and helpers still live under feature modules in `apps/api/src/app/**`. Examples include auth DTOs, product DTOs and validators, auth decorators, guards, authenticated-user types, password/token utilities, and module-level constants or enums.

The refactor should improve reuse and dependency clarity without changing HTTP behavior. Existing API modules must continue to own controllers, repositories, orchestration services, and private request models that are not useful outside the owning module.

## Goals / Non-Goals

**Goals:**

- Establish a clear Nx library layout for reusable API contracts and utilities.
- Move shared DTOs, validation helpers, domain types, constants, decorators/guards/helpers, and service utilities into libraries when they are cross-module or intentionally reusable.
- Keep public library entrypoints explicit and avoid deep imports into implementation files.
- Preserve validation behavior, RBAC behavior, token/session behavior, API response contracts, and test assertions.
- Keep the dependency graph acyclic and layered.

**Non-Goals:**

- No new API endpoints or HTTP contract changes.
- No Prisma schema or database migration changes.
- No rewrite of feature module business logic beyond import and ownership cleanup.
- No frontend contract generation or OpenAPI generation in this change.
- No extraction of every feature module into domain libraries.

## Decisions

### Use API-focused shared libraries instead of a single catch-all library

Create or reorganize libraries around ownership and runtime dependencies:

- `libs/shared/types`: framework-light shared TypeScript types, enums, and constants that can be consumed outside NestJS.
- `libs/shared/utils`: framework-light utilities such as Prisma error helpers and pure functions.
- `libs/api/contracts` or equivalent Nx project: Nest/API-facing DTOs and validation constructs that depend on `class-validator`, `class-transformer`, or `@nestjs/mapped-types`.
- `libs/api/common` or equivalent Nx project: reusable NestJS guards, decorators, request helpers, and common API service utilities.

Rationale: API DTOs and NestJS guards have framework dependencies that do not belong in a generic shared type library. Keeping them in API-specific libraries protects frontend-safe/shared type exports from accidental NestJS dependencies.

Alternative considered: keep expanding `libs/shared/types` and `libs/shared/utils`. This is simpler initially but blurs runtime dependencies and makes it harder to know whether a symbol is safe for web, API, or both.

### Classify before moving

Before moving files, classify candidates as:

- shared contract: DTOs, validation helpers, enums, constants, and request/response types used by multiple modules or intended as public API contracts;
- shared API helper: guards, decorators, request helpers, and small reusable service utilities used by multiple modules;
- module-private code: controllers, repositories, orchestration services, and DTOs used only by one module with no cross-module contract value.

Rationale: Moving code only because it could be reused creates broad libraries with weak ownership. The migration should extract actual reusable surfaces and leave private feature details local.

Alternative considered: move all DTOs and helpers wholesale. This would be faster but would make feature-local contracts harder to maintain and would expose too much as shared API.

### Preserve existing package-style imports and Nx project conventions

New libraries should follow the current internal package pattern with `package.json` exports using the `@e-commerce-platform/source` condition, TypeScript project references, and root workspace globs. Consumers should import from package entrypoints such as `@e-commerce-platform/api-contracts`, not from private source paths.

Rationale: Existing libraries already use package exports instead of central `paths` aliases. Matching that pattern avoids mixing import styles and keeps Nx build/typecheck behavior predictable.

Alternative considered: add broad `tsconfig` path aliases. This is common in Nx workspaces, but it diverges from the current package-export setup.

### Maintain behavioral equivalence through tests

After each migration group, run the affected API tests and typecheck/lint targets. Tests should not be rewritten to accept changed validation results, auth outcomes, or REST contracts unless an unrelated pre-existing test issue is documented separately.

Rationale: This is a refactor. Passing tests with unchanged assertions is the clearest signal that behavior was preserved.

Alternative considered: migrate everything first and test at the end. That increases debugging scope and makes it harder to isolate behavioral drift.

## Risks / Trade-offs

- [Risk] API DTO libraries may pull NestJS/class-validator dependencies into generic shared packages. → Mitigation: keep DTOs and NestJS-specific helpers in API-focused libraries, not framework-light shared libraries.
- [Risk] Over-extraction can make feature modules harder to read. → Mitigation: only move code that is reused, cross-module, or intentionally a public API contract.
- [Risk] Circular dependencies can appear between shared API helpers, contracts, and feature modules. → Mitigation: shared libraries must not import `apps/api/src/app/**`; validate with Nx graph/typecheck.
- [Risk] Decorator and guard migrations can change metadata keys or request typing. → Mitigation: migrate metadata constants together with decorators/guards and keep existing guard tests intact.
- [Risk] Package export or project-reference setup can break Jest resolution. → Mitigation: mirror existing internal package configuration and run affected Jest targets after each library is introduced.

## Migration Plan

1. Inventory API-local DTOs, validators, enums, domain/request types, constants, guards, decorators, helpers, and reusable service utilities.
2. Classify each candidate as shared contract, shared API helper, or module-private.
3. Create any needed API-focused Nx libraries using the existing package-export conventions.
4. Move contracts and helpers in small groups, updating public entrypoints and imports after each group.
5. Keep old module-local imports out of shared consumers and remove obsolete barrels/files once imports are migrated.
6. Run focused API unit tests after each group, then run broader API lint/typecheck/test targets.
7. If a migration group causes unexpected behavior changes, rollback that group by restoring the module-local code and imports while keeping completed independent groups.

## Open Questions

- Should product DTOs be considered shared API contracts now, or kept module-local until another module consumes them?
- Should auth guards/decorators live in `libs/api/common` immediately, or remain in `apps/api/src/app/auth` until another protected module is implemented?
