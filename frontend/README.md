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

As telas usam a API por meio das rotas e dos DTOs em
`src/infrastructure/backend`. O login carrega o usuário em `/me`; o refresh
renova os tokens e atualiza esse perfil. Sem administrador ativo, `/login`
apresenta o formulário de configuração inicial. A página `/health` é pública.

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

## Convenções do código

- Componentes e páginas: `PascalCase.tsx`, como `ProdutoQuimicoForm.tsx`.
- Hooks: `useNome.ts`, na pasta `hooks`, como `useCurrentUser.ts`.
- Serviços: `camelCase.service.ts`; armazenamento: `camelCase.storage.ts`.
- Rotas da API: `camelCase.routes.ts`; contratos: `camelCase.dtos.ts`.
- Modelos: `camelCase.ts`. Use o nome do domínio do backend, como
  `produtoQuimico`, `cargaQuimica` e `user`.
- Casos de uso: um arquivo por ação, com o mesmo nome da função exportada,
  como `criarProdutoQuimico.ts`. As ações dos domínios em português seguem
  essa nomenclatura; contratos HTTP mantêm os nomes exigidos pelo backend.
- Os imports devem respeitar exatamente as letras maiúsculas e minúsculas
  do arquivo. As quebras de linha seguem o `.gitattributes` da raiz.

As rotas autenticadas ficam sob `ProtectedRoute` e `AppLayout` em `App.tsx`.
O layout fornece sidebar, header, rodapé e `MainContent`. Cada página usa
`Title` para o título, descrição e ações, sem duplicar a estrutura do layout.
Os estados de carregamento, erro e lista vazia devem ser apresentados
separadamente; navegue após uma alteração somente quando a API confirmar
seu sucesso.

Ao gerar componentes de UI, ajuste os nomes dos arquivos e imports ao padrão
`PascalCase` adotado no projeto.
