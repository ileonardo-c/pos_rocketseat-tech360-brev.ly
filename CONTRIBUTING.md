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
