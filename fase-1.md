# Tech Challenge
## Fase 1:

Elaborar proposta técnica e arquitetural da aplicação "QuimiPort".

- Definir Dominio
- Definir regras de negócio
- Definir organização arquitetural
- TypeScript
- Qualidade de software

### Entendimento do domínio

A documentação deve responder perguntas como:

- Qual problema o sistema pretende resolver?
- Quem são os usuários envolvidos?
- Quais informações precisam ser controladas?
- Quais processos fazem parte da operação?
- Quais decisões precisam ser tomadas pelo sistema?
- Quais riscos ou restrições precisam ser considerados?
- Quais partes do sistema poderão evoluir nas próximas fases?

### Modelagem DDD

Elaborar proposta de modelagem DDD, deve conter:

- Exemplo de Entidades
  - Produto Químico (ChemicalProducts)
  - Carga Química (ChemicalLoads)
  - Responsável Técnico (TechnicalResponsibles)
  - Documento da Carga (LoadDocuments)
  - Inspeção (Inspections)
  - Área de Armazenamento (StorageAreas)
- Objetos de valor
- Agregados
- Casos de uso
- Regras de negócio
- Linguagem ubíqua

#### Entidades

Entidades devem conter:

- Nome da entidade
- Responsabilidade
- Atributos
- Regras relacionadas
- Relacionamento com outras entidades

#### Objetos de valor

Definir quais entidades são Objetos de valor

#### Agregados

Definir quais entidades são Objetos agregados
Sugestão de agregado principal: Carga Química (ChemicalLoads).

Carga Química (ChemicalLoads) pode concentrar regras relacionadas a:

- Produto químico associado
- Quantidade
- Documentação
- Responsável técnico
- Status
- Inspeção
- Liberação
- Bloqueio
- Histórico

#### Casos de uso

Mapear os casos de uso planejados para a aplicação, exemplos:

- Cadastrar produto químico
- Inativar produto químico
- Registrar carga química
- Validar documentação da carga
- Solicitar inspeção
- Liberar carga química
- Bloquear carga química
- Atualizar status da carga
- Cancelar carga química
- Consultar cargas por status
- Consultar histórico da carga

Cada caso de uso deve descrever:

- Objetivo do caso de uso
- Ator envolvido
- Entrada esperada
- Saída esperada
- Principais regras de negócio
- Possíveis erros ou exceções

#### Regras de negócio

Levantamento de requisitos do sistema, indicando onde cada regra de negócio deve ficar na arquitetura do sistema
Exemplos:

- Uma carga química não pode ser registrada sem produto químico associado
- Uma carga química não pode ser registrada com produto químico inativo
- Uma carga química não pode ser registrada sem classificação de risco
- Uma carga química não pode ser liberada sem documentação obrigatória
- Uma carga bloqueada não pode entrar em movimentação
- Uma carga cancelada não pode ser liberada
- Uma carga em inspeção não pode ser finalizada sem antes ser liberada
- Um produto químico não pode ser cadastrado sem nome
- Um produto químico não pode ser cadastrado sem classe de risco
- Um produto químico inativo não pode ser usado em novas cargas
- A quantidade da carga deve ser maior que zero
- Toda carga deve possuir um responsável técnico informado.

### Entregas

#### Proposta de Arquitetura

Deverá ser proposta uma arquitetura inicial para o projeto separando responsabilidades

#### Organização do projeto

Deverá ser elaborada uma organização inicial da estrutura de pastas do projeto assim como as responsábilidades das mesmas

#### Diagramas

Deverão ser entregues diagramas para compreensão da solução
Diagramas sugeridos:

- Diagrama de domínio (obrigatório)
- Fluxo de status da carga química (obrigatório)
- Diagrama de contexto da aplicação
- Diagrama de entidades e relacionamentos conceituais
- Diagrama de casos de uso
- Diagrama de arquitetura em camadas

#### Planejamento de qualidade de software

Elaboração de um plano de qualidade apresentando como o projeto poderá ser testado nas próximas fases,
Deve conter no minimo:

- Quais regras de negócio precisam ser testadas
- Quais casos de uso são mais críticos
- Quais tipos de teste serão utilizados
- Como o grupo pretende aplicar testes unitários
- Como o grupo pretende aplicar testes de integração futuramente
- Como o grupo pretende validar fluxos principais
- Como o grupo pretende organizar mocks e dados simulados

Exemplos de cenários de teste planejados:

- Não permitir cadastro de produto químico sem classe de risco
- Não permitir registro de carga com produto químico inativo
- Não permitir liberação de carga sem documentação obrigatória
- Não permitir movimentação de carga bloqueada
- Permitir liberação de carga com documentação válida
- Validar quantidade maior que zero
- Validar transição de status da carga

#### Aplicação de Javascript Avançado e Typescript

Explicação de como serão utilizados os conceitos de Javascript Avançado e Typescript no projeto, exemplificando decisões como:

- Uso de tipagem forte
- Uso de interfaces
- Uso de classes, quando fizer sentido
- Uso de enums para status e classificações
- Uso de funções puras para validações
- Uso de módulos ES6+
- Uso de async/await em integrações futuras
- Uso de generics, quando aplicável
- Tratamento de erros
- Organização de contratos e tipos compartilhados

#### Repositório

Entrega deverá conter o link do repositório Git do projeto.
(https://gitlab.com/fiap2481527/tech-challenge/fase-1)

Não precisa conter uma aplicação funcional, o objetivo é organizar os
artefatos técnicos que servirão como base para a construção da aplicação nas
próximas fases.

O repositório deve conter:

- README do projeto, apresentando o nome da solução, o contexto do problema, o objetivo da aplicação e a forma de navegação pela documentação
- Documentação do domínio, contendo linguagem ubíqua, entidades, objetos de valor, agregados e principais regras de negócio
- Documentação dos casos de uso planejados
- Documentação da arquitetura proposta, explicando as camadas da aplicação, suas responsabilidades e como o projeto poderá evoluir
- Diagramas que ajudem a representar o domínio, os casos de uso, o fluxo de status da carga e a arquitetura planejada

#### Vídeo Demonstrativo

Apresentação tecnica do projeto "QuimiPort"

O vídeo (duração entre 5 a 10 minutos) deve apresentar:

- O problema escolhido e o contexto da aplicação
- A proposta do QuimiPort
- Os principais usuários envolvidos
- A linguagem ubíqua definida pela equipe
- As entidades, objetos de valor e agregados mapeados
- Os principais casos de uso planejados
- As regras de negócio mais importantes
- A arquitetura proposta para a aplicação
- Os diagramas criados pela equipe
- O plano de qualidade de software
- O roadmap de evolução do projeto nas próximas fases
