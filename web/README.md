# Web

SPA React + Vite para gerenciamento de links encurtados.

## Requisitos

- Node.js 22+
- pnpm 11+

## Configuração

1. Copie `.env.example` para `.env`.
2. Ajuste:
   - `VITE_API_BASE_URL`
   - `VITE_SHORT_BASE_URL`

## Desenvolvimento local

```bash
pnpm dev
```

## Build e testes

```bash
pnpm run typecheck
pnpm run lint
pnpm run test
pnpm run build
```

## Rotas

- `/`: cadastro, listagem, exclusão e export CSV.
- `/:slug`: resolve URL, incrementa acesso e redireciona.
- fallback: not-found.
