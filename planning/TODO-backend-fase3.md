# TODO — adequações do backend para a fase 3

Revisão: 17/11/2026. Base: releitura dos três PDFs e do backend atual.
Este arquivo é planejamento; não altera a aplicação. Última validação após ajuste
às novas DTOs: `npm run test:all` passou com 278 testes unitários, 5 HTTP com mocks
e 30 com PostgreSQL real, incluindo reset e migrations. Build e lint aprovados.
As páginas são a posição no PDF. Este é o checklist revisado específico de backend;
nos pontos de divergência, substitui as descrições anteriores de backend no planejamento.

Este TODO cobre exclusivamente implementação e validação do backend: API, banco,
testes e infraestrutura. Documentação, frontend e repasse de contratos ficam fora
deste checklist.

## Referências e decisões pendentes

- [Fase 1](pdfs/fase1.pdf): proposta de domínio/arquitetura; os atores sugeridos
  não obrigam manter aqueles perfis de acesso na fase 3.
- [Fase 2](pdfs/fase2.pdf), páginas 3–6: dados de produtos/cargas e matriz de status.
- [Fase 3](pdfs/fase3.pdf), páginas 5–9: perfis, 13 rotas, autenticação e seed;
  páginas 10–11: dados necessários às telas e operação das cargas.
- **Roles ainda serão decididas pela equipe.** Não assumir neste momento perfil
  único, remoção dos perfis antigos, representação no banco ou estratégia de migração.
  O PDF define administrador, operador e despachante, mas não exige acúmulo de perfis.
- **first_access também fica para depois.** A fase 3 exige seed/script para o
  primeiro administrador; a estratégia de adequação do fluxo atual será definida
  antes de alterar first_access, setup, AuthGuard ou suas integrações.
- Reaproveitar NestJS, PostgreSQL/Prisma, tabela User e serviços atuais.

## Já existe — não implementar novamente

- CRUD de produtos, inativação, nome/classe obrigatórios e recusa de produto inativo em nova carga.
- Registro/consulta de cargas, quantidade positiva, responsável obrigatório no DTO,
  vínculo com usuário e código gerado pelo ID.
- Login, JWT de acesso/refresh, bcrypt, login único, ocultação de senha/hash,
  consulta /me e recusa de usuários inativos no login, guard e refresh.
- Exclusão lógica de usuário e verificação do último administrador, com ajuste abaixo.
- Matriz de transições, motivos para bloquear/cancelar e estados terminais.
- Status/histórico na mesma transação, com executor; falta proteção concorrente adequada.
- Upload/download/validação de PDFs e recusa de liberação sem documentos obrigatórios validados.
- Swagger, logs, tratamento de erros, Docker/healthchecks, testes e CI.

## Sequência e dependências entre módulos

1. Avançar em produtos, contratos de usuários e integridade de cargas sem alterar roles, JWT, guards, first_access ou setup.
2. Validar essas mudanças com testes e E2E, mantendo os perfis atuais.
3. Definir com a equipe o modelo de roles, a elegibilidade dos responsáveis técnicos e a estratégia de primeiro acesso.
4. Implementar as decisões, concluir as rotas de usuários e ajustar a autorização dos recursos.
5. Validar a integração entre os módulos, a API e o banco.

As rotas /administradores, /operadores e /despachantes, o modelo de role único e
as alterações de autenticação/primeiro acesso ficam adiados conforme decisão do
projeto. Seus itens permanecem abertos para uma etapa posterior.

Testar cada alteração durante sua implementação. Preparar dados e
DTOs não significa publicar endpoints sem a autorização final. Itens bloqueados
por decisões estão indicados nas respectivas seções.

## Módulo de produtos químicos

Referências: fase 2, páginas 3–4; fase 3, páginas 10–11.

- [x] Adicionar numeroONU ao produto em schema/migration, DTOs de entrada/saída e serviços. A fase 2 admite código simulado.
- [x] Incluir numeroONU em ProdutoResumoDto na resposta da carga, com @Expose
      para disponibilizar o campo nos detalhes.

## Módulo de usuários

### Dados e contratos — pode avançar

Referência: fase 3, páginas 6–11. Preservar roles e primeiro acesso atuais.

- [x] Adicionar email obrigatório e único por migration, validar formato nos DTOs
      e usar CITEXT para unicidade sem diferenciar caixa. Username foi removido.
      O projeto usa bancos recriados do zero; preenchimento de usuários legados não se aplica.
- [x] Disponibilizar name/email/password nos contratos atuais de criação e primeiro
      acesso, usando email como identificador e rejeitando username legado.
- [x] Separar os DTOs genéricos de criação e edição: CreateUserDto exige senha;
      UpdateUserDto não contém senha. Controller e serviço usam os DTOs correspondentes.
- [x] Retirar a exigência de senha/login no update e preservar o hash armazenado:
      o serviço não gera hash nem inclui password no UPDATE.
- [ ] Concluir os contratos de edição por perfil com nome/email, sem alteração de senha.
      A troca de senha fica para depois por decisão do projeto.
- [x] Preservar status quando omitido na edição: default true apenas em CreateUserDto;
      UpdateUserDto mantém undefined e o Prisma preserva o status armazenado.

### Testes da remoção de username e inclusão de email

- [x] Atualizar fixtures, mocks e testes para CreateUserDto/UpdateUserDto, mantendo
      validação dos campos obrigatórios e rejeição de senha no contrato de edição.
- [x] Atualizar User.service.spec.ts: update sem password na gravação e sem chamada
      a PasswordService.hash.
- [x] Atualizar os payloads de PUT nos testes HTTP para o contrato sem password.
- [x] Verificar email e ocultação de username/senha nas respostas de criação,
      consulta, edição e /me.
- [x] Testar edição de email e conflitos com diferenças de caixa no serviço/banco
      e nas rotas HTTP (409).
- [x] Testar que o hash persistido permanece idêntico após edição sem senha e que
      password no PUT é rejeitado com 400.
- [x] Testar preservação de status quando omitido na edição, incluindo usuários
      ativos e inativos, com mocks e HTTP/PostgreSQL real.
- [x] Testar alteração explícita de status true/false e rejeição de valores não booleanos,
      verificando que requisição inválida não altera os dados persistidos.
- [x] Testar que edição apenas de nome/email limpa roles para [] e preserva o hash,
      conforme as decisões do projeto; criação sem status continua usando true.
- [x] Definir e testar o tratamento do campo legado username nas requisições;
      garantir que não seja exigido nem usado como identificador após a remoção.
      A ValidationPipe com forbidNonWhitelisted retorna 400 quando username é enviado,
      inclusive junto de email válido, na criação, edição, login e primeiro acesso.
- [ ] Alinhar os contratos acima e as rotas por perfil abaixo ao uso de email como
      identificador, sem reintroduzir username.

### Evidências e pendências da revisão de usuários

- **Validação atual:** 278 testes unitários, 5 HTTP com mocks e 30 com PostgreSQL
  real passaram (14 de serviço/banco e 16 HTTP). Reset, migrations, build e lint
  aprovados. O comando `npm run test:all` executa as três suítes em sequência.
  A CI está configurada para esse comando; a execução remota depende do próximo push.
- **Concluído:** DTOs distintos, update sem gravação de senha e teste da preservação
  exata do hash no banco.
- **Decisões de edição:** PUT não permite alteração de senha; essa funcionalidade
  fica para depois. Roles omitido deve continuar virando [], conforme decisão do projeto.
  Esses comportamentos não são pendências. As rotas por perfil continuam pendentes.
- **Status omitido:** fica undefined no DTO de edição e preserva o valor no banco,
  inclusive false; comportamento confirmado nos testes de regressão.
- **Último administrador:** validateUniqueAdmin é chamado em todo update/remove e
  bloqueia a edição de nome/email do único administrador ativo. A checagem também
  precisa distinguir o perfil do usuário alvo e considerar concorrência nas alterações
  que possam remover o último administrador.
- **Rotas futuras:** só existem /users e /login genéricos; faltam as 13 rotas por
  perfil, paginação/filtro e DESPACHANTE. Não definir roles ou políticas sem a equipe.

### Roles e proteção do administrador — depende da equipe

Definir o modelo antes de implementar; as alternativas abaixo não são escolhas aprovadas.

- [ ] Definir perfil único ou múltiplos perfis e sua representação em User,
      DTOs, /me, tokens e contexto autenticado.
- [ ] Definir se os sete perfis atuais serão removidos e como representar os
      três tipos de acesso da fase 3, incluindo DESPACHANTE, ausente no enum atual.
- [ ] Definir destino de usuários/perfis combinados e política de sessões antigas;
      preservar vínculos/histórico e não promover usuários automaticamente a admin.
- [ ] Implementar as decisões em migrations, enums, serviços, decorators e guards;
      atualizar os contratos da API e rejeitar entradas incompatíveis.
- [ ] Adaptar a proteção do último administrador ao modelo escolhido e corrigir
      validateUniqueAdmin para permitir editar nome/email do único admin ativo.
      Hoje a chamada em qualquer update bloqueia essa edição.
- [x] Confirmar exclusão lógica existente e recusa de inativos no login, AuthGuard
      e refresh, incluindo testes HTTP com PostgreSQL real.

### Rotas por perfil — depende das decisões de roles e contratos

Reaproveitar os DTOs e serviços preparados acima.

Referência: fase 3, páginas 5–9. Todas sob /api.
Hoje existem /users e /login genéricos; as rotas abaixo ainda não existem.

| Feito | Método e rota                   | Entrada                   |
| ----- | ------------------------------- | ------------------------- |
| [ ]   | GET /administradores            | pagina, limite            |
| [ ]   | PUT /administradores/:id        | nome, email               |
| [ ]   | DELETE /administradores/:id     | id                        |
| [ ]   | POST /operadores                | nome, email, login, senha |
| [ ]   | GET /operadores                 | pagina, limite, login     |
| [ ]   | PUT /operadores/:id             | nome, email               |
| [ ]   | DELETE /operadores/:id          | id                        |
| [ ]   | POST /operadores/autenticacao   | login, senha              |
| [ ]   | POST /despachantes              | nome, email, login, senha |
| [ ]   | GET /despachantes               | pagina, limite, login     |
| [ ]   | PUT /despachantes/:id           | nome, email               |
| [ ]   | DELETE /despachantes/:id        | id                        |
| [ ]   | POST /despachantes/autenticacao | login, senha              |

- [ ] Definir perfil no servidor conforme a rota; impedir atribuição indevida de
      perfil pelo corpo. Rejeitar perfis não permitidos pelo modelo decidido em entradas mantidas.
- [ ] Permitir POST /operadores só ao administrador e POST /despachantes ao
      administrador/operador, conforme o PDF.
- [ ] Definir e implementar a política das demais operações de usuários: proposta é admin
      gerenciar admins/operadores e admin/operador gerenciar despachantes. O PDF não
      especifica todos os acessos de listagem/edição/exclusão; isso é decisão do projeto.
- [ ] Restringir listas ao perfil correspondente e validar perfil do ID antes de
      editar/excluir: rota de despachante não pode atingir admin/operador.
- [ ] Acrescentar paginação com valores positivos, limite máximo, ordenação estável
      e filtro por login onde previsto; implementar o formato da resposta.
- [ ] Reutilizar login/hash/JWT, acrescentando conferência do perfil da rota.
      Preservar os endpoints existentes de login do administrador e refresh.
- [ ] Revisar /users genérico: remover ou restringir/adaptar o que permanecer,
      evitando caminhos alternativos que contornem as novas políticas.

## Módulo de autenticação e primeiro acesso

**Aguardar a decisão da equipe sobre roles e estratégia de inicialização antes de implementar.**

Referência: fase 3, página 9. Seed/script é exigido; a substituição do fluxo atual
será implementada após a equipe definir a estratégia.

- [ ] Definir como seed/script coexistirá com ou substituirá o fluxo atual.
      Manter first_access/setup intactos até essa definição.
- [ ] Criar seed/script do primeiro administrador conforme o modelo de roles
      definido, com hash de senha e email.
- [ ] Adequar POST /users/first_access e GET /login/setup conforme a decisão,
      implementando os contratos e erros da API; avaliar a adequação do cadastro público ao PDF.
- [ ] Atualizar mensagens do AuthGuard e logs de main.ts; alinhar o retorno 412
      atual quando não há usuários ativos com o fluxo inicial finalmente adotado.
- [ ] Validar inicialização em banco limpo, nova execução do mecanismo e acesso do admin.

### Testes de autenticação por email

- [x] Testar login com email e senha, incluindo variações de maiúsculas/minúsculas,
      email inexistente, senha incorreta e usuário inativo.
- [x] Atualizar os testes de JWT, refresh, AuthGuard e /me para não depender de
      username; manter identificação por ID e as verificações de atividade/permissões.
- [x] Testar o primeiro acesso/setup com email, preservando a estratégia atual:
      cadastro inicial, bloqueio de repetição, concorrência e login do administrador.
- [ ] Acrescentar testes do seed quando sua estratégia for definida e implementada.

## Módulo de cargas químicas

### Dados, código e endpoints de documentos — pode avançar

- [ ] Definir código da carga: hoje é CQ derivado do ID; fase 3 inclui campo no
      formulário. Se aceitar código informado, criar persistência/unicidade e adaptar
      DTO/serviço/resposta. Se manter geração automática, validar essa decisão.

### Transições e concorrência — preservar a autorização atual

Referências: fase 2, página 6, e fase 3, páginas 5 e 10.
Código: CargaQuimica.transicoes.ts e CargaQuimicaService.transicionar.

- [ ] Remover BLOQUEADA → EM_PREPARACAO: a fase 3 explicita que bloqueada só
      pode ser cancelada; a fase 2 também lista somente essa saída alternativa.
- [ ] Remover EM_MOVIMENTACAO → CANCELADA para seguir a matriz enumerada da fase 2;
      manter EM_MOVIMENTACAO → FINALIZADA. Qualquer desvio precisa de justificativa/aceitação.
- [ ] Atualizar testes dessas transições. Não recriar
      estados terminais, motivo obrigatório ou regra de documentação: já existem.
- [ ] Corrigir concorrência como ajuste de integridade do projeto, não requisito
      de mecanismo específico do PDF: ler/validar o estado de forma consistente e usar
      atualização condicional ou bloqueio, mantendo status/histórico na transação atual.
- [ ] Rejeitar operação baseada em estado desatualizado com erro consistente e
      sem criar movimentação; testar duas alterações simultâneas.

- [ ] Executar os testes afetados sem alterar as permissões por etapa nesta etapa.
      A operação completa pelo operador será concluída após a decisão de roles.

### Responsáveis técnicos — depende do modelo de roles

- [ ] Adequar getTecnicoAtivo ao modelo aprovado, preservando o vínculo existente
      e definindo quem é tecnicamente elegível. Vínculo e checagem de atividade já existem.
- [ ] Disponibilizar endpoint de consulta mínima dos responsáveis elegíveis/ativos
      e implementar os campos de resposta e as regras de elegibilidade.
      Reaproveitar o cadastro de usuários quando compatível com o modelo aprovado.

- [ ] Confirmar primeiro como a elegibilidade técnica será representada; retirar
      a exigência TECNICO somente se esse perfil for removido pela decisão da equipe.
      Coordenar DTOs, preservação dos responsáveis existentes e consulta para o formulário.

## Segurança e autorização dos módulos

**Depende das decisões de roles e primeiro acesso.** Aplicar as políticas aos módulos de usuários, produtos, cargas e documentos.

Referência: fase 3, páginas 5 e 9. Código: RolesGuard, controllers de produtos/cargas
e CargaQuimica.permissoes.ts.

- [ ] Liberar consultas de produtos/cargas, detalhes, transições e documentos
      para administrador, operador e despachante.
- [ ] Restringir criação/edição/inativação/exclusão de produtos, alterações de
      cargas, documentos e mudanças de status a operador/administrador.
- [ ] Adaptar permissões por etapa: operador deve preparar, inspecionar, bloquear,
      liberar, movimentar, finalizar e cancelar conforme a matriz; hoje várias ações
      exigem perfis antigos, e cancelar exige admin/gestor.
- [ ] Corrigir a combinação de permissões de classe/método no RolesGuard e separar
      consulta/escrita no controller de produtos. Hoje uma mesma lista vale para todos
      os métodos; não apenas acrescentar DESPACHANTE nessa lista ampla.
- [ ] Auditar rotas alternativas e operações sem decorator específico para garantir
      que despachante não altere dados por nenhum caminho, inclusive documentos e DELETE.
- [ ] Revisar rotas públicas além de login: /health, /health/db e /public/:file
      estão com SetPublic. Para seguir literalmente o PDF, proteger as rotas não destinadas
      a autenticação e adaptar consumidores/healthchecks; validar qualquer exceção adotada.
- [ ] Implementar a política de acesso ao endpoint Swagger e ao download da
      coleção, considerando que Swagger é registrado fora dos controllers protegidos.

- [ ] Se a equipe mantiver perfis antigos, ajustar a política para essa decisão;
      não remover acesso ou rejeitar um perfil sem o mapeamento aprovado na definição de roles.
- [ ] Atualizar testes de guards/controllers, autenticação por perfil, listagens,
      edição/exclusão por ID e caminhos alternativos de alteração.

## Banco, contratos e validação transversal

### Verificações durante as mudanças independentes

- [x] Atualizar testes de usuários para email, CreateUserDto/UpdateUserDto,
      status omitido/explícito, roles omitido e rejeição de password no PUT.
- [ ] Complementar os testes dos campos alterados de produtos/cargas, incluindo numeroONU.
- [x] Validar migrations de email/remoção de username em banco de testes limpo,
      mantendo roles e primeiro acesso atuais. Neste projeto os bancos são recriados
      do zero; conversão de dados de usuários legados não é necessária.

### Testes no PostgreSQL e E2E da substituição de username por email

- [x] Recriar banco de teste do zero pelas migrations; verificar que citext é criado
      antes de ser usado, User não possui username e email é obrigatório, CITEXT e único.
      O projeto permite reset; migração de dados legados não é necessária neste cenário.
- [x] Testar contra PostgreSQL real, sem mocks: cadastrar um email e rejeitar outro
      que difira apenas em maiúsculas/minúsculas; verificar também conflito em atualização.
- [x] Validar busca por email com caixa diferente e preservação da escrita original;
      confirmar que a unicidade é garantida pelo banco, inclusive em inserções simultâneas.
- [x] Validar via E2E criação → login por email → /me → edição sem password → novo login,
      recusando o email antigo e aceitando o novo com variação de caixa.
- [x] Validar retorno HTTP 409 para email duplicado em criação e edição na suíte real.

### E2E, CI e ambiente — antes da autorização final

- [x] Corrigir nos e2e a rota /api/produto-quimico para /api/produtos-quimicos
      e emitir tokens com token_use: 'access', mantendo os perfis atuais nos cenários.
- [x] Usar npm run test:all na CI existente do GitHub Actions, cobrindo unitários,
      HTTP com mocks e integração real, com serviço PostgreSQL exclusivo de testes.
- [x] Executar lint, build e todas as suítes do backend atual: 278 unitários,
      5 HTTP com mocks e 30 com PostgreSQL real aprovados.
- [x] Executar a regressão automatizada existente de documentos, motivos, terminais,
      executor, hash, inativos e login/refresh.
- [ ] Revalidar os testes após implementar as mudanças pendentes de transições
      e concorrência de cargas.
- [ ] Conferir a execução atual em Docker com API/banco e healthchecks,
      sem alterar ainda a política de acesso dos endpoints de monitoramento.

### Validação integrada

- [ ] Adaptar os testes ao modelo de roles e primeiro acesso realmente escolhidos,
      sem presumir perfil único ou remoção de perfis antes da decisão.
- [ ] Acrescentar casos das novas rotas: paginação/filtro, email inválido, login
      duplicado, rejeição de senha no PUT, perfil do ID, atribuição indevida de perfil e login pela rota errada.
- [ ] Verificar admin/operador executando o fluxo completo e despachante consultando,
      recebendo 403 em todas as alterações. Conferir 401 para chamadas sem autenticação.
- [ ] Testar edição de nome/email do único admin e recusa de sua inativação,
      exclusão lógica, inativos sem acesso e preservação de vínculos após migration.
- [ ] Revisitar os e2e corrigidos na etapa de E2E anterior à autorização final e adequar cenários à autorização final.
- [x] Incluir test:e2e na CI existente por meio de test:all, sem outra pipeline.
- [x] Executar a regressão automatizada atual de documentos, motivos, terminais,
      executor, login/refresh, hash/ocultação de senha e regras de produto/carga.
- [ ] Repetir a regressão após as futuras alterações de roles, autorização e cargas.
- [x] Validar reset e reaplicação das migrations em banco de testes limpo, com
      PostgreSQL em Docker e testes de integração de serviços e HTTP.
- [ ] Validar o seed e o ambiente completo de API/banco em Docker após as futuras
      alterações de inicialização e healthchecks. Migração de dados legados não se aplica.

## Fora das alterações obrigatórias de backend

Não há necessidade de recriar autenticação, trocar stack, introduzir microsserviços,
GraphQL/gRPC, novos módulos de despacho ou suporte a múltiplos perfis como exigência do PDF; o modelo de roles será decidido pela equipe. Paginação/filtro
são exigidos nas listas de usuários descritas acima; novos endpoints de busca/filtro
de cargas não são obrigatórios no escopo atual do backend.
