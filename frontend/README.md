# QuimiPort Frontend

Aplicação web do QuimiPort, criada com React, Vite e TypeScript.

## Requisitos

- Node.js 24 (versão indicada no arquivo `../.nvmrc`)
- npm

## Instalação e execução

Na pasta `frontend/`:

```bash
npm install
npm run dev
```

O Vite informa no terminal o endereço local da aplicação.

## Verificações

```bash
npm run build
npm run lint
npm run typecheck
npm run format:check
```

## Interface

React Router está configurado em modo SPA/declarativo. Tailwind CSS v4 e shadcn/ui estão inicializados com o preset Nova e primitives Radix. Para adicionar um componente shadcn futuramente, execute `npx shadcn add <componente>` nesta pasta.
