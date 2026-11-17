# TODO — adequações do backend para a fase 3

Revisão: 17/11/2026. Base: releitura dos três PDFs e do backend atual.
Este arquivo é planejamento; não altera a aplicação. Última validação após a
separação dos DTOs de usuários: build aprovado; 261 testes unitários passaram e 4
falharam; 20 testes de integração com PostgreSQL real passaram e 3 falharam. O reset
e todas as migrations do banco de testes foram executados com sucesso. As falhas
e os ajustes pendentes estão detalhados no módulo de usuários.
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

Testar cada alteração durante sua implementação. Preparar dados e
DTOs não significa publicar endpoints sem a autorização final. Itens bloqueados
por decisões estão indicados nas respectivas seções.

## Módulo de produtos químicos

Referências: fase 2, páginas 3–4; fase 3, páginas 10–11.

- [x] Adicionar numeroONU ao produto em schema/migration, DTOs de entrada/saída e serviços. A fase 2 admite código simulado.
- [x] Incluir numeroONU em ProdutoResumoDto na resposta da carga. O @Expose atual
      não inclui o campo; apenas adicioná-lo ao banco não o disponibiliza nos detalhes.

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
- [ ] Concluir os contratos de edição por perfil: administrador recebe nome/email;
      operador/despachante permite senha opcional. Hoje UpdateUserDto rejeita password
      com 400; ainda não há suporte à troca opcional de senha.
- [ ] Preservar roles atuais quando o corpo de edição não os informa; hoje o serviço
      usa body.roles ?? [] e apaga os perfis nesse caso.
- [ ] Preservar status quando omitido na edição; o default true herdado de BaseUserDto
      pode reativar um usuário inativo ao editar apenas nome/email.
- [ ] Preparar DTOs/serviços de edição sem mudar a política de acesso atual;
      manter hash/email/perfil quando não houver alteração prevista. As novas rotas
      e a revisão da proteção do administrador ficam nas etapas dependentes de roles.

### Testes da remoção de username e inclusão de email

- [ ] Atualizar fixtures, mocks e testes para CreateUserDto/UpdateUserDto:
      User.request.dtos.spec.ts ainda importa CreateOrUpdateUserDto, que foi removido;
      três testes de DTO falham. Preservar os cenários de email obrigatório/inválido.
- [ ] Atualizar User.service.spec.ts para esperar preservação de senha na edição:
      o teste antigo ainda espera password: 'updated-hash' no UPDATE e falha.
- [ ] Atualizar os payloads de PUT nos testes HTTP para o contrato atual sem password;
      três cenários recebem 400 antes de validar resposta, conflito e novo login.
- [ ] Revalidar que respostas de criação, consulta, edição e /me expõem email,
      não expõem username e ocultam senha/hash após adaptar o payload de edição;
      o teste HTTP correspondente atualmente para no PUT com 400.
- [x] Testar edição de email e conflito com email de outro usuário no serviço/banco,
      inclusive com diferenças de caixa.
- [ ] Revalidar o conflito de email na edição HTTP (409) com o novo UpdateUserDto;
      o teste atual envia password e recebe 400 na validação do corpo.
- [ ] Testar edição sem senha verificando que o hash persistido permanece idêntico e
      que PasswordService.hash não é chamado; testar também a rejeição de password no PUT atual.
- [ ] Implementar e testar preservação de roles e status quando omitidos na edição,
      incluindo edição de usuário inativo sem reativação acidental.
- [x] Definir e testar o tratamento do campo legado username nas requisições;
      garantir que não seja exigido nem usado como identificador após a remoção.
      A ValidationPipe com forbidNonWhitelisted retorna 400 quando username é enviado,
      inclusive junto de email válido, na criação, edição, login e primeiro acesso.
- [ ] Alinhar os contratos acima e as rotas por perfil abaixo ao uso de email como
      identificador, sem reintroduzir username.

### Evidências e pendências da revisão de usuários

- **Validação atual:** `npm run build` passou; `npm test` teve 261 aprovações e
  4 falhas (3 DTOs e 1 expectativa antiga de hash no update). `npm run test:integration`
  teve 20 aprovações e 3 falhas HTTP nos PUTs que ainda enviam password.
- **Banco:** os 14 testes de serviço/banco passaram após reset e migrations;
  dos 9 casos HTTP, 6 passaram. Revalidar os cenários de edição após adaptar seus payloads.
- **Concluído por revisão do código:** DTOs distintos e update sem gravação/recalculo
  de senha. Falta teste específico da preservação exata do hash no banco.
- **Edição ainda incompleta:** UpdateUserDto não permite senha opcional, roles omitido
  vira [] e status omitido recebe true pelo default herdado. A política de acesso atual
  permanece; as rotas de edição por perfil continuam pendentes.
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

| Feito | Método e rota                   | Entrada                     |
| ----- | ------------------------------- | --------------------------- |
| [ ]   | GET /administradores            | pagina, limite              |
| [ ]   | PUT /administradores/:id        | nome, email                 |
| [ ]   | DELETE /administradores/:id     | id                          |
| [ ]   | POST /operadores                | nome, email, login, senha   |
| [ ]   | GET /operadores                 | pagina, limite, login       |
| [ ]   | PUT /operadores/:id             | nome, email, senha opcional |
| [ ]   | DELETE /operadores/:id          | id                          |
| [ ]   | POST /operadores/autenticacao   | login, senha                |
| [ ]   | POST /despachantes              | nome, email, login, senha   |
| [ ]   | GET /despachantes               | pagina, limite, login       |
| [ ]   | PUT /despachantes/:id           | nome, email, senha opcional |
| [ ]   | DELETE /despachantes/:id        | id                          |
| [ ]   | POST /despachantes/autenticacao | login, senha                |

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

- [ ] Atualizar testes dos campos/DTOs afetados.
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
- [ ] Revalidar via E2E criação → login por email → /me → edição de email → novo login
      com PUT sem password; o cenário atual falha com 400. A troca e o novo login
      continuam passando no teste de serviço/banco.
- [ ] Revalidar retorno HTTP 409 para email duplicado em criação e edição na suíte real
      após adaptar o corpo do PUT ao novo contrato.

### E2E, CI e ambiente — antes da autorização final

- [ ] Corrigir nos e2e a rota /api/produto-quimico para /api/produtos-quimicos
      e emitir tokens com token_use: 'access', mantendo os perfis atuais nos cenários.
- [ ] Incluir npm run test:e2e na CI existente após corrigir os testes.
- [ ] Executar lint, build e testes dos módulos de dados e integridade de cargas; fazer regressão de documentos,
      motivos, terminais, executor, hash, inativos e login/refresh existentes.
- [ ] Conferir a execução atual em Docker com API/banco e healthchecks,
      sem alterar ainda a política de acesso dos endpoints de monitoramento.

### Validação integrada

- [ ] Adaptar os testes ao modelo de roles e primeiro acesso realmente escolhidos,
      sem presumir perfil único ou remoção de perfis antes da decisão.
- [ ] Acrescentar casos das novas rotas: paginação/filtro, email inválido, login
      duplicado, senha opcional, perfil do ID, atribuição indevida de perfil e login pela rota errada.
- [ ] Verificar admin/operador executando o fluxo completo e despachante consultando,
      recebendo 403 em todas as alterações. Conferir 401 para chamadas sem autenticação.
- [ ] Testar edição de nome/email do único admin e recusa de sua inativação,
      exclusão lógica, inativos sem acesso e preservação de vínculos após migration.
- [ ] Revisitar os e2e corrigidos na etapa de E2E anterior à autorização final e adequar cenários à autorização final.
- [ ] Incluir npm run test:e2e na CI existente; não criar outra pipeline do zero.
- [ ] Executar regressão de documentos, motivos, terminais, executor, login/refresh,
      hash/ocultação de senha e regras de produto/carga existentes.
- [ ] Executar lint, build, testes e migrations/seed em banco limpo e com dados anteriores;
      verificar a integração entre API e banco em Docker após alterações de contratos/healthchecks.

## Fora das alterações obrigatórias de backend

Não há necessidade de recriar autenticação, trocar stack, introduzir microsserviços,
GraphQL/gRPC, novos módulos de despacho ou suporte a múltiplos perfis como exigência do PDF; o modelo de roles será decidido pela equipe. Paginação/filtro
são exigidos nas listas de usuários descritas acima; novos endpoints de busca/filtro
de cargas não são obrigatórios no escopo atual do backend.
