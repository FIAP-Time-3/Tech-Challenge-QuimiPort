# QuimiPort Frontend

Aplicação web do QuimiPort, criada com React, Vite e TypeScript.

## Requisitos

- Node.js 24 (versão indicada no arquivo `../.nvmrc`)
- npm

## Instalação e execução

Na pasta `frontend/`:

```bash
npm install
cp .env.example .env
npm run dev
```

Os dados de demonstração ficam em `src/infrastructure/mocks`. O login e os
serviços de cargas usam esses mocks. A página pública `/health` consulta a API
por meio do cliente Axios em `src/infrastructure/backend/api.ts`.

O arquivo `.env` configura a API local em `http://localhost:3010/api`. Para
usar outro endereço, altere `VITE_API_URL` e reinicie o servidor do Vite.

O Vite informa no terminal o endereço local da aplicação.

## Execução com Docker

Na raiz do repositório, crie o arquivo de ambiente da API e suba os serviços:

```bash
cp backend/.env.docker.example backend/.env.docker
docker compose up -d --build
```

O frontend fica em http://localhost:8080. O Nginx serve a aplicação, permite
acessar diretamente as rotas do React e encaminha `/api/` para a API.
Na imagem Docker, `VITE_API_URL` é definida como `/api` durante o build.

## Verificações locais e CI

```bash
npm run build
npm run lint
npm run typecheck
npm run format:check
```

## Interface

React Router está configurado em modo SPA/declarativo. Tailwind CSS v4 e shadcn/ui estão inicializados com o preset Nova e primitives Radix. Para adicionar um componente shadcn futuramente, execute `npx shadcn add <componente>` nesta pasta.
