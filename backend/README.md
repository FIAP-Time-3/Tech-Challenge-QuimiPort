# QuimiPort API

API em NestJS para o projeto QuimiPort.

## Requisitos

- Node.js 22+
- npm
- PostgreSQL
- Docker (opcional, para subir o banco localmente)

## 1. Clonar o projeto

```bash
cd /caminho/para/o/projeto
git clone <url-do-repositorio>
cd Tech-Challenge-QuimiPort/backend
```

## 2. Instalar dependências

```bash
npm install
```

## 3. Configurar variáveis de ambiente

Copie o arquivo de exemplo para o ambiente local:

```bash
cp .env.example .env
```

Arquivo `.env` esperado:

```env
APP_PORT=3010
SWAGGER_TITLE=QuimiPort API (DevOps)
SWAGGER_DESCRIPTION=Rest API created for QuimiPort Project (DevOps)
SWAGGER_VERSION=0.1.0

DATABASE_HOSTNAME=localhost
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=postgres
DATABASE_PORT=5432
DATABASE_NAME=quimiport
```

## 4. Subir o banco PostgreSQL

### Opção com Docker

Na raiz do projeto:

```bash
cd ..
docker compose -f .docker/docker-compose.yml up -d
```

### Opção local

Se você já tiver PostgreSQL instalado, crie o banco `quimiport` e ajuste as credenciais do `.env`.

## 5. Gerar e aplicar o Prisma

```bash
npx prisma generate
npx prisma migrate deploy
```

Se quiser criar ou aplicar migrations em desenvolvimento:

```bash
npx prisma migrate dev
```

## 6. Rodar a API

### Desenvolvimento

```bash
npm run start:dev
```

### Execução simples

```bash
npm run start
```

### Produção

```bash
npm run build
npm run start:prod
```

## 7. Verificar a aplicação

A API normalmente fica disponível em:

- http://localhost:3010
- ou na porta definida em `APP_PORT`

### Swagger

A documentação interativa da API fica disponível em:

- http://localhost:3010/api-docs

Caso a porta do projeto seja outra, use o valor configurado em `APP_PORT`.

## 8. Rodar testes

```bash
npm run test
```

## 9. Dicas

- Mantenha o `.env` local fora do controle de versionamento.
- Se o PostgreSQL não conectar, confirme:
  - o banco está rodando;
  - host, usuário, senha e nome do banco estão corretos;
  - a porta `5432` está disponível.

## Estrutura principal

```text
backend/
  src/
  prisma/
  .env
  .env.example
  package.json
  README.md
```
