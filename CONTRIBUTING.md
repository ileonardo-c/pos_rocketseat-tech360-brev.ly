# Contributing

## Branch naming

- `feature/<short-description>`
- `fix/<short-description>`
- `chore/<short-description>`

## Local quality gate

Execute antes de abrir PR:

```bash
pnpm run lint
pnpm run typecheck
pnpm run test
pnpm run build
```

## Pull request

- PR pequeno e focado.
- Preencher checklist do template.
- Se alterar contrato API/Web, atualizar testes e documentação.

## Review automatizado por agente

- O review por agente (Copilot/Codex) é obrigatório como suporte técnico de qualidade.
- Comentários do agente devem ser analisados e resolvidos ou justificados no PR.
- O agente não substitui a aprovação formal definida na branch protection.

Checklist mínimo para merge:

- Checks obrigatórios verdes (`server` e `web`).
- Threads de review resolvidas.
- Validação final do maintainer humano.
