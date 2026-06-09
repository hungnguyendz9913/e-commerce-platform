# OpenSpec Agent Guide

This repository uses OpenSpec to keep AI-assisted implementation aligned with the documented e-commerce platform scope.

## Required Reading

Before making behavior-changing code changes, read:

- `openspec/project.md`
- Relevant files under `openspec/context/`
- Relevant capability specs under `openspec/specs/`
- Any active change under `openspec/changes/`
- Source documents in `docs/` when clarification is needed

## Process

For non-trivial changes, create an OpenSpec proposal before implementation:

1. Write `proposal.md`, `design.md`, `tasks.md`, and spec deltas under `openspec/changes/<change-id>/`.
2. Validate the change with `openspec validate --strict` when the CLI is available.
3. Implement only the approved scope.
4. Update tests and specs with behavior changes.
5. Archive completed changes after implementation and validation.

## Implementation Rules

- Do not invent scope outside the project docs or approved OpenSpec changes.
- Preserve the Nx monorepo structure and dependency boundaries.
- Keep REST response and error formats consistent with `docs/api_documentation.md`.
- Enforce RBAC and customer ownership checks for protected resources.
- Never expose secrets, payment credentials, hashes, or raw tokens to the frontend.
- Treat checkout, order creation, and stock deduction as transactional and concurrency-sensitive.
- Verify payment webhook signatures and process webhook events idempotently.
- Do not modify application source code when the task is OpenSpec setup only.
