# Server

API de encurtamento com Fastify + Drizzle + Postgres.

## Arquitetura

- `src/lib`: env, db e storage
- `src/models`: acesso a dados
- `src/services`: regras de negócio
- `src/controllers`: adaptação HTTP
- `src/routes`: rotas Fastify
- `src/http`: bootstrap da aplicação

## Endpoints

- `GET /health`
- `POST /urls`
- `GET /urls`
- `GET /urls/:shortUrl`
- `DELETE /urls/:shortUrl`
- `POST /urls/:shortUrl/increment`
- `GET /urls/report`

## Contrato de erro

- `400`: `{ message, field? }`
- `404`: `{ message }`
- `409`: `{ message, field? }`
- `500`: `{ message }`

## Execução

Use o passo a passo principal no README raiz.

Configurar env:

```bash
cp server/.env.example server/.env
```

Comandos isolados do pacote:

```bash
pnpm --dir server run db:migrate
pnpm --dir server run dev
pnpm --dir server run test
```
