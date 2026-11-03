# 🖥️ QuimiPort — Backend (API)

> Documentação técnica do backend desenvolvido na **Fase 2** do Tech Challenge da FIAP POSTECH.
> Para o contexto do problema, o domínio, os status e as transições da carga, veja o [README geral do projeto](../README.md).

---

## 📑 Sumário

1. [Descrição e responsabilidades](#-descrição-e-responsabilidades)
2. [Tecnologias e dependências](#-tecnologias-e-dependências)
3. [Pré-requisitos](#-pré-requisitos)
4. [Variáveis de ambiente](#-variáveis-de-ambiente)
5. [Como executar](#-como-executar)
6. [Scripts disponíveis](#-scripts-disponíveis)
7. [Testes automatizados](#-testes-automatizados)
8. [Banco de dados](#-banco-de-dados)
9. [Estrutura interna de pastas](#-estrutura-interna-de-pastas)
10. [Organização arquitetural e módulos](#-organização-arquitetural-e-módulos)
11. [Documentação da API e endpoints](#-documentação-da-api-e-endpoints)
12. [Autenticação e autorização](#-autenticação-e-autorização)
13. [Regras de negócio aplicadas pela API](#-regras-de-negócio-aplicadas-pela-api)
14. [Logs](#-logs)
15. [CI/CD](#-cicd)
16. [Decisões arquiteturais](#-decisões-arquiteturais)
17. [Convenções para desenvolvimento](#-convenções-para-desenvolvimento)
18. [Solução de problemas](#-solução-de-problemas)

---

## 📋 Descrição e responsabilidades

O backend é uma **API REST** que implementa o núcleo do QuimiPort:

- **Produtos químicos:** cadastro, consulta, atualização, inativação e exclusão.
- **Cargas químicas:** registro, consulta, atualização de dados e controle do ciclo de vida por uma **máquina de estados** (atualizar status, bloquear, liberar e cancelar), com histórico de movimentações.
- **Documentos da carga:** registro e validação dos documentos exigidos para a liberação.
- **Usuários, autenticação e autorização:** login com JWT, perfis de usuário e permissões por rota e por etapa da carga.
- **Persistência** em PostgreSQL, com migrations versionadas.
- **Documentação interativa** (Swagger), **logs** e **testes automatizados**.

---

## 🛠️ Tecnologias e dependências

| Categoria | Tecnologia |
|---|---|
| Runtime | Node.js 24 |
| Linguagem | TypeScript 6 |
| Framework | NestJS 12 (sobre Express 5) |
| Banco de dados | PostgreSQL 18 |
| ORM e migrations | Prisma 7, com o adapter `@prisma/adapter-pg` e o driver `pg` |
| Validação | `class-validator` e `class-transformer` |
| Autenticação | `@nestjs/jwt` e `bcrypt` |
| Documentação da API | `@nestjs/swagger` |
| Configuração | `@nestjs/config` |
| Testes | Vitest 4 (com `@vitest/coverage-v8` e `supertest`) |
| Qualidade de código | ESLint 10 e Prettier |
| Containers | Docker e Docker Compose |
| CI | GitHub Actions |

Dependências de execução: `@nestjs/common`, `@nestjs/core`, `@nestjs/platform-express`, `@nestjs/config`, `@nestjs/jwt`, `@nestjs/swagger`, `@prisma/client`, `@prisma/adapter-pg`, `pg`, `bcrypt`, `class-validator`, `class-transformer`, `reflect-metadata` e `rxjs`. As versões exatas estão em [`package.json`](./package.json) e [`package-lock.json`](./package-lock.json).

---

## ✅ Pré-requisitos

| Ferramenta | Observação |
|---|---|
| **Node.js 24** | Mesma versão usada no Docker e no CI. O arquivo `.nvmrc` (na raiz do repositório) indica a versão; com o nvm, use `nvm use` |
| **npm** | Instalado junto com o Node.js |
| **Git** | Para clonar o repositório |
| **Docker Desktop** | Com Docker Compose. Deve estar **aberto** antes de qualquer comando `docker` |

Portas que precisam estar livres:

| Porta | Uso |
|---|---|
| `5432` | PostgreSQL |
| `3010` | API em execução local |
| `3000` | API em execução no Docker |

> **Alternativa sem Docker para o banco:** se você já tem um PostgreSQL instalado, crie o banco `quimiport` e ajuste as credenciais no `.env`.

---

## 🔐 Variáveis de ambiente

Os modelos ficam em `backend/.env.example` (execução local) e `backend/.env.docker.example` (Docker). Os arquivos reais (`.env` e `.env.docker`) **não são versionados**: crie-os a partir dos modelos.

| Variável | Descrição | Local (`.env`) | Docker (`.env.docker`) |
|---|---|---|---|
| `APP_PORT` | Porta da API | `3010` | ignorada: o compose usa `3000` |
| `SWAGGER_TITLE` | Título exibido no Swagger | texto livre | texto livre |
| `SWAGGER_DESCRIPTION` | Descrição exibida no Swagger | texto livre | texto livre |
| `SWAGGER_VERSION` | Versão exibida no Swagger | `0.1.0` | `0.1.0` |
| `DATABASE_HOSTNAME` | Host do banco | `localhost` | `postgres` |
| `DATABASE_USERNAME` | Usuário do banco | `postgres` | `postgres` |
| `DATABASE_PASSWORD` | Senha do banco | `postgres` | `postgres` |
| `DATABASE_PORT` | Porta do banco | `5432` | `5432` |
| `DATABASE_NAME` | Nome do banco | `quimiport` | `quimiport` |
| `DATABASE_URL` | URL de conexão usada pelo Prisma | host `localhost` | host `postgres` |
| `PASSWORD_SALT` | Valor usado pelo serviço de hash de senhas | conforme o `.env.example` | conforme o `.env.docker.example` |
| `JWT_SECRET` | Segredo usado para assinar os tokens JWT | string longa e aleatória | string longa e aleatória |
| `NODE_TLS_REJECT_UNAUTHORIZED` | Presente nos modelos, para desenvolvimento | `0` | `0` |

Exemplo da `DATABASE_URL` em cada caso:

```text
# .env (API local)
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/quimiport?schema=public

# .env.docker (API no Docker)
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/quimiport?schema=public
```

> A diferença mais importante entre os dois arquivos é o **host do banco**: `localhost` quando a API roda na máquina e `postgres` (nome do serviço) quando roda dentro do Docker. Usar o valor errado é a causa mais comum de erro de conexão.
>
> Nunca versione arquivos `.env` com segredos reais. `NODE_TLS_REJECT_UNAUTHORIZED=0` desativa a verificação de certificados TLS e deve ser usado apenas em desenvolvimento.

---

## 🚀 Como executar

Há duas formas de executar. **Não use as duas ao mesmo tempo**: ambas usam a porta 5432 e o container `quimiport_postgres`.

| Opção | Quando usar |
|---|---|
| **A. Banco no Docker e API local** | Desenvolvimento: a API reinicia sozinha quando o código muda |
| **B. Tudo no Docker** | Executar o projeto empacotado, sem instalar o Node.js |

### Opção A: banco no Docker e API local

**1. Subir o banco** (na **raiz do repositório**)

```bash
docker compose up -d postgres
docker ps      # o container quimiport_postgres deve aparecer ativo
```

O banco `quimiport` é criado automaticamente, com usuário e senha `postgres`.

**2. Criar o `.env`** (em `backend/`)

```bash
cd backend
cp .env.example .env
```

No Windows (prompt de comando), use `copy .env.example .env`. Preencha `DATABASE_PASSWORD`, `PASSWORD_SALT` e `JWT_SECRET` e confira que a `DATABASE_URL` usa o host `localhost` (veja [Variáveis de ambiente](#-variáveis-de-ambiente)).

**3. Instalar as dependências**

```bash
npm install
```

**4. Gerar o Prisma Client e aplicar as migrations**

```bash
npm run prisma:prepare
```

Esse comando executa `prisma generate` (gera o client usado pela API) e `prisma migrate deploy` (cria as tabelas).

**5. Iniciar a API**

```bash
npm run start:dev
```

No VS Code, a tecla **F5** executa o mesmo comando (configuração em `.vscode/launch.json`).

Para uma execução sem recarga automática, use `npm run start`. Para simular produção: `npm run build` seguido de `npm run start:prod`.

**6. Acessar**

| Recurso | URL |
|---|---|
| Swagger | http://localhost:3010/api/api-docs |
| Health check | http://localhost:3010/api/health |

**Para parar:** `Ctrl+C` no terminal da API e, na raiz do repositório, `docker compose down` (os dados do banco permanecem no volume).

### Opção B: tudo no Docker

**1. Criar o `.env.docker`** (a partir da **raiz do repositório**)

```bash
cp backend/.env.docker.example backend/.env.docker
```

No Windows (prompt de comando), use `copy backend\.env.docker.example backend\.env.docker`. Preencha `PASSWORD_SALT` e `JWT_SECRET` e confira que a `DATABASE_URL` usa o host `postgres`.

Esse arquivo é obrigatório: o `docker-compose.yml` o lê (`env_file`) e o `Dockerfile` o copia para dentro da imagem.

**2. Liberar a porta 5432**

Se a Opção A estiver em uso, pare a API e execute `docker compose down`.

**3. Subir a aplicação**

```bash
docker compose up -d --build
```

O que acontece, em ordem:

1. O Docker **constrói a imagem** da API (`.docker/Dockerfile`): instala as dependências, gera o Prisma Client e compila o projeto.
2. O **PostgreSQL** sobe e só é considerado pronto quando o *healthcheck* responde.
3. A **API** inicia depois do banco, **aplica as migrations automaticamente** (`prisma migrate deploy`) e passa a atender na porta 3000.

**4. Acompanhar a inicialização**

```bash
docker compose logs -f api
```

**5. Acessar**

| Recurso | URL |
|---|---|
| Swagger | http://localhost:3000/api/api-docs |
| Health check | http://localhost:3000/api/health |

A porta é **3000**: o `docker-compose.yml` fixa `APP_PORT=3000` e ignora o valor do `.env.docker`.

**6. Atualizações de código:** o código fica dentro da imagem, então é preciso reconstruir com `docker compose up -d --build`.

**Para parar:** `docker compose down`. Para apagar também os dados do banco (recomeçar do zero): `docker compose down -v`.

### Primeiro acesso

Todas as rotas, exceto `POST /api/login`, `POST /api/login/refresh` e o health check, exigem **token JWT**. É necessário, portanto, existir um usuário administrador no banco para autenticar.

> ⚠️ **PENDENTE (remover este aviso depois de preencher):** descrever aqui como o usuário administrador inicial é criado e informar as credenciais de demonstração.

Com o usuário criado:

1. No Swagger, execute `POST /api/login` com `username` e `password`.
2. Copie o `access_token` retornado.
3. Clique em **Authorize**, cole o token e confirme.

---

## 📜 Scripts disponíveis

Executados em `backend/`:

| Script | O que faz |
|---|---|
| `npm run start:dev` | Inicia a API com recarga automática |
| `npm run start` | Inicia a API sem recarga |
| `npm run start:debug` | Inicia a API em modo de depuração |
| `npm run build` | Compila o projeto para `dist/` |
| `npm run start:prod` | Executa a versão compilada (`dist/main`) |
| `npm run lint` | Executa o ESLint |
| `npm run format` | Formata o código com o Prettier |
| `npm test` | Executa os testes unitários |
| `npm run test:watch` | Testes em modo observação |
| `npm run test:cov` | Testes com relatório de cobertura |
| `npm run test:e2e` | Testes e2e (configuração em `vitest.config.e2e.ts`) |
| `npm run prisma:generate` | Gera o Prisma Client |
| `npm run prisma:migrate -- <nome>` | Cria e aplica uma nova migration (desenvolvimento) |
| `npm run prisma:migrate:deploy` | Aplica as migrations existentes |
| `npm run prisma:prepare` | `prisma generate` + `migrate deploy` |

---

## 🧪 Testes automatizados

Os testes usam o **Vitest** e ficam ao lado do código que testam (`*.spec.ts`).

```bash
npm test              # executa todos os testes
npm run test:cov      # com relatório de cobertura
npm run test:watch    # modo observação
```

### O que é testado

| Nível | O que valida |
|---|---|
| **Domínio** | Matriz de transições inteira (todas as combinações permitidas e proibidas), estados terminais, documentos obrigatórios e código da carga |
| **Aplicação (services)** | Regras de negócio com o Prisma simulado: registro, produto inativo, técnico inválido, status, liberação, bloqueio, cancelamento, documentos e permissões por etapa |
| **Validação de entrada (DTOs)** | Campos obrigatórios, quantidade positiva, tipos e rejeição de campos desconhecidos |

### Cenários exigidos pelo desafio

| Cenário | Onde está |
|---|---|
| Cadastro de produto químico | `ProdutoQuimico.service.spec.ts` |
| Produto sem nome | `ProdutoQuimico.dtos.spec.ts` |
| Produto sem classe de risco | `ProdutoQuimico.dtos.spec.ts` |
| Registro de carga química | `CargaQuimica.service.spec.ts` |
| Carga com produto inativo | `CargaQuimica.service.spec.ts` |
| Quantidade menor ou igual a zero | `CargaQuimica.request.dtos.spec.ts` |
| Liberação sem documentação obrigatória | `CargaQuimica.service.spec.ts` |
| Atualização de status | `CargaQuimica.service.spec.ts` |
| Transições permitidas | `CargaQuimica.transicoes.spec.ts` |
| Transições proibidas | `CargaQuimica.transicoes.spec.ts` |
| Cancelamento de carga | `CargaQuimica.service.spec.ts` |
| Movimentar carga bloqueada | `CargaQuimica.service.spec.ts` |

Nos testes de service, o acesso ao banco é substituído por *mocks* (`vi.fn()`), o que os mantém rápidos e independentes do PostgreSQL.

---

## 🗄️ Banco de dados

### Integração

| Item | Detalhe |
|---|---|
| SGBD | PostgreSQL 18 (container `quimiport_postgres`, banco `quimiport`, volume `postgres_data`) |
| Acesso | Prisma 7, com o adapter `@prisma/adapter-pg` |
| Modelo de dados | `backend/prisma/schema.prisma` |
| Configuração do Prisma | `backend/prisma7.config.ts` |
| Client gerado | `backend/src/infra/database/generated/prisma` (gerado por `npm run prisma:generate`) |
| Serviço de acesso | `PrismaService`, em `backend/src/infra/database` |

### Migrations e seeds

- As migrations ficam em `backend/prisma/migrations` e **são versionadas no git**.
- Para alterar o modelo: edite o `schema.prisma`, execute `npm run prisma:migrate -- <nome_da_migration>` e **faça commit da pasta gerada**. Nunca edite migrations já aplicadas.
- Para aplicar as migrations existentes: `npm run prisma:migrate:deploy`.
- No Docker, as migrations são aplicadas automaticamente quando o container da API inicia.
- O projeto **não possui script de seed**.

### Acessar o banco

```bash
docker exec -it quimiport_postgres psql -U postgres -d quimiport
```

Dentro do `psql`, `\dt` lista as tabelas e `\d "CargaQuimicas"` mostra a estrutura de uma delas. Os nomes das tabelas têm letras maiúsculas e precisam de aspas duplas nas consultas.

### Por que PostgreSQL

- Os dados são **relacionais**: toda carga referencia um produto e um responsável técnico, e possui movimentações e documentos.
- Registrar uma carga e sua primeira movimentação precisa ser **atômico** (transação).
- Regras de integridade ficam no banco: **unicidade** do nome do produto, do `step` por carga e do tipo de documento por carga, além das **chaves estrangeiras**.
- As **migrations** versionadas permitem evoluir o esquema com segurança.

### Diagrama entidade-relacionamento

```mermaid
erDiagram
    ProdutosQuimicos ||--o{ CargaQuimicas : "usado em"
    User ||--o{ CargaQuimicas : "responsavel tecnico"
    CargaQuimicas ||--o{ Movimentacoes : "historico"
    CargaQuimicas ||--o{ DocumentoCargas : "documentos"
    CargaQuimicas ||--o{ Inspecoes : "inspecoes"

    ProdutosQuimicos {
        int id PK
        string nome UK
        string descricao
        int classeRisco
        boolean status
        datetime createdAt
        datetime updatedAt
    }
    CargaQuimicas {
        int id PK
        int produtoQuimicoId FK
        int responsavelTecnicoId FK
        int quantidade
        string unidadeMedida
        string origem
        string destino
        datetime dataEntrada
        string statusCarga
        int classeRiscoONU
        datetime createdAt
        datetime updatedAt
    }
    Movimentacoes {
        int id PK
        int cargaQuimicaId FK
        int step
        string statusAnterior
        string statusAtual
        string notes
        int usuarioId
        datetime date
    }
    DocumentoCargas {
        int id PK
        int cargaQuimicaId FK
        string tipoDocumento
        boolean validado
    }
    Inspecoes {
        int id PK
        int cargaQuimicaId FK
        string resultadoInspecao
        string observacoes
    }
    User {
        int id PK
        string username UK
        string name
        string password
        string_array roles
        boolean status
    }
```

### Como os dados são armazenados

| Pergunta | Resposta |
|---|---|
| **Como os produtos são armazenados?** | Na tabela `ProdutosQuimicos`, com nome único, classe de risco (1 a 9) e `status` booleano (ativo ou inativo). A inativação é lógica |
| **Como as cargas são armazenadas?** | Na tabela `CargaQuimicas`, com quantidade, unidade, origem, destino, data de entrada, status atual e classe de risco herdada do produto |
| **Como a carga se relaciona com o produto?** | Por chave estrangeira (`produtoQuimicoId`). A exclusão do produto é bloqueada se houver cargas. A carga guarda a classe de risco do momento da associação, então inativar o produto não altera cargas existentes |
| **Como o responsável técnico é guardado?** | Por chave estrangeira para `User` (`responsavelTecnicoId`), com `onDelete: Restrict`: um usuário que é responsável por cargas não pode ser removido. A coluna é opcional no banco para preservar cargas criadas antes dessa regra, mas a API sempre exige o campo |
| **Como o status da carga é controlado?** | A coluna `statusCarga` guarda o status atual. Mudanças só ocorrem pela função de transição do service, que valida a matriz de estados e grava, **na mesma transação**, uma linha em `Movimentacoes`. A restrição única `(cargaQuimicaId, step)` impede passos duplicados |
| **Como o histórico é guardado?** | Em `Movimentacoes`: `step`, status anterior, status atual, motivo (`notes`), usuário e data. Só há inserções: o histórico não é alterado |
| **Como os documentos são guardados?** | Em `DocumentoCargas`: tipo, indicador de validação e a carga à qual pertencem. A restrição única `(cargaQuimicaId, tipoDocumento)` impede o mesmo documento duas vezes |
| **E as senhas?** | Em `User.password`, somente como **hash bcrypt**. A senha nunca é devolvida pela API |

O status da carga é um **texto validado pela aplicação** (enum TypeScript), e não um `enum` do banco, o que facilita evoluir o fluxo sem migrations de tipo.

### Como os dados poderão evoluir

- **Inspeção detalhada:** a tabela `Inspecoes` já existe e será usada quando o resultado de inspeção tiver endpoints próprios.
- **Anexos reais:** `DocumentoCargas` poderá referenciar arquivos em armazenamento externo.
- **Catálogo de documentos:** a lista de documentos obrigatórios, hoje fixa no código, poderá ir para o banco e variar por produto.
- **Auditoria:** acrescentar autoria e data de alteração às cargas, além das movimentações.
- **Produtos:** novos atributos de identificação e compatibilidade química.
- **Arquitetura:** evoluir para portas e adaptadores (repositórios), como previsto na Fase 1.

---

## 🗂️ Estrutura interna de pastas

```text
backend/
├── prisma/
│   ├── schema.prisma               # Modelo de dados
│   └── migrations/                 # Migrations versionadas
├── src/                            # Código-fonte (detalhado abaixo)
├── test/                           # Configuração e testes e2e
├── .env.example                    # Variáveis para execução local
├── .env.docker.example             # Variáveis para execução com Docker
├── eslint.config.mjs
├── nest-cli.json
├── package.json
├── prisma7.config.ts               # Configuração do Prisma
├── tsconfig.json
├── tsconfig.build.json
├── vitest.config.ts                # Testes unitários
└── vitest.config.e2e.ts            # Testes e2e
```

### `src/`

```text
src/
├── main.ts                         # Bootstrap: prefixo /api, validação global, Swagger
├── app.module.ts
├── infra/                          # Código transversal (não é regra de negócio)
│   ├── api/                        # ApiModule
│   ├── configurations/             # Leitura das variáveis de ambiente
│   ├── database/                   # PrismaService e client gerado
│   ├── filters/                    # DatabaseExceptionFilter (erros de banco)
│   ├── health/                     # Health check
│   ├── logger/                     # LoggerMiddleware (log de requisições)
│   └── security/
│       ├── decorators/             # @AllowedRoles e @SetPublic
│       ├── enums/                  # RolesEnum (perfis)
│       ├── guards/                 # AuthGuard (JWT) e RolesGuard (perfis)
│       ├── login/                  # Login e refresh token
│       ├── password/               # Hash e comparação de senhas
│       ├── user/                   # CRUD de usuários
│       └── security.module.ts
└── modules/                        # Módulos de negócio
    ├── produtoQuimico/
    │   ├── ProdutoQuimico.module.ts
    │   ├── application/            # Service: casos de uso do produto
    │   ├── domain/
    │   │   └── value-objects/      # ClasseRisco.enum.ts
    │   └── infrastructure/
    │       ├── controller/         # Rotas HTTP
    │       └── dtos/               # Entrada e saída (request/response)
    └── cargaQuimica/
        ├── CargaQuimica.module.ts
        ├── application/
        │   ├── CargaQuimica.service.ts      # Casos de uso: registrar, transicionar, documentos...
        │   └── CargaQuimica.permissoes.ts   # Perfis que atuam em cada etapa
        ├── domain/
        │   ├── CargaQuimica.transicoes.ts   # Matriz de transições (funções puras)
        │   ├── CargaQuimica.documentos.ts   # Documentos obrigatórios
        │   ├── CargaQuimica.codigo.ts       # Código público da carga (CQ-000001)
        │   └── value-objects/               # StatusCarga.enum.ts e TipoDocumento.enum.ts
        └── infrastructure/
            ├── controller/
            └── dtos/
```

Os arquivos `*.spec.ts` ficam ao lado do código que testam.

---

## 🏗️ Organização arquitetural e módulos

A API é um **monólito modular**: cada módulo de negócio (`produtoQuimico` e `cargaQuimica`) é independente e organizado em camadas, e o código transversal fica em `infra/`.

| Camada | Pasta | Responsabilidade |
|---|---|---|
| Interface (HTTP) | `infrastructure/controller` e `infrastructure/dtos` | Rotas, validação de entrada, documentação Swagger e formato das respostas |
| Aplicação | `application` | Casos de uso: orquestra as regras, controla transações e autorização por etapa |
| Domínio | `domain` | Regras puras, sem dependência de framework ou banco: matriz de transições, documentos obrigatórios e enums |
| Infraestrutura | `infra` | Banco (Prisma), segurança (JWT, guards), logs, filtros e configurações |

### Caminho de uma requisição

```mermaid
flowchart LR
    C[Cliente] --> G[AuthGuard e RolesGuard]
    G --> V[ValidationPipe]
    V --> CT[Controller]
    CT --> S[Service]
    S --> D[Domínio: transições e regras]
    S --> P[Prisma]
    P --> DB[(PostgreSQL)]
```

1. O **AuthGuard** valida o token JWT e confirma que o usuário existe e está ativo.
2. O **RolesGuard** confere o perfil exigido pela rota (`@AllowedRoles`).
3. O **ValidationPipe** global valida o corpo da requisição e **rejeita campos desconhecidos**.
4. O **Controller** delega ao **Service**, que aplica as regras do domínio e persiste os dados via Prisma, usando transações quando mais de uma tabela é alterada.

### Configurações globais (`main.ts`)

- Prefixo `/api` em todas as rotas.
- `ValidationPipe` com `transform`, `whitelist` e `forbidNonWhitelisted`.
- CORS habilitado.
- Swagger em `/api/api-docs`, com autenticação Bearer JWT.
- `DatabaseExceptionFilter` como filtro global de exceções.

---

## 📖 Documentação da API e endpoints

A documentação interativa está no **Swagger**:

| Execução | URL |
|---|---|
| Local (Opção A) | http://localhost:3010/api/api-docs |
| Docker (Opção B) | http://localhost:3000/api/api-docs |

Todas as rotas têm prefixo **`/api`**. O Swagger permite autenticar (botão **Authorize**), enviar requisições e consultar os modelos de entrada e saída, as respostas e os códigos de erro de cada rota.

### Endpoints

**Autenticação** (rotas públicas)

| Método | Rota | Descrição |
|---|---|---|
| `POST` | `/api/login` | Autentica e retorna `access_token` e `refresh_token` |
| `POST` | `/api/login/refresh` | Gera novos tokens a partir do `refresh_token` |

**Usuários** (somente `ADMINISTRADOR`)

| Método | Rota | Descrição |
|---|---|---|
| `POST` | `/api/users` | Cria usuário, com seus perfis |
| `GET` | `/api/users` | Lista usuários |
| `GET` | `/api/users/:id` | Busca usuário |
| `PUT` | `/api/users/:id` | Atualiza usuário |
| `DELETE` | `/api/users/:id` | Remove usuário |

O corpo de cada requisição está descrito no Swagger.

**Produtos químicos** (`ADMINISTRADOR`, `GESTOR`, `OPERADOR`, `TECNICO`)

| Método | Rota | Descrição | Sucesso |
|---|---|---|---|
| `POST` | `/api/produtos-quimicos` | Cadastra produto | `201` |
| `GET` | `/api/produtos-quimicos` | Lista produtos | `200` |
| `GET` | `/api/produtos-quimicos/:id` | Busca produto | `200` |
| `PUT` | `/api/produtos-quimicos/:id` | Atualiza produto | `200` |
| `PATCH` | `/api/produtos-quimicos/:id/inativar` | Inativa o produto (lógico e idempotente) | `200` |
| `DELETE` | `/api/produtos-quimicos/:id` | Exclui produto sem cargas associadas | `200` |

**Cargas químicas**

| Método | Rota | Perfis | Descrição | Sucesso |
|---|---|---|---|---|
| `POST` | `/api/cargas-quimicas` | `ADMINISTRADOR`, `GESTOR`, `OPERADOR` | Registra carga | `201` |
| `GET` | `/api/cargas-quimicas` | Qualquer usuário autenticado | Lista cargas | `200` |
| `GET` | `/api/cargas-quimicas/:id` | Qualquer usuário autenticado | Busca carga, com documentos e responsável técnico | `200` |
| `PUT` | `/api/cargas-quimicas/:id` | `ADMINISTRADOR`, `GESTOR`, `OPERADOR` | Atualiza dados, sem mudar o status | `200` |
| `GET` | `/api/cargas-quimicas/:id/historico` | Qualquer usuário autenticado | Movimentações ordenadas por `step` | `200` |
| `PATCH` | `/api/cargas-quimicas/:id/status` | Conforme a etapa da carga | Atualiza o status | `200` |
| `PATCH` | `/api/cargas-quimicas/:id/bloquear` | Conforme a etapa da carga | Bloqueia (exige `motivo`) | `200` |
| `PATCH` | `/api/cargas-quimicas/:id/liberar` | Conforme a etapa da carga | Libera (exige documentação validada) | `200` |
| `PATCH` | `/api/cargas-quimicas/:id/cancelar` | `ADMINISTRADOR`, `GESTOR` | Cancela (exige `motivo`) | `200` |
| `POST` | `/api/cargas-quimicas/:id/documentos` | `ADMINISTRADOR`, `GESTOR`, `TECNICO`, `DOCUMENTACAO` | Registra documento | `201` |
| `PATCH` | `/api/cargas-quimicas/:id/documentos/:docId/validar` | `ADMINISTRADOR`, `GESTOR`, `QUALIDADE`, `INSPETOR` | Valida documento | `200` |

**Saúde da aplicação** (rotas públicas)

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/api/health` | Checagem geral da API (status, timestamp, uptime e banco de dados) |
| `GET` | `/api/health/db` | Checagem específica do banco de dados |

### Exemplos de requisição e resposta

Os exemplos usam `BASE=http://localhost:3010/api` (execução local). Para o Docker, use a porta `3000`. Substitua `<TOKEN>` pelo `access_token` obtido no login.

**Login**

```bash
curl -X POST $BASE/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "<senha>"}'
```
```json
{
  "access_token": "<jwt>",
  "refresh_token": "<jwt>"
}
```

**Cadastrar produto químico**

```bash
curl -X POST $BASE/produtos-quimicos \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"nome": "Acetona", "descricao": "Solvente orgânico", "classeRisco": 3}'
```

**Registrar carga química**

O `responsavelTecnicoId` é o `id` de um usuário **ativo** com o perfil `TECNICO`.

```bash
curl -X POST $BASE/cargas-quimicas \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "produtoQuimicoId": 1,
    "quantidade": 500,
    "unidadeMedida": "kg",
    "origem": "Porto de Rotterdam",
    "destino": "Terminal 3 - Santos",
    "responsavelTecnicoId": 2
  }'
```
```json
{
  "id": 1,
  "codigo": "CQ-000001",
  "produtoQuimicoId": 1,
  "produtoQuimico": { "id": 1, "nome": "Acetona", "classeRisco": 3, "status": true },
  "quantidade": 500,
  "unidadeMedida": "kg",
  "origem": "Porto de Rotterdam",
  "destino": "Terminal 3 - Santos",
  "responsavelTecnicoId": 2,
  "responsavelTecnico": { "id": 2, "name": "Maria Souza", "username": "maria.tecnica" },
  "dataEntrada": "2026-11-01T12:00:00.000Z",
  "statusCarga": "CADASTRADA",
  "classeRiscoONU": 3,
  "documentos": [],
  "createdAt": "2026-11-01T12:00:00.000Z",
  "updatedAt": "2026-11-01T12:00:00.000Z"
}
```

A classe de risco (`classeRiscoONU`) é **herdada do produto** e não pode ser informada manualmente.

**Avançar o status**

```bash
curl -X PATCH $BASE/cargas-quimicas/1/status \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"statusCarga": "EM_PREPARACAO"}'
```

**Tentar liberar sem documentação** (resposta `409`)

```bash
curl -X PATCH $BASE/cargas-quimicas/1/liberar -H "Authorization: Bearer <TOKEN>"
```
```json
{
  "message": "Documentação obrigatória pendente: FISPQ, NOTA_FISCAL.",
  "error": "Conflict",
  "statusCode": 409
}
```

**Registrar e validar documentos**

```bash
curl -X POST $BASE/cargas-quimicas/1/documentos \
  -H "Authorization: Bearer <TOKEN>" -H "Content-Type: application/json" \
  -d '{"tipoDocumento": "FISPQ"}'

curl -X PATCH $BASE/cargas-quimicas/1/documentos/1/validar \
  -H "Authorization: Bearer <TOKEN>"
```

**Bloquear e cancelar** (o `motivo` é obrigatório)

```bash
curl -X PATCH $BASE/cargas-quimicas/1/bloquear \
  -H "Authorization: Bearer <TOKEN>" -H "Content-Type: application/json" \
  -d '{"motivo": "Inconsistência na documentação"}'

curl -X PATCH $BASE/cargas-quimicas/1/cancelar \
  -H "Authorization: Bearer <TOKEN>" -H "Content-Type: application/json" \
  -d '{"motivo": "Embarque desistido pelo cliente"}'
```

**Consultar o histórico**

```bash
curl $BASE/cargas-quimicas/1/historico -H "Authorization: Bearer <TOKEN>"
```
```json
[
  {
    "id": 1, "step": 1, "statusAnterior": null, "statusAtual": "CADASTRADA",
    "notes": "Carga cadastrada", "usuarioId": 1, "date": "2026-11-01T12:00:00.000Z"
  },
  {
    "id": 2, "step": 2, "statusAnterior": "CADASTRADA", "statusAtual": "EM_PREPARACAO",
    "notes": null, "usuarioId": 1, "date": "2026-11-01T12:05:00.000Z"
  }
]
```

### Fluxo completo sugerido (roteiro de demonstração)

1. `POST /login` e autorizar o token no Swagger.
2. Criar um usuário com perfil `TECNICO` (`POST /users`) e anotar o `id`.
3. Criar um produto (`POST /produtos-quimicos`).
4. Registrar uma carga com `responsavelTecnicoId` (`POST /cargas-quimicas`).
5. Avançar: `CADASTRADA` → `EM_PREPARACAO` → `EM_INSPECAO` (`PATCH /status`).
6. Tentar liberar: `409` por documentação pendente.
7. Registrar e validar `FISPQ` e `NOTA_FISCAL`.
8. Liberar (`PATCH /liberar`), movimentar e finalizar (`PATCH /status`).
9. Consultar o histórico (`GET /historico`).
10. Em outra carga, demonstrar o bloqueio, a tentativa de movimentar carga bloqueada (`409`) e o cancelamento.

### Códigos de resposta

| Código | Quando ocorre |
|---|---|
| `200` / `201` | Sucesso |
| `400` | Dados inválidos, campo desconhecido, motivo ausente, produto inexistente ou inativo, responsável técnico inválido |
| `401` | Token ausente, inválido ou expirado |
| `403` | Perfil sem permissão para a rota ou para a etapa atual da carga |
| `404` | Recurso não encontrado |
| `409` | Conflito com as regras: transição inválida, documentação pendente, estado terminal, nome de produto duplicado, produto com cargas associadas |

---

## 🔐 Autenticação e autorização

### Autenticação

- O login (`POST /api/login`) valida usuário e senha e retorna um **`access_token`** (JWT, válido por **1 hora**) e um **`refresh_token`** (válido por **7 dias**).
- O `refresh_token` renova a sessão em `POST /api/login/refresh`.
- As requisições autenticadas enviam o cabeçalho `Authorization: Bearer <access_token>`.
- Senhas são armazenadas apenas como **hash bcrypt**.

### Guards globais

Dois guards valem para toda a API (registrados em `SecurityModule`):

| Guard | O que faz |
|---|---|
| **AuthGuard** | Valida o token, confirma que o usuário existe e está **ativo** e disponibiliza `id`, `username` e `roles` na requisição. Rotas marcadas com `@SetPublic()` não exigem token |
| **RolesGuard** | Confere se algum perfil do usuário está entre os permitidos pelo decorator `@AllowedRoles([...])`. **Rotas sem `@AllowedRoles` exigem apenas um token válido** |

### Perfis

`ADMINISTRADOR`, `GESTOR`, `OPERADOR`, `TECNICO`, `DOCUMENTACAO`, `QUALIDADE` e `INSPETOR` (`RolesEnum`). A correspondência com os perfis do domínio está no [README geral](../README.md#-perfis-envolvidos).

### Permissões por rota

| Recurso | Perfis |
|---|---|
| Usuários | `ADMINISTRADOR` |
| Produtos químicos | `ADMINISTRADOR`, `GESTOR`, `OPERADOR`, `TECNICO` |
| Registrar e atualizar carga | `ADMINISTRADOR`, `GESTOR`, `OPERADOR` |
| Consultar cargas e histórico | Qualquer usuário autenticado |
| Cancelar carga | `ADMINISTRADOR`, `GESTOR` |
| Registrar documento | `ADMINISTRADOR`, `GESTOR`, `TECNICO`, `DOCUMENTACAO` |
| Validar documento | `ADMINISTRADOR`, `GESTOR`, `QUALIDADE`, `INSPETOR` |

### Permissões por etapa da carga

Nas rotas que mudam o status (`status`, `bloquear` e `liberar`), a permissão depende da **etapa atual** da carga. `ADMINISTRADOR` e `GESTOR` atuam em todas as etapas:

| Etapa atual da carga | Perfis que podem avançá-la |
|---|---|
| `CADASTRADA` | `TECNICO` |
| `EM_PREPARACAO` | `TECNICO`, `DOCUMENTACAO` |
| `EM_INSPECAO` | `QUALIDADE`, `INSPETOR` |
| `BLOQUEADA` | `TECNICO` |
| `LIBERADA` | `OPERADOR` |
| `EM_MOVIMENTACAO` | `OPERADOR` |
| `FINALIZADA` e `CANCELADA` | ninguém (terminais) |

O **cancelamento** é restrito a `ADMINISTRADOR` e `GESTOR`. Um perfil sem permissão recebe `403`.

---

## 📐 Regras de negócio aplicadas pela API

O fluxo de status, as transições permitidas e proibidas e as condições de cada transição estão no [README geral](../README.md#-status-e-transições). Abaixo, as regras como a API as aplica.

### Produtos químicos

- O **nome** é obrigatório e **único**, sem diferenciar maiúsculas de minúsculas (`409` se duplicado).
- A **classe de risco** é obrigatória e deve estar entre **1 e 9** (classificação ONU).
- Um produto **inativo** não pode ser usado em novas cargas.
- A inativação é **lógica** (`status = false`) e idempotente: as cargas já existentes não são afetadas.
- Um produto só pode ser **excluído** se não tiver cargas associadas (`409` caso contrário).

### Cargas químicas

- Produto, quantidade, unidade de medida, origem, destino e responsável técnico são obrigatórios.
- A **quantidade** deve ser um número inteiro maior que zero.
- O **responsável técnico** é um usuário do sistema: precisa existir, estar ativo e ter o perfil `TECNICO`.
- A **classe de risco** é herdada do produto. O produto só pode ser trocado enquanto a carga está `CADASTRADA`, e a classe é recalculada na troca.
- O **código da carga** (`CQ-000001`) é derivado do identificador gerado pelo banco, portanto nunca se repete.
- A carga **nasce em `CADASTRADA`** e já registra a primeira movimentação (`step 1`).
- A **liberação** exige os documentos obrigatórios (`FISPQ` e `NOTA_FISCAL`) registrados e validados.
- **Bloquear** e **cancelar** exigem `motivo`, gravado nas observações (`notes`) da movimentação.
- Cargas `FINALIZADA` ou `CANCELADA` **não podem mais ser alteradas** nem receber documentos ou novas movimentações.
- O **cancelamento é lógico**: a carga permanece no banco, com o motivo e o histórico preservados. Não existe exclusão física de cargas.
- Todos os endpoints de status passam por **uma única função de transição** (`CargaQuimicaService.transicionar`), que valida a matriz de estados, as permissões, o motivo e a documentação, e grava a movimentação na mesma transação.

---

## 📝 Logs

A API usa o **Logger do NestJS**, com saída por contexto.

| Origem | O que registra |
|---|---|
| `LoggerMiddleware` (contexto `APP`) | Cada requisição: status, tempo de resposta, método e rota. Respostas `4xx` e `5xx` são registradas como erro |
| Serviço de cargas | Registro de carga, mudanças de status (com origem, destino e usuário), bloqueios, liberações, cancelamentos, transições recusadas e documentos registrados e validados |
| Serviço de produtos | Cadastro e inativação de produtos |
| `DatabaseExceptionFilter` | Tratamento global de erros do banco de dados |

Para acompanhar os logs no Docker: `docker compose logs -f api`.

---

## ⚙️ CI/CD

O workflow `.github/workflows/ci.yml` executa em cada **push** e **pull request** nas branches `bruno`, `fase2/dev` e `fase2/main`, com dois jobs:

**1. `CI/CD Pipeline`** (a partir da pasta `backend/`)

| Passo | Comando |
|---|---|
| Instalar dependências | `npm ci` |
| Preparar o Prisma | `npm run prisma:generate` |
| Lint | `npm run lint` |
| Build | `npm run build` |
| Testes | `npm test` |

**2. `Build and Test Docker Image`**

| Passo | O que faz |
|---|---|
| Criar o ambiente | Copia `.env.docker.example` para `.env.docker` |
| Subir os serviços | `docker compose up -d --build` |
| Aguardar | Espera o PostgreSQL e a API ficarem `healthy` (limite de 120 s) |
| Validar | Executa `pg_isready` no banco e `GET /api/health` na API |
| Diagnóstico | Em caso de falha, exibe os logs dos containers |
| Encerrar | `docker compose down -v` |

O deploy não faz parte desta fase.

---

## 🧭 Decisões arquiteturais

| Decisão | Justificativa |
|---|---|
| **NestJS** (sobre Express) | Estrutura modular e injeção de dependência, que combinam com a separação em camadas da Fase 1. Traz validação, guards e integração com Swagger prontos, usando o Express como base |
| **TypeScript** | O domínio tem muitos estados e restrições, que se beneficiam de tipagem e enums |
| **Monólito modular** | Base simples e coesa para a primeira versão, com fronteiras entre módulos que permitem extração futura |
| **PostgreSQL** | Dados relacionais, transações e restrições de integridade (veja [Banco de dados](#-banco-de-dados)) |
| **Prisma** | Esquema tipado, migrations versionadas e client gerado, o que reduz erros de acesso a dados |
| **Regras puras no domínio** | A matriz de transições e os documentos obrigatórios são funções e constantes sem dependência de framework ou banco, simples de testar |
| **Função única de transição** | Todos os endpoints de status passam pela mesma função, que centraliza as regras e garante uma movimentação por transição |
| **Prisma usado diretamente nos services** | Decisão de escopo desta fase. A Fase 1 prevê repositórios (portas e adaptadores), que ficam como evolução |
| **JWT com guards globais** | `AuthGuard` e `RolesGuard` valem para toda a API: rotas sem `@AllowedRoles` exigem apenas token e rotas com `@SetPublic` ficam abertas |
| **ValidationPipe global** (`whitelist` e `forbidNonWhitelisted`) | Campos desconhecidos são rejeitados, o que impede, por exemplo, enviar `statusCarga` ou `classeRiscoONU` no cadastro da carga |
| **Cancelamento lógico** | Preserva rastreabilidade e histórico, em vez de apagar registros |
| **Vitest** | Suporte nativo a ESM e TypeScript, execução rápida e API compatível com a de outros frameworks de teste |
| **Docker Compose com healthchecks** | Ambiente reproduzível: a API só inicia depois que o banco está pronto e as migrations rodam na subida |

---

## 🧑‍💻 Convenções para desenvolvimento

Padrões já adotados no código, que devem ser mantidos:

**Estrutura**
- Todo módulo de negócio fica em `src/modules/<modulo>`, com as pastas `application`, `domain` e `infrastructure`.
- Regras de negócio ficam no **service** e no **domínio**, nunca no controller. O controller apenas recebe a requisição e delega.
- Mudanças de status da carga passam **sempre** por `CargaQuimicaService.transicionar`.

**Nomes de arquivos**
- `Entidade.service.ts`, `Entidade.controller.ts` e `Entidade.module.ts`.
- DTOs em `Entidade.request.dtos.ts` e `Entidade.response.dtos.ts`.
- Enums em `Nome.enum.ts` e testes em `*.spec.ts`, ao lado do código.
- Os imports usam a extensão `.js` (o projeto usa módulos ES), por exemplo `import { X } from './x.js'`.

**API**
- Rotas no plural, em minúsculas e com hífen (`/produtos-quimicos`), sob o prefixo `/api`.
- Todo campo aceito na entrada precisa estar declarado no DTO com decorators do `class-validator`, porque a API rejeita campos desconhecidos.
- Novas rotas devem ter `@ApiTags`, `@ApiOperation` e as respostas de erro relevantes documentadas.
- Use `@AllowedRoles([...])` para restringir perfis e `@SetPublic()` apenas para rotas que não exigem token.
- Erros de regra usam as exceções HTTP do NestJS (`BadRequestException`, `ConflictException`, `ForbiddenException` e `NotFoundException`).

**Banco de dados**
- Toda alteração do `schema.prisma` gera uma migration (`npm run prisma:migrate -- <nome>`) que deve ser versionada. Não edite migrations já aplicadas.
- Depois de alterar o schema, execute `npm run prisma:generate`.
- Operações que alteram mais de uma tabela devem usar `prisma.$transaction`.

**Testes e qualidade**
- Cada regra de negócio nova deve ter teste. Nos services, o Prisma é simulado com `vi.fn()`.
- Antes de enviar alterações, execute os mesmos comandos do CI: `npm run lint`, `npm run build` e `npm test`.
- Use `npm run format` para formatar o código com o Prettier.

**Logs e segurança**
- Registre eventos relevantes de negócio com o `Logger` do NestJS, instanciado com o nome da classe.
- Nunca versione arquivos `.env`, nem registre senhas ou tokens nos logs.

**Branches**
- O CI executa nas branches `bruno`, `fase2/dev` e `fase2/main`.

---

## 🩺 Solução de problemas

| Sintoma | Causa provável e solução |
|---|---|
| A API local não conecta ao banco | `DATABASE_URL` do `.env` com host `postgres`. Para a execução local, use `localhost` |
| `port is already allocated` | Há outro banco ou API em execução. Execute `docker compose down` e tente de novo |
| Erro de tipo no build ou `Property ... does not exist` | O Prisma Client está desatualizado. Execute `npm run prisma:generate` |
| Rotas retornam erro de tabela inexistente | As migrations não foram aplicadas. Execute `npm run prisma:migrate:deploy` |
| Falha no build do Docker por falta de `.env.docker` | Crie o arquivo a partir de `backend/.env.docker.example` |
| A API no Docker reinicia em loop | Veja `docker compose logs api`. A causa mais comum é a `DATABASE_URL` com o host errado |
| `401` em todas as rotas | Falta o cabeçalho `Authorization: Bearer <token>`, ou o token expirou |
| `403` ao criar ou alterar uma carga | O perfil do usuário não está entre os permitidos para a rota ou para a etapa |
| `400` ao enviar um campo que parece correto | A API rejeita campos desconhecidos. Confira os nomes no Swagger |
| Comportamento estranho do banco ao alternar entre as opções | Execute `docker compose down -v` e suba novamente (apaga os dados do banco) |
