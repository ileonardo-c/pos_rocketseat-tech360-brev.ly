# Pulumi Supabase Infra

Infraestrutura para provisionar projeto Supabase com Pulumi.

## Pré-requisitos

- Pulumi CLI instalado.
- Token da API Supabase configurado (ex.: `SUPABASE_ACCESS_TOKEN`).
- Organização Supabase disponível: `kfbynqebumqgqhaudibk` (`iLine < web-developer />`).

## Passos

1. Gerar SDK Pulumi do provider Supabase:

```bash
pnpm run prepare:supabase-sdk
```

2. Instalar dependências:

```bash
pnpm install
```

3. Inicializar stack e configurar secrets:

```bash
pulumi stack init dev
pulumi config set organizationId <org-slug>
pulumi config set projectName brevly
pulumi config set region us-east-1
pulumi config set --secret databasePassword <strong-password>
```

4. Validar e provisionar:

```bash
pulumi preview
pulumi up
```

## Outputs esperados

- `supabaseProjectRef`
- `supabaseUrl`
- `supabaseDbPooler`
- `supabaseAnonKey` (secret)
- `supabaseServiceRoleKey` (secret)

## Observação de Segurança

- Não versionar `.env` com valores reais.
- Manter chaves de provisionamento apenas em Pulumi secrets.
