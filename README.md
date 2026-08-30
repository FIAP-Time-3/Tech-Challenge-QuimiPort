# 🧪 QuimiPort

### Sistema de Gestão de Cargas Químicas em Ambiente Portuário

> **FIAP POSTECH — Full Stack Development | Tech Challenge — Fase 1**

---

## 📋 Sobre o projeto

O **QuimiPort** é uma proposta de sistema para gestão de cargas químicas em ambiente portuário, desenvolvida como parte do **Tech Challenge da FIAP — Fase 1**.

A solução foi concebida para organizar e controlar informações relacionadas a **produtos químicos, cargas, classificação de risco, documentação, responsáveis, inspeções, movimentações e histórico operacional**.

O problema central identificado é a existência de processos manuais ou descentralizados, que dificultam a consulta das informações, o acompanhamento do status das cargas e a validação de regras importantes de segurança.

O sistema proposto busca transformar esse processo em um fluxo controlado, no qual as principais decisões operacionais sejam baseadas em **regras de negócio explícitas**, garantindo rastreabilidade e evitando que uma carga avance para um estado inválido.

---

## 🎯 Objetivo

O objetivo do QuimiPort é estabelecer uma **base técnica e arquitetural evolutiva** para uma futura aplicação full stack capaz de registrar, controlar e acompanhar cargas químicas portuárias.

Entre os principais objetivos estão:

- Cadastrar produtos químicos;
- Controlar a classificação de risco dos produtos;
- Registrar cargas químicas;
- Associar cargas aos respectivos produtos;
- Controlar documentação obrigatória;
- Definir e acompanhar responsáveis técnicos;
- Realizar inspeções;
- Controlar o ciclo de vida da carga;
- Permitir bloqueio ou liberação conforme as regras de negócio;
- Registrar o histórico das movimentações;
- Restringir ações conforme perfil e etapa operacional;
- Preservar rastreabilidade e auditoria;
- Estabelecer uma estratégia de testes para as futuras implementações.

A proposta está alinhada ao objetivo da primeira fase do Tech Challenge, que busca consolidar os conhecimentos de **JavaScript Avançado, TypeScript, Domain Driven Design e Qualidade de Software**.

---

## ⚓ Contexto do problema

O desafio proposto pela FIAP utiliza como contexto as operações logísticas do **Porto de Santos**, onde cargas químicas exigem cuidados específicos relacionados à classificação de risco, documentação e acompanhamento técnico.

Uma carga química possui um ciclo de vida que precisa ser controlado.

Por exemplo:

- uma carga sem documentação válida não pode ser liberada;
- uma carga bloqueada não pode iniciar sua movimentação;
- uma carga finalizada não pode receber novas movimentações;
- uma carga cancelada não pode voltar ao fluxo operacional;
- produtos inativos não podem ser utilizados em novas cargas.

Dessa forma, o QuimiPort não trata uma carga apenas como um cadastro, mas como uma entidade que percorre um **fluxo operacional controlado por regras de negócio**.

---

## 🔄 Ciclo de vida da carga

O fluxo principal definido para uma carga química é:

```text
CADASTRADA
     │
     ▼
EM_PREPARACAO
     │
     ▼
EM_INSPECAO
     │
     ├──────────────► BLOQUEADA
     │                    │
     │                    ▼
     │              EM_PREPARACAO
     │
     ▼
LIBERADA
     │
     ▼
EM_MOVIMENTACAO
     │
     ▼
FINALIZADA
```

Em situações excepcionais, uma carga pode ser **cancelada antes da finalização**, desde que exista um motivo registrado.

A máquina de estados definida no projeto restringe as transições possíveis e impede movimentações inválidas.

### Principais status

| Status | Descrição |
|---|---|
| `CADASTRADA` | Estado inicial da carga |
| `EM_PREPARACAO` | Preparação técnica e documental |
| `EM_INSPECAO` | Carga aguardando análise |
| `LIBERADA` | Carga aprovada para movimentação |
| `BLOQUEADA` | Carga impedida de avançar devido a inconsistências |
| `EM_MOVIMENTACAO` | Transporte/movimentação em andamento |
| `FINALIZADA` | Operação concluída |
| `CANCELADA` | Operação encerrada excepcionalmente |

---

## 🧩 Modelagem de domínio

A modelagem do QuimiPort utiliza conceitos de **Domain Driven Design (DDD)**.

O agregado principal definido é a **`CargaQuimica`**, responsável por concentrar as decisões que precisam manter consistência dentro do fluxo operacional.

O agregado protege, entre outras, as seguintes invariantes:

- toda carga possui produto, quantidade, unidade e destino;
- novas cargas somente podem utilizar produtos ativos;
- a classificação de risco da carga é herdada do produto;
- o produto somente pode ser alterado enquanto a carga estiver `CADASTRADA`;
- toda transição válida gera uma movimentação;
- estados terminais não permitem novas movimentações;
- a liberação depende da documentação obrigatória validada.

### Principais entidades

- `ProdutoQuimico`
- `CargaQuimica`
- `Movimentacao`
- `DocumentoCarga`
- `Inspecao`
- `Usuario`

### Objetos de valor

Entre os principais objetos de valor estão:

- `ClasseRiscoONU`
- `Quantidade`
- `UnidadeMedida`
- `Destino`
- `StatusCarga`
- `Auditoria`
- `Motivo`

A documentação completa apresenta as responsabilidades, atributos, relacionamentos e regras associadas a cada elemento do domínio.

---

## 👥 Perfis envolvidos

O domínio contempla diferentes perfis de usuários, cada um com responsabilidades específicas:

| Perfil | Responsabilidade |
|---|---|
| **Administrador** | Administração geral do sistema e acesso às etapas da carga |
| **Gestor operacional** | Acompanhamento e condução das etapas operacionais |
| **Operador portuário** | Atuação nas etapas de liberação e movimentação |
| **Responsável técnico** | Preparação e correção técnica das cargas |
| **Analista de documentação** | Organização e anexação dos documentos obrigatórios |
| **Analista de qualidade** | Realização da inspeção |
| **Inspetor responsável** | Validação das informações durante a inspeção |

A definição dos perfis e respectivas responsabilidades faz parte da modelagem do domínio apresentada na documentação técnica.

---

## 📐 Diagramas

Os diagramas que compõem a modelagem e a arquitetura do QuimiPort estão disponíveis na pasta [`docs/diagramas`](./docs/diagramas/).

| Diagrama | Descrição |
|---|---|
| [Diagrama de Domínio](./docs/diagramas/4.5_diagrama_de_dominio.md) | Representação das principais entidades, agregados e relacionamentos do domínio. |
| [Diagrama de Casos de Uso](./docs/diagramas/6.1_diagrama_de_casos_de_uso.md) | Principais casos de uso e atores envolvidos. |
| [Diagrama de Arquitetura](./docs/diagramas/8.3_diagrama_de_arquitetura.md) | Organização arquitetural e responsabilidades das camadas. |
| [Contexto de Aplicação](./docs/diagramas/8.5_contexto_da_aplicacao.md) | Representação do contexto de aplicação. |
| [Pirâmide de Testes](./docs/diagramas/10.3_piramide_de_testes.md) | Estratégia e níveis de testes planejados para o projeto. |



---

### Mapa de Contexto

Representa o contexto delimitado do QuimiPort e as integrações externas previstas para a evolução da solução.

| [Mapa de Contexto](./docs/diagramas/4.7_mapa_de_contexto.md) | Contexto delimitado e relacionamentos com sistemas externos. |


O QuimiPort é inicialmente tratado como um contexto delimitado único, com integrações futuras previstas para identidade, armazenamento de documentos, órgãos reguladores e notificações.

---

### Fluxo de Status

Representa a máquina de estados da carga química e as condições necessárias para cada transição.

| [Diagrama de Transição](./docs/diagramas/7.1_diagrama_de_transicao.md) | Fluxo de transição dos status da carga química. |

O fluxo foi projetado para impedir que cargas avancem para etapas incompatíveis com seu estado atual ou com os requisitos de segurança definidos.

---

## 🏗️ Arquitetura proposta

A arquitetura planejada para o QuimiPort utiliza um **monólito modular em TypeScript**, organizado por camadas e orientado por **portas e adaptadores**.

A escolha busca reduzir a complexidade operacional inicial, mantendo fronteiras claras entre as responsabilidades e permitindo uma futura evolução para serviços independentes quando houver necessidade concreta.

### Camadas

```text
┌─────────────────────────────────────┐
│          Apresentação / API         │
├─────────────────────────────────────┤
│             Aplicação               │
├─────────────────────────────────────┤
│              Domínio                │
├─────────────────────────────────────┤
│           Infraestrutura            │
└─────────────────────────────────────┘
```

**Apresentação**
- API REST;
- Controllers;
- Validação de entrada;
- Serialização;
- Autenticação de entrada.

**Aplicação**
- Casos de uso;
- Autorização;
- Transações;
- Coordenação dos repositórios;
- Publicação de eventos.

**Domínio**
- Entidades;
- Objetos de valor;
- Agregados;
- Regras de negócio;
- Contratos;
- Erros de domínio.

**Infraestrutura**
- Persistência;
- ORM;
- Banco de dados;
- Armazenamento de documentos;
- Mensageria;
- Integrações externas.

---

## 🧪 Qualidade de Software

A estratégia de qualidade foi definida com foco em **impedir estados operacionais inválidos e manter evidências auditáveis das decisões tomadas pelo sistema**.

A estratégia contempla diferentes níveis de testes:

| Tipo | Objetivo |
|---|---|
| **Unitários** | Validar entidades, objetos de valor, políticas e máquina de estados |
| **Aplicação** | Validar casos de uso, autorização e orquestração |
| **Integração** | Validar banco, API, armazenamento e contratos externos |
| **Aceitação** | Validar os principais fluxos de negócio |



Entre os cenários prioritários estão:

- impedir cadastro de produto sem classe de risco;
- impedir cadastro de produto duplicado;
- impedir carga com produto inativo;
- impedir quantidade menor ou igual a zero;
- impedir liberação sem documentação validada;
- impedir movimentação de carga bloqueada;
- validar as transições de status;
- preservar o histórico das movimentações;
- validar permissões conforme o perfil do usuário.

Esses cenários estão alinhados aos exemplos de testes exigidos no desafio da FIAP.

---

## 💻 JavaScript e TypeScript

A futura implementação do QuimiPort utilizará **TypeScript** como linguagem principal, explorando os recursos necessários para manter contratos claros, tipagem forte e baixo acoplamento.

Entre as decisões previstas estão:

- Tipagem forte;
- Interfaces;
- Classes quando fizer sentido para o domínio;
- Enums para status e classificações;
- Funções puras para validações;
- Módulos ES6+;
- `async/await` para integrações;
- Generics quando aplicável;
- Tratamento estruturado de erros;
- Contratos e tipos compartilhados.

Esses pontos fazem parte dos requisitos técnicos previstos para a primeira fase do Tech Challenge.

---

## 📚 Documentação

A documentação técnica completa está disponível em:

📄 **[Documentação Técnica e Arquitetural](./docs/documentacao_tecnica.md)**

O documento apresenta detalhadamente:

- Entendimento do domínio;
- Linguagem ubíqua;
- Modelagem DDD;
- Entidades;
- Objetos de valor;
- Agregado `CargaQuimica`;
- Regras de negócio e invariantes;
- Casos de uso;
- Máquina de estados;
- Arquitetura proposta;
- Organização do projeto;
- Planejamento de qualidade;
- Estratégia de testes;
- JavaScript e TypeScript;
- Decisões arquiteturais;
- Evolução futura;
- Premissas e pontos em aberto.

---

## 🎥 Vídeo da apresentação

A apresentação da proposta técnica do QuimiPort está disponível no YouTube:

### ▶️ [Assistir à apresentação do QuimiPort](https://youtu.be/6RWVwgywFtA)

O vídeo apresenta a concepção da solução, o domínio, as principais decisões técnicas, a modelagem e a arquitetura proposta.

---

## 🗂️ Estrutura do repositório

Atualmente, o repositório está organizado da seguinte forma:

```text
Tech-Challenge-QuimiPort/
│
├── docs/
│   ├── documentacao-tecnica.md
│   ├── decisoes-arquiteturais.md
│   ├── diagramas/
│   │   ├── 4.5_diagrama_de_dominio.md
│   │   ├── 4.7_mapa_de_contexto.md
│   │   ├── 6.1_diagrama_de_casos_de_uso.md
│   │   ├── 7.1_diagrama_de_transicao.md
│   │   ├── 8.3_diagrama_de_arquitetura.md
│   │   ├── 8.5_contexto_de_aplicacao.md
│   │   └── 10.3_piramide_de_testes.md
│   │
│   ├── QuimiPort_Apresentacao.pptx
│   ├── documentacao_tecnica.md
│   └── fase_1.md
│
├── QuimiPort_Apresentacao.pptx
└── README.md
```

A documentação técnica é o artefato central desta fase, enquanto os diagramas complementam visualmente a modelagem e o fluxo da solução.

O enunciado do Tech Challenge determina que, nesta primeira fase, o repositório não precisa possuir frontend, backend ou banco de dados funcionando. O objetivo é organizar os artefatos técnicos que servirão como base para as próximas fases.

---

## 🚀 Evolução planejada

O QuimiPort foi pensado desde o início como uma solução evolutiva.

A primeira fase concentra-se na definição do **núcleo de domínio, regras de negócio, arquitetura, TypeScript e qualidade**.

Nas próximas etapas, a arquitetura poderá evoluir para contemplar:

- Backend;
- API REST;
- Banco de dados;
- Interface web;
- Autenticação e autorização;
- Armazenamento de documentos;
- Notificações;
- Integração com sistemas reguladores;
- Aplicações móveis;
- Eventual extração de módulos para serviços independentes.

A arquitetura foi desenhada para permitir essa evolução sem comprometer as fronteiras estabelecidas no domínio.

---

## 🎓 Tech Challenge — FIAP

Este projeto foi desenvolvido como parte do **Tech Challenge da FIAP POSTECH — Pós-Tech em Full Stack Development**, turma **10FSDT**.

A primeira fase integra os conhecimentos das disciplinas:

- **JavaScript Avançado**
- **Arquitetura de Software com TypeScript**
- **Domain Driven Design**
- **Qualidade de Software**

O desafio tem como objetivo consolidar os conhecimentos dessas disciplinas na concepção de uma solução moderna, estruturada, testável e alinhada ao domínio de negócio.

### 👨‍💻 Equipe

- **Bruno de Almeida Dias**
- **Adriel de Sousa Ribeiro**
- **Nasser Ferreira Tarraf**
- **Glauton Feitosa da Silva**

**Professor:** Israel Meinert

**Instituição:** FIAP POSTECH  
**Curso:** Full Stack Development  
**Turma:** 10FSDT

---

## 📌 Status do projeto

**Fase 1 — Proposta técnica e arquitetural**

🟢 Domínio definido  
🟢 Linguagem ubíqua definida  
🟢 Modelagem DDD definida  
🟢 Regras de negócio documentadas  
🟢 Casos de uso documentados  
🟢 Fluxo de status definido  
🟢 Arquitetura proposta  
🟢 Planejamento de qualidade definido  
🟢 Diagramas produzidos  
🟢 Documentação técnica concluída  
🟢 Vídeo de apresentação disponível  

> **Observação:** nesta fase, o objetivo não é entregar uma aplicação funcional. O foco é estabelecer a base técnica que será utilizada na evolução do QuimiPort nas próximas fases do curso.

---

## 📖 Navegação rápida

| Recurso | Acesso |
|---|---|
| 📄 Documentação técnica | [Abrir documentação](./docs/documentacao_tecnica.md) |
| 🧩 Diagrama de domínio | [Abrir diagrama](./docs/diagramas/4.5_diagrama_de_dominio.md) |
| 🗺️ Mapa de contexto | [Abrir diagrama](./docs/diagramas/4.7_mapa_de_contexto.md) |
| 🔄 Fluxo de status | [Abrir diagrama](./docs/diagramas/7.1_diagrama_de_transicao.md) |
| 🎥 Apresentação | [Assistir no YouTube](https://youtu.be/6RWVwgywFtA) |

---

## 📄 Referência

Este projeto foi desenvolvido com base no enunciado oficial do **Tech Challenge — Fase 1 — Full Stack Development** da FIAP POSTECH e na documentação técnica elaborada pela equipe.

O desafio estabelece que o README deve apresentar o nome da solução, o contexto do problema, o objetivo da aplicação e a forma de navegação pela documentação.

