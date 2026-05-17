# Codex Review Policy

This repository is configured for automatic Codex review on pull requests.

## Repository Structure

- `server`: Fastify API, Drizzle ORM, Postgres, Supabase Storage and Pulumi infrastructure.
- `web`: React SPA with Vite.
- `.github`: CI, PR template and governance automation.

## Monorepo Review Scope

- Changes under `server/**` must be reviewed as API, database, storage, CSV export, migrations, Docker and Pulumi infrastructure.
- Changes under `web/**` must be reviewed as React SPA, routing, API integration, UX states and responsive behavior.
- Changes under `.github/**` must be reviewed as CI, PR governance, repository automation and quality gates.
- Cross-folder changes must be reviewed for contract compatibility between `server` and `web`.

## Priority Levels

- `P0`: security defects, data loss risk, secret leaks, broken CI, destructive migrations.
- `P1`: functional regressions, API/web contract breaks, wrong status codes, broken CSV export, broken redirect flow.
- `P2`: maintainability gaps, performance concerns, missing edge-case tests, weak validation.
- `P3`: style/readability suggestions.

## Required Review Focus

### Server

Review:

- Fastify routes.
- Request/response validation.
- Status codes.
- Error payload consistency.
- Drizzle schema and migrations.
- Postgres indexes and constraints.
- CSV generation.
- Supabase Storage upload/public URL.
- Dockerfile.
- Pulumi infrastructure.
- `.env.example`.

### Web

Review:

- React SPA routing.
- API integration.
- Form validation.
- Loading, empty and error states.
- Disabled states during async actions.
- Responsive behavior.
- CSV download flow.
- Not found and redirect pages.
- `.env.example`.

### GitHub

Review:

- CI coverage for `server` and `web`.
- PR template quality.
- No secret leakage.
- Governance automation.

## Challenge Requirements

The review must map changes to the mandatory challenge checklist.

### Server Requirements

- Create link.
- Reject malformed short URL.
- Reject duplicated short URL.
- Delete link.
- Resolve original URL by short URL.
- List all links.
- Increment access count.
- Export links as CSV.
- Make CSV accessible through public storage/CDN URL.
- Generate random unique CSV filename.
- Keep listing performant.
- CSV must include original URL, short URL, access count and creation date.

### Web Requirements

- Create link.
- Reject malformed short URL.
- Show duplicated short URL error.
- Delete link.
- Resolve original URL by short URL.
- List links.
- Increment access count.
- Download CSV report.
- Preserve React SPA + Vite requirement.
- Preserve loading, empty, error and disabled states.
- Preserve responsive desktop/mobile behavior.

## Review Expectations

- Flag objective defects before stylistic feedback.
- Include reproduction path and concrete fix direction when possible.
- Treat breaking changes and missing tests as high-priority findings.
- When a PR changes both `server` and `web`, verify API contract compatibility.
- When a PR changes database schema, verify migrations, indexes and rollback/data-risk concerns.
- When a PR changes storage/export behavior, verify file uniqueness, public URL and CSV fields.
