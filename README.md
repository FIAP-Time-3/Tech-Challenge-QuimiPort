# Tech Challenge - QuimiPort (Pos-Tech FSDT)

Tópicos:

- [Propósta](#proposta)
- [Contexto](#contexto)
- [Objetivo](#objetivo)
- [Stakeholders](#stakeholders)
  - [Administrador](#administrador)
  - [Operador Logistico](#operador-logistico)
  - [Operador Técnico](#operador-técnico)
  - [Fiscal de Inspeção](#fiscal-de-inspeção)
- [Linguagem Ubíqua](#linguagem-ubíqua)
  - Usuário
  - [Perfil](#perfil)
    - [Administrador](#administrador-1)
    - [Operador Logistico](#operador-logistico-1)
    - [Operador Técnico](#operador-técnico-1)
    - [Fiscal de Inspeção](#fiscal-de-inspeção-1)

- [Regras de Negócio](#regras-de-negócio)
- [Resumo do Domínio](#resumo-do-domínio)

## Proposta:

- Aplicação Full-Stack gerenciamento de cargas químicas em um contexto portuário, inspirado em
  operações logísticas do Porto de Santos.

## Contexto:

O Porto de Santos é um dos principais pontos de movimentação de cargas do Brasil.

Entre os diversos tipos de cargas movimentadas, existem produtos químicos que exigem controle cuidadoso, documentação adequada, classificação de risco e acompanhamento técnico.

Uma empresa que atua no controle de cargas químicas precisa de uma aplicação para organizar melhor o fluxo dessas cargas. Atualmente, o registro é feito de forma manual ou descentralizada, dificultando a consulta de informações, o acompanhamento do status e a validação de regras importantes.
de segurança.

Para resolver esse problema, será criada a aplicação QuimiPort, um sistema para gestão inicial de cargas químicas portuárias. Nesta primeira fase, o sistema deverá permitir:

- Cadastrar produtos químicos
- Registrar cargas químicas
- Associar uma carga a um produto químico
- Informar classificação de risco
- Registrar documentação obrigatória
- Definir responsável técnico
- Acompanhar o status da carga
- Bloquear ou liberar uma carga conforme regras de negócio
- Validar regras de segurança
- Testar os principais fluxos do domínio

## Objetivo:

Criar uma solução que permita:

- Cadastrar produtos químicos
- Registrar cargas
- Classificar riscos
- Controlar documentação obrigatória
- Acompanhar o status da carga
- Validar regras de segurança antes da liberação para movimentação portuária

## Stakeholders:

### Administrador

Responsável pela gestão de Usuários e Acessos

### Operador Logistico

Responsável pelo registro de cargas no sistema

### Operador Técnico

Profissional habilitado para acompanhamento de cargas quimicas

### Fiscal de Inspeção

Responsável pela inspeção de cargas e pelo registro de ocorrencias

## Linguagem Ubíqua

### Usuário

Qualquer profissional que utiliza o sistema

### Perfil

Nível de acesso do usuário, define quais funções o mesmo pode realizar no sistema

#### Administrador

Perfil de acessos que permite ao usuário:

- criar usuários
- ativar/desativar usuários
- incluir/remover perfis

#### Operador Logistico

Perfil de acessos que permite ao usuário:

- registrar novas cargas
- Definir o Operador Técnico das cargas
- associar um produto quimico a uma carga
- Acompanhar o status da carga

#### Operador Técnico

Perfil de acessos que permite ao usuário:

- cadastrar novos Produtos Quimicos
- informar classificação de risco para Produtos Quimicos e/ou Cargas
- Registrar documentação de cargas quimicas

#### Fiscal de Inspeção

Perfil de acessos que permite ao usuário:

- Bloquear ou liberar uma carga conforme regras de negócio
- Validar regras de segurança

## Regras de Negócio

## Resumo do Domínio
