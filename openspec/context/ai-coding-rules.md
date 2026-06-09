# AI Coding Rules

- Do not invent scope outside the project docs or approved OpenSpec changes.
- Read relevant OpenSpec context and specs before coding.
- Keep API response and error formats consistent with `docs/api_documentation.md`.
- Use REST JSON contracts unless an approved change says otherwise.
- Enforce RBAC on protected customer, admin, and gateway routes.
- Enforce ownership checks for customer resources such as profile, addresses, cart, orders, and payments.
- Never expose secrets to the frontend.
- Never return password hashes, refresh token hashes, payment secrets, raw provider secrets, or private credentials in API responses.
- Never trust a client-side payment result.
- Verify payment status through the provider or verified webhook before updating order/payment state.
- Checkout must be transactional and concurrency-safe.
- Stock deduction must prevent negative stock and overselling.
- Payment webhooks must verify signature and be idempotent.
- Use database constraints and transactions for critical integrity, not only application checks.
- Keep Nx project boundaries and avoid circular dependencies.
- Prefer shared types/DTOs where they reduce contract drift.
- Update OpenSpec specs and tests with behavior changes.
- Do not modify generated files unless the project workflow requires regeneration.
- Keep application source changes out of OpenSpec-only setup tasks.

## Commit Discipline

The AI agent MUST create small atomic commits.

Rules:
- After each completed logical change, create a git commit before starting the next logical change.
- A logical change means one focused unit of work, such as:
  - create/update OpenSpec proposal files
  - add DTOs
  - add database/repository logic
  - add service logic
  - add controller endpoints
  - add tests
  - fix lint/type errors
  - update documentation
- Do not mix unrelated changes in the same commit.
- Do not leave many unrelated files staged together.
- Before each commit, run the smallest relevant validation command:
  - formatting/lint for touched files if available
  - unit test for touched module if available
  - typecheck/build if the change affects shared types or public API
- If validation cannot be run, mention why in the commit summary or final report.
- Use Conventional Commit style:
  - feat(auth): add refresh token rotation
  - fix(auth): reject revoked sessions
  - test(auth): cover password reset flow
  - docs(openspec): add auth baseline change
  - chore(repo): add project scripts
- Every commit message must describe the actual completed change.
- Never commit secrets, `.env`, generated local caches, node_modules, or temporary files.