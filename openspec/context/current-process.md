# Current Process

## Document-driven Process

The project source documents define the expected development flow:

1. SRS defines scope, actors, functional requirements, non-functional requirements, and acceptance criteria.
2. Use Case Specification describes actor workflows and alternate flows.
3. Software Design Document maps requirements to architecture, modules, layers, API style, event flow, security, testing, and deployment.
4. ERD defines relational entities, constraints, indexes, and data integrity rules.
5. API Documentation defines REST endpoint contracts, response formats, error formats, access levels, DTOs, and E2E API scenarios.
6. Implementation follows the approved documents and active OpenSpec changes.
7. Tests verify unit logic, API behavior, and Playwright E2E user flows.
8. Deployment uses documented environment, Docker, and CI/CD expectations.

## OpenSpec Process

For non-trivial changes:

1. Create a change under `openspec/changes/<change-id>/`.
2. Write `proposal.md` with motivation, scope, and out-of-scope items.
3. Write `design.md` for architecture, API, data, security, and test decisions.
4. Write `tasks.md` as an implementation checklist.
5. Add spec deltas under `specs/<capability>/spec.md`.
6. Validate with `openspec validate --strict` when the CLI is available.
7. Implement only the approved change.
8. Add or update tests.
9. Validate through OpenSpec, Nx tests, linting, and relevant E2E runs.
10. Archive completed changes after implementation.
