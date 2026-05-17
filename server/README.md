# Server

API de encurtamento de links com TypeScript, Fastify, Drizzle e Postgres (Supabase).

## Arquitetura

- `src/domain`: entidades e regras básicas.
- `src/application/use-cases`: composables de casos de uso.
- `src/application/repositories`: contratos (Repository Pattern).
- `src/infra`: banco, storage, HTTP e implementações concretas.

## Executar local

1. Copiar `.env.example` para `.env` e preencher valores.
2. Instalar dependências:

```bash
pnpm install
```

3. Rodar migrations:

```bash
pnpm db:migrate
```

4. Subir API:

```bash
pnpm dev
```

## Endpoints

- `POST /urls`
- `DELETE /urls/:shortUrl`
- `GET /urls/:shortUrl`
- `GET /urls`
- `POST /urls/:shortUrl/increment`
- `GET /urls/report`

## Pulumi + Supabase

A infraestrutura está em `server/infra`.

Fluxo:

1. Em `server/infra`, executar `pnpm run prepare:supabase-sdk` (gera `@pulumi/supabase`).
2. Configurar secrets/config do stack Pulumi.
3. `pulumi preview` para validar.
4. `pulumi up` para provisionar projeto e settings.
5. Usar outputs para preencher `.env` e rodar migrations.

## Variáveis de Ambiente

Runtime da API (`server/.env`):

- `DATABASE_URL`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_STORAGE_BUCKET`
- `REPORT_SIGNED_URL_EXPIRES_IN_SECONDS`

Provisionamento (`server/infra` via Pulumi config/secrets):

- `organizationId`
- `projectName`
- `region`
- `databasePassword` (secret)
