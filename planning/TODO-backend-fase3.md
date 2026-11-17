# TODO — adequações do backend para a fase 3

Revisão: 17/11/2026. Base: releitura dos três PDFs e do backend atual.
Este arquivo é planejamento; não altera a aplicação. Revisão por leitura de
código, sem execução de testes, migrations, navegador ou Docker nesta revisão.
As páginas são a posição no PDF. Este é o checklist revisado específico de backend;
nos pontos de divergência, substitui as descrições anteriores de backend no planejamento.

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
5. Validar a integração e concluir documentação e entrega.

Testar e documentar cada alteração durante sua implementação. Preparar dados e
DTOs não significa publicar endpoints sem a autorização final. Itens bloqueados
por decisões estão indicados nas respectivas seções.

## Módulo de produtos químicos

Referências: fase 2, páginas 3–4; fase 3, páginas 10–11.

- [x] Adicionar numeroONU ao produto em schema/migration, DTOs de entrada/saída e serviços. A fase 2 admite código simulado; se adotado, documentar essa identificação.
- [x] Incluir numeroONU em ProdutoResumoDto na resposta da carga. O @Expose atual
      não inclui o campo; apenas adicioná-lo ao banco não o disponibiliza nos detalhes.

## Módulo de usuários

### Dados e contratos — pode avançar

Referência: fase 3, páginas 6–11. Preservar roles e primeiro acesso atuais.

- [x] Adicionar email por migration, validar formato e definir como preencher
      usuários existentes. Email único é decisão a documentar; login único já existe.
- [ ] Expor nome/email/login/senha nas entradas previstas pelo PDF, mapeando
      internamente para name/username/password se desejado, sem renomear banco por obrigação.
- [ ] Separar DTOs de criação/edição: edição de admin recebe nome/email;
      edição de operador/despachante recebe nome/email e senha opcional.
- [ ] Adaptar update para não exigir login nem gerar novo hash sem senha nova,
      e preservar roles atuais quando o corpo não os informa.
- [ ] Preparar DTOs/serviços de edição sem mudar a política de acesso atual;
      manter hash/login/perfil quando não houver alteração prevista. As novas rotas
      e a revisão da proteção do administrador ficam nas etapas dependentes de roles.

### Testes da remoção de username e inclusão de email

- [ ] Atualizar fixtures, mocks e testes de DTOs/serviços/controllers para usar email;
      validar criação sem username, email obrigatório e rejeição de email inválido.
- [ ] Verificar que respostas de criação, consulta, edição e /me expõem email,
      não expõem username e continuam ocultando senha/hash.
- [ ] Testar edição de email, conflito com email de outro usuário e preservação
      de senha/hash e roles quando esses campos não forem alterados.
- [ ] Definir e testar o tratamento do campo legado username nas requisições;
      garantir que não seja exigido nem usado como identificador após a remoção.
- [ ] Alinhar os contratos acima e as rotas por perfil abaixo ao uso de email como
      identificador; documentar a diferença em relação ao campo login previsto no PDF.

### Roles e proteção do administrador — depende da equipe

Definir o modelo antes de implementar; as alternativas abaixo não são escolhas aprovadas.

- [ ] Definir perfil único ou múltiplos perfis e sua representação em User,
      DTOs, /me, tokens e contexto autenticado.
- [ ] Definir se os cinco perfis antigos serão removidos e como representar os
      três tipos de acesso da fase 3, incluindo DESPACHANTE, ausente no enum atual.
- [ ] Definir destino de usuários/perfis combinados e política de sessões antigas;
      preservar vínculos/histórico e não promover usuários automaticamente a admin.
- [ ] Implementar as decisões em migrations, enums, serviços, decorators e guards;
      atualizar contratos em conjunto com o frontend e rejeitar entradas incompatíveis.
- [ ] Adaptar a proteção do último administrador ao modelo escolhido e corrigir
      validateUniqueAdmin para permitir editar nome/email do único admin ativo.
      Hoje a chamada em qualquer update bloqueia essa edição.
- [ ] Definir/documentar exclusão lógica e preservar a checagem de inativos já
      existente em login, AuthGuard e refresh; não recriar essa proteção.

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
- [ ] Registrar a política das demais operações de usuários: proposta é admin
      gerenciar admins/operadores e admin/operador gerenciar despachantes. O PDF não
      especifica todos os acessos de listagem/edição/exclusão; isso é decisão do projeto.
- [ ] Restringir listas ao perfil correspondente e validar perfil do ID antes de
      editar/excluir: rota de despachante não pode atingir admin/operador.
- [ ] Acrescentar paginação com valores positivos, limite máximo, ordenação estável
      e filtro por login onde previsto; definir/documentar o formato da resposta.
- [ ] Reutilizar login/hash/JWT, acrescentando conferência do perfil da rota.
      Preservar caminho de login do admin e o refresh que a interface já utiliza.
- [ ] Revisar /users genérico: remover ou restringir/adaptar o que permanecer,
      evitando caminhos alternativos que contornem as novas políticas.

## Módulo de autenticação e primeiro acesso

**Aguardar a decisão da equipe sobre roles e estratégia de inicialização antes de implementar.**

Referência: fase 3, página 9. Seed/script é exigido; a substituição do fluxo atual
será implementada após a equipe definir a estratégia.

- [ ] Definir como seed/script coexistirá com ou substituirá o fluxo atual e
      registrar a decisão. Manter first_access/setup intactos até essa definição.
- [ ] Criar seed/script do primeiro administrador conforme o modelo de roles
      definido, com hash de senha, email e instruções de execução.
- [ ] Adequar POST /users/first_access e GET /login/setup conforme a decisão,
      coordenando a interface; não manter cadastro público sem avaliar sua adequação ao PDF.
- [ ] Atualizar mensagens do AuthGuard e logs de main.ts; alinhar o retorno 412
      atual quando não há usuários ativos com o fluxo inicial finalmente adotado.
- [ ] Validar inicialização em banco limpo, nova execução do mecanismo e acesso do admin.

### Testes de autenticação por email

- [ ] Testar login com email e senha, incluindo variações de maiúsculas/minúsculas,
      email inexistente, senha incorreta e usuário inativo.
- [ ] Atualizar os testes de JWT, refresh, AuthGuard e /me para não depender de
      username; manter identificação por ID e as verificações de atividade/permissões.
- [ ] Testar o primeiro acesso/setup com email, preservando a estratégia atual
      até a decisão da equipe; atualizar o teste do seed quando ele for implementado.

## Módulo de cargas químicas

### Dados, código e integração de documentos — pode avançar

- [ ] Definir código da carga: hoje é CQ derivado do ID; fase 3 inclui campo no
      formulário. Se aceitar código informado, criar persistência/unicidade e adaptar
      DTO/serviço/resposta. Se manter geração automática, registrar a diferença e validar aceitação.
- [ ] Entregar às frentes de interface os contratos alterados e a sequência existente
      criar carga → anexar documentos → validar. Upload já é separado; retomada dos anexos
      é principalmente integração da interface, sem novo cadastro de carga.

### Transições e concorrência — preservar a autorização atual

Referências: fase 2, página 6, e fase 3, páginas 5 e 10.
Código: CargaQuimica.transicoes.ts e CargaQuimicaService.transicionar.

- [ ] Remover BLOQUEADA → EM_PREPARACAO: a fase 3 explicita que bloqueada só
      pode ser cancelada; a fase 2 também lista somente essa saída alternativa.
- [ ] Remover EM_MOVIMENTACAO → CANCELADA para seguir a matriz enumerada da fase 2;
      manter EM_MOVIMENTACAO → FINALIZADA. Qualquer desvio precisa de justificativa/aceitação.
- [ ] Atualizar testes, exemplos e diagramas dessas transições. Não recriar
      estados terminais, motivo obrigatório ou regra de documentação: já existem.
- [ ] Corrigir concorrência como ajuste de integridade do projeto, não requisito
      de mecanismo específico do PDF: ler/validar o estado de forma consistente e usar
      atualização condicional ou bloqueio, mantendo status/histórico na transação atual.
- [ ] Rejeitar operação baseada em estado desatualizado com erro documentado e
      sem criar movimentação; testar duas alterações simultâneas.
- [ ] Documentar CADASTRADA = “Registrada” e EM_PREPARACAO = “Em análise”.
      A troca dos rótulos é tarefa de frontend; não é necessário renomear os enums do banco.

- [ ] Executar os testes afetados sem alterar as permissões por etapa nesta etapa.
      A operação completa pelo operador será concluída após a decisão de roles.

### Responsáveis técnicos — depende do modelo de roles

- [ ] Adequar getTecnicoAtivo ao modelo aprovado, preservando o vínculo existente
      e definindo quem é tecnicamente elegível. Vínculo e checagem de atividade já existem.
- [ ] Disponibilizar consulta mínima dos responsáveis elegíveis/ativos para o
      formulário e documentar seu cadastro. O PDF exige responsável informado, mas não
      exige cadastro próprio ou tela nova; escolher a solução mais simples para o projeto.

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
      a autenticação e adaptar consumidores/healthchecks; qualquer exceção exige decisão
      documentada e validação de sua aceitação.
- [ ] Definir/documentar também o acesso à documentação Swagger e ao download da
      coleção, considerando que Swagger é registrado fora dos controllers protegidos.

- [ ] Se a equipe mantiver perfis antigos, ajustar a política para essa decisão;
      não remover acesso ou rejeitar um perfil sem o mapeamento aprovado na definição de roles.
- [ ] Atualizar testes de guards/controllers, autenticação por perfil, listagens,
      edição/exclusão por ID e caminhos alternativos de alteração.

## Banco, contratos e validação transversal

### Verificações durante as mudanças independentes

- [ ] Atualizar testes dos campos/DTOs afetados e Swagger dos contratos já existentes.
- [ ] Validar migrations dos novos campos em banco limpo e com dados anteriores,
      mantendo as estruturas de roles e primeiro acesso atuais.

### Testes no PostgreSQL e E2E da substituição de username por email

- [ ] Recriar banco de teste do zero pelas migrations; verificar que citext é criado
      antes de ser usado, User não possui username e email é obrigatório, CITEXT e único.
      O projeto permite reset; migração de dados legados não é necessária neste cenário.
- [ ] Testar contra PostgreSQL real, sem mocks: cadastrar um email e rejeitar outro
      que difira apenas em maiúsculas/minúsculas; verificar também conflito em atualização.
- [ ] Validar busca por email com caixa diferente e preservação da escrita original;
      confirmar que a unicidade é garantida pelo banco, inclusive em inserções simultâneas.
- [ ] Cobrir via E2E criação → login por email → /me → edição de email → novo login;
      verificar que o email antigo deixa de autenticar e o novo funciona com caixa diferente.
- [ ] Atualizar exemplos e coleção usados nos E2E para remover dependências de username
      e conferir o erro HTTP documentado para email duplicado.

### E2E, CI e ambiente — antes da autorização final

- [ ] Corrigir nos e2e a rota /api/produto-quimico para /api/produtos-quimicos
      e emitir tokens com token_use: 'access', mantendo os perfis atuais nos cenários.
- [ ] Incluir npm run test:e2e na CI existente após corrigir os testes.
- [ ] Executar lint, build e testes dos módulos de dados e integridade de cargas; fazer regressão de documentos,
      motivos, terminais, executor, hash, inativos e login/refresh existentes.
- [ ] Conferir a execução atual em Docker com API/banco e healthchecks,
      sem alterar ainda a política de acesso dos endpoints de monitoramento.
- [ ] Registrar contratos entregues e decisões ainda pendentes para Front 1/Front 2.

### Validação integrada, documentação e entrega

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
      verificar Docker/API/banco e integração com frontend após alterações de contratos/healthchecks.
- [ ] Atualizar Swagger, exemplos/coleção e README: campos, rotas, perfis, erros,
      paginação, exclusão, seed, técnicos, variáveis e execução local/Docker/testes.
- [ ] Ajustar sua parte dos diagramas/documentos e gravar o trecho do backend no
      vídeo integrado, incluindo decisões e desafios; cada frente cuida de seu material.
- [ ] Conferir com Front 1/Front 2 as mudanças de contrato, seleção de técnicos,
      documentos, login, proteção por perfil e tratamento de erros.

## Fora das alterações obrigatórias de backend

Não há necessidade de recriar autenticação, trocar stack, introduzir microsserviços,
GraphQL/gRPC, novos módulos de despacho ou suporte a múltiplos perfis como exigência do PDF; o modelo de roles será decidido pela equipe. Paginação/filtro
são exigidos nas listas de usuários descritas acima; busca/filtro das cargas podem
continuar na interface sobre o GET existente, sem novo endpoint obrigatório.
