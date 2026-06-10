# API Shared Libraries Specification

## Purpose

Define how reusable backend API code is organized into Nx libraries and consumed by API modules.

## Requirements

### Requirement: Reusable API code lives in Nx libraries

The system SHALL place reusable backend API contracts, validation helpers, domain types, constants, guards, decorators, helper functions, and service utilities in Nx libraries instead of duplicating them across API modules.

#### Scenario: Shared contract is reused by multiple modules

- **WHEN** a DTO, validation schema, enum, domain type, or constant is used by more than one API module
- **THEN** the reusable contract is exported from an appropriate shared Nx library
- **AND** consuming modules import it through that library's public entrypoint.

#### Scenario: Module-private code remains local

- **WHEN** a DTO, helper, or service utility is only meaningful to one API module
- **THEN** the code remains in that module's folder
- **AND** it is not exported as a shared library API.

### Requirement: Shared API libraries expose stable public entrypoints

Shared API libraries SHALL expose reusable code through intentional public entrypoints and SHALL avoid imports from another library's private implementation files.

#### Scenario: Consumer imports shared API code

- **WHEN** an API module consumes shared DTOs, guards, helpers, constants, domain types, or service utilities
- **THEN** the module imports from the owning library package entrypoint
- **AND** it does not import from private `src/lib/**` paths.

#### Scenario: Shared library exports are reviewed

- **WHEN** code is moved into a shared API library
- **THEN** only reusable public symbols are exported from the library index
- **AND** private implementation helpers remain unexported.

### Requirement: API behavior is preserved after extraction

The shared-library refactor SHALL preserve existing REST request/response behavior, validation behavior, authentication behavior, authorization behavior, and error semantics.

#### Scenario: Existing API tests run after migration

- **WHEN** API modules import migrated shared code from Nx libraries
- **THEN** existing API unit tests pass without changing the asserted HTTP contracts, validation outcomes, or guard outcomes.

#### Scenario: Validation rules are migrated

- **WHEN** DTOs or validation helpers are moved from API module folders into shared libraries
- **THEN** their required fields, optional fields, enum values, transformation behavior, and validation messages remain compatible with the previous implementation.

### Requirement: Library dependencies stay acyclic and layered

Shared API libraries SHALL maintain acyclic dependencies and SHALL not depend on feature modules in `apps/api`.

#### Scenario: Shared library depends on another library

- **WHEN** a shared API library requires types or utilities from another internal library
- **THEN** the dependency follows the repository's layering rules
- **AND** the dependency graph remains acyclic.

#### Scenario: Shared library avoids feature-module coupling

- **WHEN** reusable code is placed in a shared API library
- **THEN** it does not import controllers, services, repositories, or module-private files from `apps/api/src/app/**`.
