# Pulumi + Supabase (server/infra)

Infraestrutura para provisionar projeto Supabase com Pulumi.

## Pré-requisitos

- Pulumi CLI instalado.
- Backend Pulumi local autenticado: `pulumi login --local`.
- `PULUMI_CONFIG_PASSPHRASE` configurado na sessão.
- Token da API Supabase configurado em ambiente (`SUPABASE_ACCESS_TOKEN`).
- Organização Supabase disponível.

## Variáveis de provisionamento (Pulumi config/secrets)

- `organizationId`
- `projectName`
- `region`
- `existingProjectRef` (opcional, recomendado para adoção de projeto já existente)
- `databasePassword` (secret, obrigatório apenas no modo de criação)

## Fluxo de provisionamento

1. Em `server/infra`, gerar SDK do provider Supabase:

```bash
pnpm run prepare:supabase-sdk
```

2. Instalar dependências do pacote `server/infra`:

```bash
pnpm install
```

3. Garantir instalação de pacotes/plugins Pulumi locais:

```bash
pulumi install
```

4. Inicializar ou selecionar stack:

```bash
pulumi stack select dev
# se não existir:
pulumi stack init dev
```

5. Configurar parâmetros:

```bash
pulumi config set organizationId kfbynqebumqgqhaudibk
pulumi config set projectName brevly-tech360
pulumi config set region sa-east-1
pulumi config set existingProjectRef pvbrmtzoyaugpwnqiajn
```

> Se você não for adotar projeto existente (`existingProjectRef`), defina também:
>
> ```bash
> pulumi config set --secret databasePassword <strong-password>
> ```

6. Validar plano:

```bash
pulumi preview
```

7. Provisionar:

```bash
pulumi up
```

## Outputs esperados

- `supabaseProjectRef`
- `supabaseRegion`
- `supabaseProjectMode`
- `supabaseDbPooler`
- `supabaseUrl`
- `supabaseAnonKey` (secret)
- `supabaseServiceRoleKey` (secret)
- `appliedSettingsId`

## Fluxo operacional com plugin Supabase

Sequência recomendada para criação de projeto via app/plugin:

1. `_list_organizations`
2. `_get_cost` (`type=project`)
3. `_confirm_cost`
4. `_create_project`
5. `_get_project` (polling até status pronto)

Depois disso:

1. aplicar `pulumi up` para alinhar settings/outputs;
2. preencher runtime da API em `server/.env`;
3. rodar migrations (`pnpm db:migrate` em `server`).

## Separação de escopos

- Runtime API: `server/.env`.
- Provisionamento infra: Pulumi config/secrets em `server/infra`.

## Segurança

- Nunca versionar `.env` real.
- Chaves sensíveis devem permanecer em secrets do Pulumi.
