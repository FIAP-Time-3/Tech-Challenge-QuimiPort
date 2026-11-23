# TODO do backend para a fase 3

O maior trabalho restante é implementar as 13 rotas de usuários e fechar as permissões dos três perfis. O projeto já tem JWT, hash de senha, seed do primeiro administrador, cadastro de produtos e cargas, número ONU, documentos e histórico de status. [PDF da fase 3](../../planning/pdfs/fase3.pdf)

## Checklist em ordem de execução

- [x] **Fechar o contrato de usuários.** O e-mail único é usado no cadastro e na autenticação. O filtro por e-mail faz parte da implementação das novas rotas por perfil.

- [x] **Resolver a edição de senha.** O projeto adota `PATCH /api/users/password/:id` para reset administrativo e `PATCH /api/me/password` para troca pelo próprio usuário. O `PUT /api/users/:id` usa um DTO sem senha. Ainda falta atualizar o README com esse contrato. [PDF da fase 3](../../planning/pdfs/fase3.pdf)

- [x] **Criar o seed ou script do primeiro administrador.** O comando `npm run seed:admin` preserva o cadastro quando já existe um administrador ativo. A proteção do último administrador permite editar nome e e-mail e usa um lock transacional para impedir remoção, inativação ou troca de perfil que deixaria o sistema sem administrador ativo. Falta validar a seed e as operações simultâneas no PostgreSQL e revisar se `/users/first_access`, `/login/setup`, healthcheck, Swagger e download da coleção devem continuar públicos.

- [x] **Definir o modelo de perfis.** Cada usuário tem exatamente um perfil. Banco, DTOs, `/me`, JWT e guards usam `ADMINISTRADOR`, `OPERADOR` ou `DESPACHANTE`. Somente operadores e administradores ativos podem ser designados como responsáveis técnicos.

- [ ] **Implementar as 13 rotas sob `/api`.** Administradores precisam de listagem, edição e inativação. Operadores e despachantes precisam de cadastro, listagem, edição, inativação e autenticação, cinco rotas para cada perfil. Paginar as três listas e filtrar as duas últimas pelo e-mail usado no login. Definir o perfil no servidor, conferir o perfil do ID antes de editar ou inativar, manter a senha fora dos DTOs de edição e reaproveitar o serviço de autenticação.

- [ ] **Aplicar a matriz de autorização.** Os três perfis já podem consultar produtos, cargas e documentos. As alterações nesses recursos são restritas a administradores e operadores. Nas rotas de usuários por perfil, permitir que somente administradores cadastrem operadores e que administradores ou operadores cadastrem despachantes. Definir quem pode listar, editar e inativar cada perfil e revisar a convivência com as rotas genéricas de `/users`, hoje restritas a administradores nas operações de gestão.
