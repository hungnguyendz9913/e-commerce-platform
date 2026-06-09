## 1. Inventory and Classification

- [x] 1.1 Inventory API-local DTOs, validators, enums, request/domain types, constants, decorators, guards, helpers, and reusable service utilities under `apps/api/src/app/**`.
- [x] 1.2 Classify each candidate as shared contract, shared API helper, or module-private code.
- [x] 1.3 Record which files will move and which files will remain module-local before editing imports.

## 2. Library Setup

- [x] 2.1 Create any needed API-focused Nx libraries using the existing package-export and TypeScript project-reference conventions.
- [x] 2.2 Configure library package metadata, TypeScript configs, and ESLint configs consistently with existing internal libraries.
- [x] 2.3 Add public entrypoints that export only reusable contracts and helpers.

## 3. Contract Migration

- [x] 3.1 Move shared API DTOs, validation helpers, enums, constants, and domain/request types into the selected shared contract library.
- [x] 3.2 Update API module imports to consume migrated contracts through public library entrypoints.
- [x] 3.3 Keep module-private DTOs and validators in their owning modules.
- [x] 3.4 Run focused tests for modules affected by migrated contracts.

## 4. Common API Helper Migration

- [x] 4.1 Move reusable NestJS decorators, guards, request helpers, and metadata constants into the selected common API library.
- [x] 4.2 Move reusable service utilities only when they do not depend on feature-module services or repositories.
- [x] 4.3 Update API modules and tests to import migrated helpers through public library entrypoints.
- [x] 4.4 Run focused tests for auth, RBAC, and protected-route behavior.

## 5. Boundary Cleanup

- [x] 5.1 Remove obsolete module-local files or barrels after all consumers use shared library entrypoints.
- [x] 5.2 Verify shared libraries do not import from `apps/api/src/app/**` or from private `src/lib/**` paths in other libraries.
- [x] 5.3 Verify the internal dependency graph remains acyclic and layered.

## 6. Verification

- [x] 6.1 Run API typecheck and lint targets.
- [x] 6.2 Run API unit tests and affected library tests.
- [x] 6.3 Confirm validation outcomes, guard outcomes, and REST response contracts remain unchanged.
- [x] 6.4 Document any intentionally deferred module-private candidates that were not moved.
