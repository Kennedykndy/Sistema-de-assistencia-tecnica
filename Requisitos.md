# Requisitos do Sistema de Ordem de Serviço

## 1. Objetivo do projeto

Desenvolver um sistema de ordem de serviço (OS) para uma
assistência técnica de computadores.

O sistema permitirá cadastrar clientes e técnicos, abrir ordens
de serviço, realizar inspeções físicas, executar testes funcionais,
registrar diagnósticos e controlar a entrega dos equipamentos.

## 2. Entidades do sistema

### 2.1. Usuários

Representam as pessoas que acessam o sistema.

Campos:

- id
- nome
- email
- senha
- perfil (administrador ou técnico)

### 2.2. Clientes

Representam os proprietários dos equipamentos.

Campos:

- id
- nome
- CPF ou CNPJ
- telefone
- email
- endereço

### 2.3. Técnicos

Representam os responsáveis pelos atendimentos técnicos.

Campos:

- id
- nome
- telefone
- email
- identificação profissional, quando aplicável

### 2.4. Ordens de serviço

Registram cada atendimento realizado pela assistência.

Campos:

- id
- número da OS
- cliente
- técnico responsável
- data de abertura
- equipamento
- marca
- modelo
- número de série
- acessórios recebidos
- defeito informado pelo cliente
- status da OS
- data de entrega
- identificação de quem recebeu o equipamento

### 2.5. Inspeção física e acessórios

Registra as condições físicas do equipamento na entrada.

Cada inspeção pertence a uma ordem de serviço.

Campos:

- id
- ordem de serviço
- técnico responsável
- data da inspeção
- respostas dos itens 1 a 16
- observações gerais

As opções de cada item devem respeitar o checklist oficial.

### 2.6. Teste funcional e diagnóstico

Registra os testes realizados e o diagnóstico técnico.

Cada teste pertence a uma ordem de serviço.

Campos:

- id
- ordem de serviço
- técnico responsável
- data do teste
- respostas dos itens 17 a 38
- justificativas para respostas N/A
- observações obrigatórias
- medições elétricas e térmicas
- software de diagnóstico
- resultado SMART
- defeito técnico
- serviço executado
- parecer técnico
- identificação da assinatura
- observações gerais

## 3. Fluxo de atendimento

1. Cadastrar ou localizar o cliente.
2. Receber o equipamento e abrir uma OS.
3. Registrar os acessórios recebidos.
4. Realizar a inspeção física.
5. Executar os testes funcionais.
6. Registrar medições e diagnóstico.
7. Definir o parecer técnico.
8. Registrar o serviço executado.
9. Conferir os requisitos de conclusão.
10. Registrar a entrega e encerrar a OS.

## 4. Módulo de inspeção física

Os itens abaixo devem possuir as opções informadas
no checklist fornecido.

| Nº  | Item                        | Opções                             |
| --- | --------------------------- | ---------------------------------- |
| 1   | Gabinete / estrutura        | OK / Riscado / Amassado / Quebrado |
| 2   | Tampas laterais             | OK / Danificadas / Ausentes        |
| 3   | Parafusos do gabinete       | OK / Faltam / Não possui           |
| 4   | Pés e apoios                | OK / Danificados / Faltam          |
| 5   | Botões Power / Reset        | OK / Danificados / Travados        |
| 6   | Painel frontal              | OK / Danificado / Cabos soltos     |
| 7   | Portas USB / áudio frontais | OK / Danificadas / Não possui      |
| 8   | Portas traseiras            | OK / Danificadas / Oxidadas        |
| 9   | Cabo de força               | OK / Danificado / Ausente          |
| 10  | Fonte ATX / chave seletora  | OK / Danificada / Lacre violado    |
| 11  | Monitor e base              | OK / Riscado / Quebrado / Manchado |
| 12  | Cabos de vídeo              | OK / Danificados / Ausentes        |
| 13  | Teclado                     | OK / Teclas faltando / Danificado  |
| 14  | Mouse                       | OK / Danificado / Ausente          |
| 15  | Unidade óptica / leitor     | OK / Danificado / Não possui       |
| 16  | Etiqueta / nº de série      | Legível / Ilegível / Não possui    |

## 5. Módulo de teste funcional e diagnóstico

Todos os itens de 17 a 38 devem permitir as respostas:
Sim, Não ou N/A.

| Nº  | Pergunta                                                      |
| --- | ------------------------------------------------------------- |
| 17  | Liga e conclui o POST sem alertas?                            |
| 18  | Tensão e estabilidade da fonte ATX estão corretas?            |
| 19  | Placa-mãe apresenta danos, oxidação ou capacitores estufados? |
| 20  | Processador é reconhecido e opera normalmente?                |
| 21  | Memória RAM foi reconhecida e testada?                        |
| 22  | HD/SSD é reconhecido pela BIOS/UEFI?                          |
| 23  | Teste S.M.A.R.T. do armazenamento foi realizado?              |
| 24  | Sistema operacional inicia sem erros?                         |
| 25  | Drivers estão instalados e atualizados?                       |
| 26  | Portas USB frontais e traseiras funcionam?                    |
| 27  | Rede Ethernet / Wi-Fi funciona corretamente?                  |
| 28  | Saídas de vídeo funcionam nas resoluções suportadas?          |
| 29  | Áudio, microfone e conectores estão funcionando?              |
| 30  | Teclado e mouse funcionam corretamente?                       |
| 31  | Coolers giram sem ruído ou vibração anormal?                  |
| 32  | Temperaturas permanecem dentro do esperado?                   |
| 33  | Bateria CMOS mantém data e configurações?                     |
| 34  | Unidade óptica / leitor funciona, quando presente?            |
| 35  | Foram identificados vírus, lentidão ou falhas de software?    |
| 36  | Limpeza interna e organização dos cabos foram verificadas?    |
| 37  | Teste de estabilidade / benchmark foi realizado?              |
| 38  | Equipamento reinicia e desliga corretamente?                  |

### 5.1. Regras das respostas

- Resposta N/A exige justificativa.
- Resposta Sim no item 19 exige observação.
- Resposta Sim no item 35 exige observação.
- Executar um teste não significa que ele foi aprovado.
- As respostas não podem determinar o parecer final apenas
  pela quantidade de respostas Sim.
- O diagnóstico deve considerar as evidências e a avaliação técnica.

## 6. Medições e parecer técnico

O sistema deve registrar:

- Tensões da fonte ATX: 12 V, 5 V e 3,3 V.
- Temperaturas mínimas e máximas da CPU.
- Temperaturas mínimas e máximas da GPU.
- Software de diagnóstico utilizado.
- Resultado do teste SMART.
- Defeito técnico identificado.
- Serviço executado.
- Data do diagnóstico.
- Técnico responsável.
- Identificação da assinatura.

Campos de medições que não forem preenchidos devem permanecer
NULL no banco de dados.

A identificação textual da assinatura não representa uma
assinatura digital criptográfica.

### 6.1. Pareceres permitidos

- Aprovado
- Aprovado com ressalvas
- Reparo necessário
- Sem possibilidade de reparo

O parecer deve ser definido com base no diagnóstico técnico,
nas medições e nas evidências registradas.

## 7. Permissões

### Administrador

- Cadastrar, consultar, atualizar e excluir clientes.
- Cadastrar, consultar, atualizar e excluir técnicos.
- Gerenciar usuários e permissões.
- Consultar e administrar ordens de serviço.
- Consultar inspeções e testes.
- Gerenciar os registros conforme as regras de integridade.
- Visualizar o dashboard geral.

### Técnico

- Consultar os atendimentos autorizados.
- Registrar inspeções físicas.
- Registrar testes funcionais.
- Informar medições e diagnóstico.
- Registrar o serviço executado.
- Atualizar os registros conforme suas permissões.

O técnico não pode gerenciar usuários administradores nem
alterar permissões administrativas.

As permissões devem ser verificadas pelo servidor, não apenas
pela interface.

## 8. Requisitos do CRUD

O sistema deve permitir cadastro, consulta, atualização e
exclusão de registros nos seguintes módulos:

- Clientes.
- Técnicos.
- Ordens de serviço.
- Inspeção física e acessórios.
- Teste funcional e diagnóstico.

As operações devem persistir os dados no banco de dados.

Os relacionamentos devem ser protegidos contra exclusões que
deixem registros dependentes sem referência válida.

## 9. Regras de conclusão e entrega

Uma OS somente poderá ser encerrada como concluída quando:

- Possuir cliente e equipamento identificados.
- Possuir inspeção física registrada.
- Possuir os 16 itens físicos respondidos.
- Possuir os 22 itens funcionais respondidos.
- Possuir justificativas obrigatórias para N/A.
- Possuir observações obrigatórias nos itens 19 e 35 quando
  a resposta for Sim.
- Possuir diagnóstico e parecer técnico.
- Possuir identificação do técnico responsável.
- Possuir o serviço executado registrado.
- Possuir os dados de entrega exigidos pelo procedimento.

Medições não realizadas devem permanecer NULL e não podem ser
substituídas por valores inventados.

O encerramento deve respeitar as regras de autorização.

## 10. Dashboard

O dashboard deve apresentar informações reais do banco, como:

- Total de ordens de serviço.
- OS abertas.
- OS em diagnóstico.
- OS aguardando reparo.
- OS concluídas.
- Quantidade de clientes cadastrados.
- Quantidade de técnicos cadastrados.

Os números devem ser calculados a partir dos registros existentes,
e não escritos manualmente no código.

## 11. Tecnologias previstas

- HTML5.
- CSS3.
- JavaScript.
- Node.js.
- Express.
- SQLite.
- better-sqlite3.

## 12. Critérios de validação

O projeto será considerado funcional quando:

1. Os cadastros permitirem operações CRUD.
2. Os módulos de inspeção e teste estiverem vinculados às OS.
3. Os 16 itens físicos possuírem suas opções corretas.
4. Os 22 itens funcionais aceitarem Sim, Não ou N/A.
5. As validações obrigatórias forem aplicadas.
6. As medições ausentes forem armazenadas como NULL.
7. O parecer técnico não for calculado por simples contagem.
8. As permissões forem verificadas no servidor.
9. O dashboard exibir dados reais do banco.
10. A entrega da OS respeitar os requisitos de conclusão.
