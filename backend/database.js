// Importa a biblioteca responsável pelo banco de dados SQLite.
const Database = require("better-sqlite3");
const path = require("path");

// Define o local onde o arquivo do banco de dados será criado.
const caminhoBanco = path.join(__dirname, "assistencia.sqlite");

// Cria ou abre o banco de dados.
const db = new Database(caminhoBanco);

// Ativa a verificação dos relacionamentos entre as tabelas.
db.pragma("foreign_keys = ON");

// Cria as tabelas necessárias para o sistema.
db.exec(`

  -- Tabela de usuários que acessam o sistema.
  CREATE TABLE IF NOT EXISTS usuarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    senha TEXT NOT NULL,
    perfil TEXT NOT NULL
      CHECK (perfil IN ('administrador', 'tecnico'))
  );

  -- Tabela de clientes da assistência técnica.
  CREATE TABLE IF NOT EXISTS clientes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    documento TEXT,
    telefone TEXT,
    email TEXT,
    endereco TEXT,
    criado_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  -- Tabela de técnicos.
  CREATE TABLE IF NOT EXISTS tecnicos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    telefone TEXT,
    email TEXT,
    identificacao_profissional TEXT
  );

  -- Tabela de ordens de serviço.
  CREATE TABLE IF NOT EXISTS ordens_servico (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    numero_os TEXT NOT NULL UNIQUE,
    cliente_id INTEGER NOT NULL,
    tecnico_id INTEGER,
    data_abertura TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    equipamento TEXT NOT NULL,
    marca TEXT,
    modelo TEXT,
    numero_serie TEXT,
    acessorios_recebidos TEXT,
    defeito_informado TEXT,
    status TEXT NOT NULL DEFAULT 'Aberta'
      CHECK (
        status IN (
          'Aberta',
          'Em inspeção',
          'Em diagnóstico',
          'Aguardando reparo',
          'Em reparo',
          'Concluída',
          'Entregue',
          'Cancelada'
        )
      ),
    data_entrega TEXT,
    recebido_por TEXT,
    FOREIGN KEY (cliente_id) REFERENCES clientes(id),
    FOREIGN KEY (tecnico_id) REFERENCES tecnicos(id)
  );

  -- Tabela de inspeções físicas.
  CREATE TABLE IF NOT EXISTS inspecoes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ordem_servico_id INTEGER NOT NULL UNIQUE,
    tecnico_id INTEGER NOT NULL,
    data_inspecao TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    item_01 TEXT,
    item_02 TEXT,
    item_03 TEXT,
    item_04 TEXT,
    item_05 TEXT,
    item_06 TEXT,
    item_07 TEXT,
    item_08 TEXT,
    item_09 TEXT,
    item_10 TEXT,
    item_11 TEXT,
    item_12 TEXT,
    item_13 TEXT,
    item_14 TEXT,
    item_15 TEXT,
    item_16 TEXT,

    observacoes TEXT,

    FOREIGN KEY (ordem_servico_id)
      REFERENCES ordens_servico(id),
    FOREIGN KEY (tecnico_id)
      REFERENCES tecnicos(id)
  );

  -- Tabela de testes funcionais e diagnóstico.
  CREATE TABLE IF NOT EXISTS testes_funcionais (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ordem_servico_id INTEGER NOT NULL UNIQUE,
    tecnico_id INTEGER NOT NULL,
    data_teste TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    item_17 TEXT CHECK (item_17 IN ('Sim', 'Não', 'N/A') OR item_17 IS NULL),
    item_18 TEXT CHECK (item_18 IN ('Sim', 'Não', 'N/A') OR item_18 IS NULL),
    item_19 TEXT CHECK (item_19 IN ('Sim', 'Não', 'N/A') OR item_19 IS NULL),
    item_20 TEXT CHECK (item_20 IN ('Sim', 'Não', 'N/A') OR item_20 IS NULL),
    item_21 TEXT CHECK (item_21 IN ('Sim', 'Não', 'N/A') OR item_21 IS NULL),
    item_22 TEXT CHECK (item_22 IN ('Sim', 'Não', 'N/A') OR item_22 IS NULL),
    item_23 TEXT CHECK (item_23 IN ('Sim', 'Não', 'N/A') OR item_23 IS NULL),
    item_24 TEXT CHECK (item_24 IN ('Sim', 'Não', 'N/A') OR item_24 IS NULL),
    item_25 TEXT CHECK (item_25 IN ('Sim', 'Não', 'N/A') OR item_25 IS NULL),
    item_26 TEXT CHECK (item_26 IN ('Sim', 'Não', 'N/A') OR item_26 IS NULL),
    item_27 TEXT CHECK (item_27 IN ('Sim', 'Não', 'N/A') OR item_27 IS NULL),
    item_28 TEXT CHECK (item_28 IN ('Sim', 'Não', 'N/A') OR item_28 IS NULL),
    item_29 TEXT CHECK (item_29 IN ('Sim', 'Não', 'N/A') OR item_29 IS NULL),
    item_30 TEXT CHECK (item_30 IN ('Sim', 'Não', 'N/A') OR item_30 IS NULL),
    item_31 TEXT CHECK (item_31 IN ('Sim', 'Não', 'N/A') OR item_31 IS NULL),
    item_32 TEXT CHECK (item_32 IN ('Sim', 'Não', 'N/A') OR item_32 IS NULL),
    item_33 TEXT CHECK (item_33 IN ('Sim', 'Não', 'N/A') OR item_33 IS NULL),
    item_34 TEXT CHECK (item_34 IN ('Sim', 'Não', 'N/A') OR item_34 IS NULL),
    item_35 TEXT CHECK (item_35 IN ('Sim', 'Não', 'N/A') OR item_35 IS NULL),
    item_36 TEXT CHECK (item_36 IN ('Sim', 'Não', 'N/A') OR item_36 IS NULL),
    item_37 TEXT CHECK (item_37 IN ('Sim', 'Não', 'N/A') OR item_37 IS NULL),
    item_38 TEXT CHECK (item_38 IN ('Sim', 'Não', 'N/A') OR item_38 IS NULL),

    justificativa_19 TEXT,
    justificativa_35 TEXT,
    justificativas_na TEXT,

    tensao_12v REAL,
    tensao_5v REAL,
    tensao_3_3v REAL,

    cpu_temperatura_min REAL,
    cpu_temperatura_max REAL,
    gpu_temperatura_min REAL,
    gpu_temperatura_max REAL,

    software_diagnostico TEXT,
    resultado_smart TEXT,
    defeito_tecnico TEXT,
    servico_executado TEXT,

    parecer TEXT CHECK (
      parecer IN (
        'Aprovado',
        'Aprovado com ressalvas',
        'Reparo necessário',
        'Sem possibilidade de reparo'
      ) OR parecer IS NULL
    ),

    identificacao_assinatura TEXT,
    observacoes TEXT,

    FOREIGN KEY (ordem_servico_id)
      REFERENCES ordens_servico(id),
    FOREIGN KEY (tecnico_id)
      REFERENCES tecnicos(id)
  );

`);

// Confirma que o banco foi aberto e as tabelas foram criadas.
console.log("Banco de dados conectado com sucesso!");
console.log("Tabelas verificadas e criadas.");

// Disponibiliza a conexão para os outros arquivos do projeto.
module.exports = db;
