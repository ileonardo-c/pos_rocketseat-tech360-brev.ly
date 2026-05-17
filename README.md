# Brevly Monorepo

Projeto fullstack para encurtamento de links com foco em simplicidade, organização e entrega orientada ao desafio.

## Estrutura

- `server`: API Fastify + Drizzle + Postgres + Supabase Storage + Pulumi.
- `web`: SPA React + Vite.
- `.github`: CI, template de PR e automações de governança.

## Setup

```bash
pnpm run init
```

## Desenvolvimento local

```bash
pnpm dev
```

## Qualidade

```bash
pnpm run typecheck
pnpm run lint
pnpm run test
pnpm run build
```

## Docker full-stack (local)

```bash
pnpm run dev:docker
```

Serviços esperados:

- API: `http://localhost:3333`
- Health API: `http://localhost:3333/health`
- Web: `http://localhost:5173`
- Postgres: `localhost:5432`

Parar stack:

```bash
pnpm run down:docker
```

## Smoke E2E (Playwright)

Pré-requisito: stack local ativa.

```bash
pnpm run e2e:install
pnpm run e2e
```

## Governança de repositório

- CI obrigatório com checks estáveis: `server`, `web`.
- `CODEOWNERS` ativo.
- Template de PR com checklist obrigatório do desafio.
- Política de review do Codex em `AGENTS.md`.

## Supabase + Pulumi

Fluxo operacional em `server/infra/README.md`.
