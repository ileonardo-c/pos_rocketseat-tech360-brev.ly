# Server

API de encurtamento de links com TypeScript, Fastify, Drizzle e Postgres (Supabase).

## Arquitetura

- `src/domain`: entidades e regras básicas.
- `src/application/use-cases`: composables de casos de uso.
- `src/application/repositories`: contratos (Repository Pattern).
- `src/infra`: banco, storage, HTTP e implementações concretas.

## Endpoints

- `GET /health`
- `POST /urls`
- `DELETE /urls/:shortUrl`
- `GET /urls/:shortUrl`
- `GET /urls`
- `POST /urls/:shortUrl/increment`
- `GET /urls/report`

## Variáveis de ambiente

Runtime da API (`server/.env`):

- `NODE_ENV`
- `PORT`
- `CORS_ORIGIN`
- `DATABASE_URL`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_STORAGE_BUCKET`
- `FILE_STORAGE_DRIVER` (`supabase` ou `memory`)
- `REPORT_SIGNED_URL_EXPIRES_IN_SECONDS`

## Execução local

1. Copiar `.env.example` para `.env`.
2. Instalar dependências:

```bash
pnpm install
```

3. Aplicar migrations:

```bash
pnpm db:migrate
```

4. Subir API:

```bash
pnpm dev
```

## Pulumi + Supabase

A infraestrutura está em `server/infra`.

Fluxo:

1. Provisionar projeto/outputs com Pulumi.
2. Popular `.env` do runtime com outputs necessários.
3. Executar migrations.
4. Validar fluxos HTTP e export CSV.
