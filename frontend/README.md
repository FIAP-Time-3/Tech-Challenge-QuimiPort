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

Os dados de demonstração ficam em `src/infrastructure/mocks`. O login e os
serviços de cargas usam esses mocks; nenhuma chamada ao backend é feita neste
momento.

O cliente Axios para a futura integração com o backend está em
`src/infrastructure/backend/api.ts`. Configure `VITE_API_URL` no ambiente
quando for habilitar chamadas reais; os serviços de cargas continuam usando
os mocks até essa integração.

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
