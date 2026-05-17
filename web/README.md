# Web

SPA React + Vite para gerenciar links encurtados.

## Rotas

- `/`: cadastro, listagem, exclusão e exportação CSV
- `/:slug`: resolve URL, incrementa acesso e redireciona
- fallback: not-found

## Execução

Use o fluxo completo no README raiz.

Configurar env:

```bash
cp web/.env.example web/.env
```

Comandos isolados do pacote:

```bash
pnpm --dir web run dev
pnpm --dir web run test
pnpm --dir web run e2e
pnpm --dir web run e2e:proof
```

## Figma

Referência oficial:

- [Encurtador de Links Community](https://www.figma.com/design/3O7bnkkv74PALd0cLE66pN/Encurtador-de-Links--Community-?node-id=0-1&p=f&t=iNZOY50CrBVdEHrs-0)
