# Brevly Monorepo

Projeto fullstack para encurtamento de links, com foco em simplicidade, organização e deploy com Supabase + Pulumi.

## Estrutura

- `server`: API Fastify + Drizzle + Postgres + Supabase Storage + Pulumi.
- `web`: SPA React + Vite.
- `.github`: CI, template de PR e automações de governança.

## Como iniciar (`/init`)

```bash
pnpm run init
```

O script `init` instala dependências do monorepo.

## Desenvolvimento

```bash
pnpm dev
```

## Build e testes

```bash
pnpm build
pnpm test
```

## Arquitetura (server)

- Composables como Use Cases.
- Repository Pattern.
- Infra desacoplada para banco, HTTP e storage.

## Governança de Repositório

- CI obrigatório em PR/push com checks estáveis: `lint`, `test`, `build`.
- `CODEOWNERS` configurado para revisão do owner.
- Template de PR e guia de contribuição ativos.
- Política de revisão automática do Codex descrita em `AGENTS.md`.

## Publicação GitHub

Siga o runbook em `.github/REPOSITORY_SETUP.md` para:

- criar o repositório `pos_rocketseat-tech360-brev.ly` (privado);
- aplicar políticas de merge/branch protection;
- habilitar auto-review do Codex no repositório;
- publicar e abrir PR de validação inicial.
