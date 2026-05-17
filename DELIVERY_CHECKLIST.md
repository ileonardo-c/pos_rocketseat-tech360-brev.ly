# Delivery Checklist

## Back-end

- [x] Criar link
- [x] Bloquear slug mal formatado
- [x] Bloquear slug duplicado
- [x] Deletar link
- [x] Resolver URL original por slug
- [x] Listar links
- [x] Incrementar contagem de acesso
- [x] Exportar CSV
- [x] Disponibilizar CSV por URL assinada
- [x] Gerar nome único para arquivo de relatório
- [x] Listagem performática
- [x] CSV com `original_url`, `short_url`, `access_count`, `created_at`

## Front-end

- [x] Criar link
- [x] Validar encurtamento mal formatado
- [x] Tratar duplicidade de encurtamento
- [x] Deletar link
- [x] Resolver URL por slug
- [x] Listar links
- [x] Incrementar acesso no fluxo de redirecionamento
- [x] Baixar CSV
- [x] SPA com React + Vite
- [x] UX com empty/loading/error/disabled states
- [x] Responsividade desktop e mobile

## Evidências de validação

- [x] `pnpm run lint`
- [x] `pnpm run typecheck`
- [x] `pnpm run test`
- [x] `pnpm run build`
- [x] `pnpm run dev:docker`
- [x] `GET /health = 200`
- [x] `pnpm run e2e`
- [x] `pnpm run e2e:proof`
