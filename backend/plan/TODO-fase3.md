# TODO do backend para a fase 3

O maior trabalho é implementar as 13 rotas de usuários, fechar as permissões dos três perfis e criar o primeiro administrador por seed ou script. O projeto já tem JWT, hash de senha, cadastro de produtos e cargas, número ONU, documentos e histórico de status. [PDF da fase 3](../../planning/pdfs/fase3.pdf)

## Checklist em ordem de execução

- [x] **Fechar o contrato de usuários.** A equipe definiu o e-mail único como identificador de login. Usar o e-mail no cadastro, na autenticação e no filtro das novas rotas por perfil.

- [x] **Resolver a edição de senha.** O projeto adota `PATCH /api/users/password/:id` para reset administrativo e `PATCH /api/me/password` para troca pelo próprio usuário. A senha permanece fora do `PUT` de operadores e despachantes. Documentar esse contrato no Swagger e no README. [PDF da fase 3](../../planning/pdfs/fase3.pdf)

- [ ] **Definir o modelo de perfis.** Cada usuário tem exatamente um perfil. Introduzir `DESPACHANTE` e mapear os perfis atuais. Alinhar banco, DTOs, `/me`, JWT e guards. Definir quem pode ser responsável técnico. Hoje o vínculo exige um usuário ativo com perfil `TECNICO`.

- [ ] **Implementar as 13 rotas sob `/api`.** Administradores precisam de listagem, edição e exclusão. Operadores e despachantes precisam de cadastro, listagem, edição, exclusão e autenticação, cinco rotas para cada perfil. Paginar as três listas e filtrar por `login` nas duas últimas. Definir o perfil no servidor, conferir o perfil do ID antes de editar ou excluir e reaproveitar o serviço de autenticação.

- [ ] **Aplicar a matriz de autorização.** Os três perfis podem consultar produtos e cargas. Administrador e operador podem alterá-los. Só administrador cadastra operador, e administrador ou operador cadastra despachante. Fechar as permissões de listagem, edição e exclusão de usuários, que o PDF não detalha. Revisar `/users`, documentos e `DELETE` para que o despachante fique somente em consulta.

- [ ] **Criar o seed ou script do primeiro administrador.** Validar a execução em banco limpo e a reexecução sem duplicar o usuário. Decidir o destino de `/users/first_access` e `/login/setup` e revisar as exceções públicas de healthcheck, Swagger e download da coleção. Corrigir a proteção do último admin para permitir editar nome e e-mail e impedir sua remoção ou inativação, inclusive em operações simultâneas.
