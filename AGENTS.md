# Codex Review Policy

This repository is configured for automatic Codex review on pull requests.

## Priority Levels

- `P0`: security defects, data loss risk, broken authentication/authorization, CI blockers.
- `P1`: functional regressions, contract incompatibilities, migration risks.
- `P2`: maintainability gaps, performance concerns, missing edge-case tests.
- `P3`: style/readability suggestions.

## Required Review Focus

- API correctness (`server` routes, validation, status codes, payloads).
- Database safety (schema/migrations, query behavior, data integrity).
- Frontend behavior (loading/empty/error states, route flows, accessibility basics).
- Infrastructure and secrets hygiene (`server/infra`, env usage, no secret leaks).
- Test coverage on modified behavior.

## Review Expectations

- Flag objective defects before stylistic feedback.
- Include reproduction path and concrete fix direction when possible.
- Treat breaking changes and missing tests as high-priority findings.
