# Delivery Checklist

## Back-end

- [x] Deve ser possível criar um link
- [x] Não deve ser possível criar um link com URL encurtada mal formatada
- [x] Não deve ser possível criar um link com URL encurtada já existente
- [x] Deve ser possível deletar um link
- [x] Deve ser possível obter a URL original por meio de uma URL encurtada
- [x] Deve ser possível listar todas as URL's cadastradas
- [x] Deve ser possível incrementar a quantidade de acessos de um link
- [x] Deve ser possível exportar os links criados em um CSV
- [x] Deve ser possível acessar o CSV por meio de CDN (Supabase Storage signed URL)
- [x] Deve ser gerado um nome aleatório e único para o arquivo
- [x] Deve ser possível realizar a listagem de forma performática
- [x] O CSV possui URL original, URL encurtada, contagem de acessos e data de criação

## Front-end

- [x] Deve ser possível criar um link
- [x] Não deve ser possível criar um link com encurtamento mal formatado
- [x] Não deve ser possível criar um link com encurtamento já existente
- [x] Deve ser possível deletar um link
- [x] Deve ser possível obter a URL original por meio do encurtamento
- [x] Deve ser possível listar todas as URL's cadastradas
- [x] Deve ser possível incrementar a quantidade de acessos de um link
- [x] Deve ser possível baixar um CSV com o relatório dos links criados
- [x] SPA React obrigatória usando Vite
- [x] UX com empty/loading/ações bloqueadas por estado
- [x] Responsivo para desktop e mobile

## Roteiro de commits sugerido

1. `chore(init): scaffold monorepo server/web com base de tooling`
2. `feat(server-core): domain + repositories + use cases de links`
3. `feat(server-http): rotas Fastify, validações, erros e CORS`
4. `feat(server-report): export CSV performático + Supabase Storage signed URL`
5. `feat(server-iac): Pulumi para projeto Supabase e settings`
6. `feat(web-core): SPA React/Vite, rotas e cliente HTTP`
7. `feat(web-links): fluxos completos de links e relatório CSV`
8. `test: cobertura backend/frontend e ajustes finais de aceite`
9. `docs: setup, envs, execução local e deploy`
