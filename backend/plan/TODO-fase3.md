# TODO do backend para a fase 3

O backend inclui gestão de usuários por perfil, autenticação compartilhada, seed do primeiro administrador, cadastro de produtos e cargas, número ONU, documentos e histórico de status. [PDF da fase 3](../../planning/pdfs/fase3.pdf)

## Checklist em ordem de execução

- [x] **Fechar o contrato de usuários.** O e-mail único é usado no cadastro e na autenticação. O filtro por e-mail faz parte da implementação das novas rotas por perfil.

- [x] **Resolver a edição de senha.** Usar `PATCH /api/{perfil}/password/:id` para reset e `PATCH /api/me/password` para troca pelo próprio usuário. O `PUT /api/{perfil}/:id` aceita nome, e-mail e status. Os tokens existentes continuam válidos até expirar enquanto a conta estiver ativa.

- [x] **Criar o seed ou script do primeiro administrador.** O comando `npm run seed:admin` preserva o cadastro quando já existe um administrador ativo. A proteção do último administrador permite editar nome e e-mail e usa um lock transacional para impedir remoção, inativação ou troca de perfil que deixaria o sistema sem administrador ativo. Falta validar a seed e as operações simultâneas no PostgreSQL e revisar se `/users/first_access`, `/login/setup`, healthcheck, Swagger e download da coleção devem continuar públicos.

- [x] **Definir o modelo de perfis.** Cada usuário tem exatamente um perfil. Banco, DTOs, `/me`, JWT e guards usam `ADMINISTRADOR`, `OPERADOR` ou `DESPACHANTE`. Somente operadores e administradores ativos podem ser designados como responsáveis técnicos.

- [x] **Implementar a gestão por perfil sob `/api`.** As rotas de administradores, operadores e despachantes oferecem cadastro, listagem paginada com filtro por e-mail, detalhe, edição, inativação e reset de senha. O login é compartilhado em `POST /api/login`.

- [x] **Aplicar a matriz de autorização.** Administradores gerenciam todos os perfis. Operadores também podem gerenciar despachantes, inclusive resetar senhas. Os três perfis podem consultar produtos, cargas e documentos. Alterações nesses recursos são restritas a administradores e operadores.
