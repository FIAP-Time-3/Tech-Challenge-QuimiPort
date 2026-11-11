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

Para configurar a URL da API, copie `.env.example` para `.env.local` e ajuste
`VITE_API_URL`:

```env
VITE_API_URL=http://localhost:3000/api
```

O cliente Axios centralizado está em `src/lib/api.ts`. Ele envia o access token
como `Bearer` automaticamente e redireciona para `/login` se a API responder
com `401`. As chamadas tipadas de cargas estão em `src/services/cargas.ts`.

Exemplo de uso em uma página ou componente:

```ts
import { listarCargas } from '@/services/cargas';

const cargas = await listarCargas();
```

O login atual é demonstrativo e gera um token fake; portanto, chamadas à API
que exigem um JWT real só funcionarão depois da integração com o endpoint de
autenticação do backend.

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
