## Why

Reusable backend code is currently split between API module folders and broad shared libraries, which makes cross-module reuse inconsistent as product, auth, user, and future commerce modules grow. This change establishes clearer Nx library boundaries for API-facing DTOs, validation schemas, domain types, constants, guards/helpers, and reusable service utilities before more modules duplicate the same patterns.

## What Changes

- Add a shared API library structure for reusable backend contracts and utilities.
- Move reusable API DTOs, validation schemas, domain types, constants, guards/decorators/helpers, and service utilities out of `apps/api` module folders when they are used by more than one module or are intended as cross-module API contracts.
- Keep module-specific controllers, orchestration services, repositories, and private DTOs inside their owning API modules.
- Update imports, path aliases, lint boundaries, and tests to use the shared API libraries.
- Preserve the existing REST JSON behavior, validation semantics, RBAC behavior, and public route contracts.

## Capabilities

### New Capabilities

- `api-shared-libraries`: Defines how reusable API code is organized into Nx libraries and consumed by backend modules.

### Modified Capabilities

None.

## Impact

- Affected code: `apps/api/src/app/**`, `libs/shared/types`, `libs/shared/utils`, and any new `libs/**` projects created for API contracts/utilities.
- Affected tooling: Nx project configuration, TypeScript path aliases, ESLint module-boundary rules, Jest config, and affected API unit tests.
- APIs: No intended HTTP contract changes; request/response shapes, validation behavior, guards, and error behavior must remain compatible.
- Dependencies: May introduce new internal library dependencies between API modules and shared libraries, but should not add external runtime packages unless already justified by existing code patterns.
