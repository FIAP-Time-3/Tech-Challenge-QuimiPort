# TODO do backend para a fase 3

O maior trabalho é implementar as 13 rotas de usuários, fechar as permissões dos três perfis e criar o primeiro administrador por seed ou script. O projeto já tem JWT, hash de senha, cadastro de produtos e cargas, número ONU, documentos e histórico de status. [PDF da fase 3](../../planning/pdfs/fase3.pdf)

## Checklist em ordem de execução

- [x] **Fechar o contrato de usuários.** A equipe definiu o e-mail único como identificador de login. Usar o e-mail no cadastro, na autenticação e no filtro das novas rotas por perfil.

- [x] **Resolver a edição de senha.** O projeto adota `PATCH /api/users/password/:id` para reset administrativo e `PATCH /api/me/password` para troca pelo próprio usuário. A senha permanece fora do `PUT` de operadores e despachantes. Documentar esse contrato no Swagger e no README. [PDF da fase 3](../../planning/pdfs/fase3.pdf)

- [ ] **Definir o modelo de perfis.** Introduzir `DESPACHANTE`, decidir se um usuário pode acumular perfis e mapear os perfis atuais. Alinhar banco, DTOs, `/me`, JWT e guards. Definir quem pode ser responsável técnico. Hoje o vínculo exige um usuário ativo com perfil `TECNICO`.

- [ ] **Implementar as 13 rotas sob `/api`.** Administradores precisam de listagem, edição e exclusão. Operadores e despachantes precisam de cadastro, listagem, edição, exclusão e autenticação, cinco rotas para cada perfil. Paginar as três listas e filtrar por `login` nas duas últimas. Definir o perfil no servidor, conferir o perfil do ID antes de editar ou excluir e reaproveitar o serviço de autenticação.

- [ ] **Aplicar a matriz de autorização.** Os três perfis podem consultar produtos e cargas. Administrador e operador podem alterá-los. Só administrador cadastra operador, e administrador ou operador cadastra despachante. Fechar as permissões de listagem, edição e exclusão de usuários, que o PDF não detalha. Revisar `/users`, documentos e `DELETE` para que o despachante fique somente em consulta.

- [ ] **Criar o seed ou script do primeiro administrador.** Validar a execução em banco limpo e a reexecução sem duplicar o usuário. Decidir o destino de `/users/first_access` e `/login/setup` e revisar as exceções públicas de healthcheck, Swagger e download da coleção. Corrigir a proteção do último admin para permitir editar nome e e-mail e impedir sua remoção ou inativação, inclusive em operações simultâneas.

- [ ] **Corrigir o fluxo de status das cargas.** `BLOQUEADA` deve permitir apenas cancelamento. Alinhar `EM_MOVIMENTACAO` à matriz da fase 2, que prevê finalização como saída. Permitir que o operador execute todo o fluxo previsto e garantir que duas alterações simultâneas não gravem histórico com base no mesmo estado anterior. [PDF da fase 2](../../planning/pdfs/fase2.pdf)

- [ ] **Fechar os dados usados no registro da carga.** Confirmar se o código `CQ` continua gerado pela API ou se passa a ser informado no cadastro. Disponibilizar a consulta dos responsáveis técnicos elegíveis e verificar se as respostas de detalhes e documentos cobrem os campos pedidos no PDF. A busca por código ou produto e o filtro por status são exigências da interface e podem usar a listagem existente.

- [ ] **Validar e documentar a entrega.** Cobrir as novas rotas, paginação, filtro, login pela rota do perfil errado, `401` sem autenticação, `403` para alterações por despachante, último administrador e concorrência de status. Testar o reset administrativo e a troca pelo próprio usuário, incluindo ID inexistente, senha atual incorreta e confirmação divergente. Rodar a suíte completa com PostgreSQL, conferir a subida via Docker e atualizar Swagger e README com os contratos e o comando do seed.
