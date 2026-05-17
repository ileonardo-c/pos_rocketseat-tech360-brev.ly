# Brevly Monorepo

Projeto fullstack de encurtamento de links com foco no desafio técnico.

## O que precisa para rodar

- Node.js `22.x`
- pnpm `11.x`
- Docker Desktop em execução
- Portas livres: `3333`, `5173`, `9000`, `9001`

## Estrutura

- `server`: API Fastify + Drizzle + Postgres + S3 compatível (MinIO local)
- `web`: SPA React + Vite
- `.github`: CI e governança

## Setup inicial

```bash
pnpm run init
```

## Fluxo recomendado (Docker + Playwright no host)

1. Subir stack local (deixe o terminal aberto):

```bash
pnpm run dev:docker
```

2. Em um novo terminal, validar API:

```bash
curl http://localhost:3333/health
```

Resposta esperada: `200` com `{"status":"ok"}`.

3. Instalar navegador do Playwright (uma vez por máquina):

```bash
pnpm run e2e:install
```

4. Rodar smoke E2E:

```bash
pnpm run e2e
```

5. Rodar prova visual (smoke + screenshots):

```bash
pnpm run e2e:proof
```

6. Validar artefatos:

- `web/playwright-report`
- `web/test-results/evidence`
- `web/test-results`

7. Encerrar stack local:

```bash
pnpm run down:docker
```

## Fluxo alternativo (sem Docker)

Use apenas se quiser subir os processos manualmente.

1. Configurar envs:

```bash
cp server/.env.example server/.env
cp web/.env.example web/.env
```

2. Subir dependências locais (Postgres + MinIO) fora do projeto.

3. Aplicar migration e subir apps:

```bash
pnpm --dir server run db:migrate
pnpm --dir server run dev
pnpm --dir web run dev
```

4. Rodar E2E:

```bash
pnpm run e2e
pnpm run e2e:proof
```

## Diferença entre comandos E2E

- `pnpm run e2e`: smoke funcional principal.
- `pnpm run e2e:proof`: smoke funcional + capturas de evidência.
- `pnpm --filter web run e2e:visual`: comparação visual com baseline do Figma.

## Qualidade do projeto

```bash
pnpm run lint
pnpm run typecheck
pnpm run test
pnpm run build
```

## Documentação por pacote

- API: [server/README.md](server/README.md)
- Frontend: [web/README.md](web/README.md)

## Referências do desafio

- Figma: [1477335071553579816](https://www.figma.com/community/file/1477335071553579816)
- YouTube: [asZn42mUOmw](https://www.youtube.com/watch?v=asZn42mUOmw)

## Licença

MIT. Veja [LICENSE](LICENSE).
