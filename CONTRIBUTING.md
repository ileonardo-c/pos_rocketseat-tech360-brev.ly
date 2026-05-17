# Contributing

## Branch Naming

- `feature/<short-description>`
- `fix/<short-description>`
- `chore/<short-description>`

## Local Quality Gate

Run before opening a PR:

```bash
pnpm run lint
pnpm run test
pnpm run build
```

## Pull Request

- Keep PRs focused and small.
- Use the PR template checklist.
- If touching `server/infra`, update docs and config instructions.
