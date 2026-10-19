// ==================================================
// IMPORTAÇÕES E CONFIGURAÇÃO DO SERVIDOR
// ==================================================

const express = require("express");
const path = require("path");
const db = require("./database");

const app = express();
const PORTA = 3000;

// Permite receber dados no formato JSON
app.use(express.json());

// Disponibiliza os arquivos do frontend
app.use(express.static(path.join(__dirname, "../frontend")));

// ==================================================
// ROTA INICIAL DA API
// ==================================================

app.get("/api", (req, res) => {
  res.json({
    mensagem: "API do sistema de assistência técnica funcionando!",
  });
});

// ==================================================
// FUNÇÕES AUXILIARES
// ==================================================

// Executa uma operação dentro de uma transação SQLite.
// Em caso de erro, desfaz as alterações.
function executarTransacao(operacao) {
  db.exec("BEGIN");

  try {
    const resultado = operacao();

    db.exec("COMMIT");

    return resultado;
  } catch (erro) {
    try {
      db.exec("ROLLBACK");
    } catch (erroRollback) {
      console.error("Erro ao desfazer a transação:", erroRollback.message);
    }

    throw erro;
  }
}

// Converte uma quantidade em inteiro positivo.
// Retorna null quando o valor está vazio.
// Retorna undefined quando o valor é inválido.
function converterQuantidade(valor) {
  if (valor === undefined || valor === null || valor === "") {
    return null;
  }

  const quantidade = Number(valor);

  if (!Number.isInteger(quantidade) || quantidade <= 0) {
    return undefined;
  }

  return quantidade;
}

// ==================================================
// CADASTRO DE CLIENTES
// ==================================================

// Lista todos os clientes
app.get("/api/clientes", (req, res) => {
  try {
    const clientes = db
      .prepare("SELECT * FROM clientes ORDER BY id DESC")
      .all();

    res.json(clientes);
  } catch (erro) {
    console.error("Erro ao buscar clientes:", erro.message);

    res.status(500).json({
      erro: "Erro ao buscar clientes.",
    });
  }
});

// Busca um cliente pelo ID
app.get("/api/clientes/:id", (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({
      erro: "ID do cliente inválido.",
    });
  }

  try {
    const cliente = db.prepare("SELECT * FROM clientes WHERE id = ?").get(id);

    if (!cliente) {
      return res.status(404).json({
        erro: "Cliente não encontrado.",
      });
    }

    res.json(cliente);
  } catch (erro) {
    console.error("Erro ao buscar cliente:", erro.message);

    res.status(500).json({
      erro: "Erro ao buscar cliente.",
    });
  }
});

// Cadastra um cliente
app.post("/api/clientes", (req, res) => {
  const { nome, documento, telefone, email, endereco } = req.body || {};

  if (!nome || !String(nome).trim()) {
    return res.status(400).json({
      erro: "O nome do cliente é obrigatório.",
    });
  }

  try {
    const resultado = db
      .prepare(
        `
        INSERT INTO clientes (
          nome,
          documento,
          telefone,
          email,
          endereco
        )
        VALUES (?, ?, ?, ?, ?)
        `,
      )
      .run(
        String(nome).trim(),
        documento || null,
        telefone || null,
        email || null,
        endereco || null,
      );

    res.status(201).json({
      mensagem: "Cliente cadastrado com sucesso!",
      id: resultado.lastInsertRowid,
    });
  } catch (erro) {
    console.error("Erro ao cadastrar cliente:", erro.message);

    res.status(500).json({
      erro: "Erro ao cadastrar cliente.",
    });
  }
});

// Atualiza um cliente
app.put("/api/clientes/:id", (req, res) => {
  const id = Number(req.params.id);
  const { nome, documento, telefone, email, endereco } = req.body || {};

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({
      erro: "ID do cliente inválido.",
    });
  }

  if (!nome || !String(nome).trim()) {
    return res.status(400).json({
      erro: "O nome do cliente é obrigatório.",
    });
  }

  try {
    const cliente = db.prepare("SELECT id FROM clientes WHERE id = ?").get(id);

    if (!cliente) {
      return res.status(404).json({
        erro: "Cliente não encontrado.",
      });
    }

    db.prepare(
      `
      UPDATE clientes
      SET nome = ?,
          documento = ?,
          telefone = ?,
          email = ?,
          endereco = ?
      WHERE id = ?
      `,
    ).run(
      String(nome).trim(),
      documento || null,
      telefone || null,
      email || null,
      endereco || null,
      id,
    );

    res.json({
      mensagem: "Cliente atualizado com sucesso!",
    });
  } catch (erro) {
    console.error("Erro ao atualizar cliente:", erro.message);

    res.status(500).json({
      erro: "Erro ao atualizar cliente.",
    });
  }
});

// Exclui um cliente
app.delete("/api/clientes/:id", (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({
      erro: "ID do cliente inválido.",
    });
  }

  try {
    const resultado = db.prepare("DELETE FROM clientes WHERE id = ?").run(id);

    if (resultado.changes === 0) {
      return res.status(404).json({
        erro: "Cliente não encontrado.",
      });
    }

    res.json({
      mensagem: "Cliente excluído com sucesso!",
    });
  } catch (erro) {
    console.error("Erro ao excluir cliente:", erro.message);

    if (erro.code === "SQLITE_CONSTRAINT_FOREIGNKEY") {
      return res.status(409).json({
        erro: "Não é possível excluir este cliente porque ele possui ordens de serviço vinculadas.",
      });
    }

    res.status(500).json({
      erro: "Erro ao excluir cliente.",
    });
  }
});

// ==================================================
// CADASTRO DE TÉCNICOS
// ==================================================

// Lista todos os técnicos
app.get("/api/tecnicos", (req, res) => {
  try {
    const tecnicos = db
      .prepare("SELECT * FROM tecnicos ORDER BY id DESC")
      .all();

    res.json(tecnicos);
  } catch (erro) {
    console.error("Erro ao buscar técnicos:", erro.message);

    res.status(500).json({
      erro: "Erro ao buscar técnicos.",
    });
  }
});

// Busca um técnico pelo ID
app.get("/api/tecnicos/:id", (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({
      erro: "ID do técnico inválido.",
    });
  }

  try {
    const tecnico = db.prepare("SELECT * FROM tecnicos WHERE id = ?").get(id);

    if (!tecnico) {
      return res.status(404).json({
        erro: "Técnico não encontrado.",
      });
    }

    res.json(tecnico);
  } catch (erro) {
    console.error("Erro ao buscar técnico:", erro.message);

    res.status(500).json({
      erro: "Erro ao buscar técnico.",
    });
  }
});

// Cadastra um técnico
app.post("/api/tecnicos", (req, res) => {
  const { nome, telefone, email, identificacao_profissional } = req.body || {};

  if (!nome || !String(nome).trim()) {
    return res.status(400).json({
      erro: "O nome do técnico é obrigatório.",
    });
  }

  try {
    const resultado = db
      .prepare(
        `
        INSERT INTO tecnicos (
          nome,
          telefone,
          email,
          identificacao_profissional
        )
        VALUES (?, ?, ?, ?)
        `,
      )
      .run(
        String(nome).trim(),
        telefone || null,
        email || null,
        identificacao_profissional || null,
      );

    res.status(201).json({
      mensagem: "Técnico cadastrado com sucesso!",
      id: resultado.lastInsertRowid,
    });
  } catch (erro) {
    console.error("Erro ao cadastrar técnico:", erro.message);

    res.status(500).json({
      erro: "Erro ao cadastrar técnico.",
    });
  }
});

// Atualiza um técnico
app.put("/api/tecnicos/:id", (req, res) => {
  const id = Number(req.params.id);

  const { nome, telefone, email, identificacao_profissional } = req.body || {};

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({
      erro: "ID do técnico inválido.",
    });
  }

  if (!nome || !String(nome).trim()) {
    return res.status(400).json({
      erro: "O nome do técnico é obrigatório.",
    });
  }

  try {
    const tecnico = db.prepare("SELECT id FROM tecnicos WHERE id = ?").get(id);

    if (!tecnico) {
      return res.status(404).json({
        erro: "Técnico não encontrado.",
      });
    }

    db.prepare(
      `
      UPDATE tecnicos
      SET nome = ?,
          telefone = ?,
          email = ?,
          identificacao_profissional = ?
      WHERE id = ?
      `,
    ).run(
      String(nome).trim(),
      telefone || null,
      email || null,
      identificacao_profissional || null,
      id,
    );

    res.json({
      mensagem: "Técnico atualizado com sucesso!",
    });
  } catch (erro) {
    console.error("Erro ao atualizar técnico:", erro.message);

    res.status(500).json({
      erro: "Erro ao atualizar técnico.",
    });
  }
});

// Exclui um técnico
app.delete("/api/tecnicos/:id", (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({
      erro: "ID do técnico inválido.",
    });
  }

  try {
    const resultado = db.prepare("DELETE FROM tecnicos WHERE id = ?").run(id);

    if (resultado.changes === 0) {
      return res.status(404).json({
        erro: "Técnico não encontrado.",
      });
    }

    res.json({
      mensagem: "Técnico excluído com sucesso!",
    });
  } catch (erro) {
    console.error("Erro ao excluir técnico:", erro.message);

    if (erro.code === "SQLITE_CONSTRAINT_FOREIGNKEY") {
      return res.status(409).json({
        erro: "Não é possível excluir este técnico porque ele está vinculado a registros existentes.",
      });
    }

    res.status(500).json({
      erro: "Erro ao excluir técnico.",
    });
  }
});

// ==================================================
// ORDENS DE SERVIÇO
// ==================================================

const statusPermitidos = [
  "Aberta",
  "Em inspeção",
  "Em diagnóstico",
  "Aguardando reparo",
  "Em reparo",
  "Concluída",
  "Entregue",
  "Cancelada",
];

// Lista todas as ordens de serviço
app.get("/api/ordens-servico", (req, res) => {
  try {
    const ordens = db
      .prepare(
        `
        SELECT
          os.*,
          c.nome AS nome_cliente,
          t.nome AS nome_tecnico
        FROM ordens_servico os
        INNER JOIN clientes c
          ON c.id = os.cliente_id
        LEFT JOIN tecnicos t
          ON t.id = os.tecnico_id
        ORDER BY os.id DESC
        `,
      )
      .all();

    res.json(ordens);
  } catch (erro) {
    console.error("Erro ao listar ordens:", erro.message);

    res.status(500).json({
      erro: "Erro ao listar ordens de serviço.",
    });
  }
});

// Busca uma ordem de serviço pelo ID
app.get("/api/ordens-servico/:id", (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({
      erro: "ID da ordem de serviço inválido.",
    });
  }

  try {
    const ordem = db
      .prepare("SELECT * FROM ordens_servico WHERE id = ?")
      .get(id);

    if (!ordem) {
      return res.status(404).json({
        erro: "Ordem de serviço não encontrada.",
      });
    }

    res.json(ordem);
  } catch (erro) {
    console.error("Erro ao buscar ordem:", erro.message);

    res.status(500).json({
      erro: "Erro ao buscar ordem de serviço.",
    });
  }
});

// Cadastra uma ordem de serviço
app.post("/api/ordens-servico", (req, res) => {
  const dados = req.body || {};

  const {
    cliente_id,
    tecnico_id,
    data_abertura,
    equipamento,
    marca,
    modelo,
    numero_serie,
    acessorios_recebidos,
    defeito_informado,
    status,
    recebido_por,
  } = dados;

  const clienteId = Number(cliente_id);

  const tecnicoId =
    tecnico_id === "" || tecnico_id === null || tecnico_id === undefined
      ? null
      : Number(tecnico_id);

  if (!Number.isInteger(clienteId) || clienteId <= 0) {
    return res.status(400).json({
      erro: "Selecione um cliente válido.",
    });
  }

  if (!equipamento || !String(equipamento).trim()) {
    return res.status(400).json({
      erro: "Informe o equipamento.",
    });
  }

  if (tecnicoId !== null && (!Number.isInteger(tecnicoId) || tecnicoId <= 0)) {
    return res.status(400).json({
      erro: "Selecione um técnico válido.",
    });
  }

  const statusFinal = status || "Aberta";

  if (!statusPermitidos.includes(statusFinal)) {
    return res.status(400).json({
      erro: "Status da ordem de serviço inválido.",
    });
  }

  try {
    const cliente = db
      .prepare("SELECT id FROM clientes WHERE id = ?")
      .get(clienteId);

    if (!cliente) {
      return res.status(404).json({
        erro: "O cliente selecionado não existe.",
      });
    }

    if (tecnicoId !== null) {
      const tecnico = db
        .prepare("SELECT id FROM tecnicos WHERE id = ?")
        .get(tecnicoId);

      if (!tecnico) {
        return res.status(404).json({
          erro: "O técnico selecionado não existe.",
        });
      }
    }

    const numeroOS = `OS-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const resultado = db
      .prepare(
        `
        INSERT INTO ordens_servico (
          numero_os,
          cliente_id,
          tecnico_id,
          data_abertura,
          equipamento,
          marca,
          modelo,
          numero_serie,
          acessorios_recebidos,
          defeito_informado,
          status,
          recebido_por
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
      )
      .run(
        numeroOS,
        clienteId,
        tecnicoId,
        data_abertura || new Date().toISOString().slice(0, 10),
        String(equipamento).trim(),
        marca || null,
        modelo || null,
        numero_serie || null,
        acessorios_recebidos || null,
        defeito_informado || null,
        statusFinal,
        recebido_por || null,
      );

    res.status(201).json({
      mensagem: "Ordem de serviço cadastrada com sucesso!",
      id: resultado.lastInsertRowid,
      numero_os: numeroOS,
    });
  } catch (erro) {
    console.error("Erro ao cadastrar ordem:", erro.message);

    res.status(500).json({
      erro: "Erro ao cadastrar ordem de serviço.",
    });
  }
});

// Atualiza uma ordem de serviço
app.put("/api/ordens-servico/:id", (req, res) => {
  const id = Number(req.params.id);
  const dados = req.body || {};

  const {
    cliente_id,
    tecnico_id,
    data_abertura,
    equipamento,
    marca,
    modelo,
    numero_serie,
    acessorios_recebidos,
    defeito_informado,
    status,
    recebido_por,
  } = dados;

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({
      erro: "ID da ordem de serviço inválido.",
    });
  }

  const clienteId = Number(cliente_id);

  const tecnicoId =
    tecnico_id === "" || tecnico_id === null || tecnico_id === undefined
      ? null
      : Number(tecnico_id);

  if (!Number.isInteger(clienteId) || clienteId <= 0) {
    return res.status(400).json({
      erro: "Selecione um cliente válido.",
    });
  }

  if (!equipamento || !String(equipamento).trim()) {
    return res.status(400).json({
      erro: "Informe o equipamento.",
    });
  }

  if (tecnicoId !== null && (!Number.isInteger(tecnicoId) || tecnicoId <= 0)) {
    return res.status(400).json({
      erro: "Selecione um técnico válido.",
    });
  }

  if (!statusPermitidos.includes(status)) {
    return res.status(400).json({
      erro: "Selecione um status válido.",
    });
  }

  try {
    const ordem = db
      .prepare("SELECT id FROM ordens_servico WHERE id = ?")
      .get(id);

    if (!ordem) {
      return res.status(404).json({
        erro: "Ordem de serviço não encontrada.",
      });
    }

    const cliente = db
      .prepare("SELECT id FROM clientes WHERE id = ?")
      .get(clienteId);

    if (!cliente) {
      return res.status(404).json({
        erro: "O cliente selecionado não existe.",
      });
    }

    if (tecnicoId !== null) {
      const tecnico = db
        .prepare("SELECT id FROM tecnicos WHERE id = ?")
        .get(tecnicoId);

      if (!tecnico) {
        return res.status(404).json({
          erro: "O técnico selecionado não existe.",
        });
      }
    }

    db.prepare(
      `
      UPDATE ordens_servico
      SET cliente_id = ?,
          tecnico_id = ?,
          data_abertura = ?,
          equipamento = ?,
          marca = ?,
          modelo = ?,
          numero_serie = ?,
          acessorios_recebidos = ?,
          defeito_informado = ?,
          status = ?,
          recebido_por = ?
      WHERE id = ?
      `,
    ).run(
      clienteId,
      tecnicoId,
      data_abertura || new Date().toISOString().slice(0, 10),
      String(equipamento).trim(),
      marca || null,
      modelo || null,
      numero_serie || null,
      acessorios_recebidos || null,
      defeito_informado || null,
      status,
      recebido_por || null,
      id,
    );

    res.json({
      mensagem: "Ordem de serviço atualizada com sucesso!",
    });
  } catch (erro) {
    console.error("Erro ao atualizar ordem:", erro.message);

    res.status(500).json({
      erro: "Erro ao atualizar ordem de serviço.",
    });
  }
});

// Exclui uma ordem de serviço
app.delete("/api/ordens-servico/:id", (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({
      erro: "ID da ordem de serviço inválido.",
    });
  }

  try {
    const resultado = db
      .prepare("DELETE FROM ordens_servico WHERE id = ?")
      .run(id);

    if (resultado.changes === 0) {
      return res.status(404).json({
        erro: "Ordem de serviço não encontrada.",
      });
    }

    res.json({
      mensagem: "Ordem de serviço excluída com sucesso!",
    });
  } catch (erro) {
    console.error("Erro ao excluir ordem:", erro.message);

    if (erro.code === "SQLITE_CONSTRAINT_FOREIGNKEY") {
      return res.status(409).json({
        erro: "Não é possível excluir esta OS porque existem inspeções ou testes vinculados a ela.",
      });
    }

    res.status(500).json({
      erro: "Erro ao excluir ordem de serviço.",
    });
  }
});

// ==================================================
// INSPEÇÃO FÍSICA DO EQUIPAMENTO
// ==================================================

// Opções permitidas para cada item da inspeção
const opcoesInspecao = {
  item_01: ["OK", "Riscado", "Amassado", "Quebrado"],
  item_02: ["OK", "Danificadas", "Ausentes"],
  item_03: ["OK", "Faltam", "Não possui"],
  item_04: ["OK", "Danificados", "Faltam"],
  item_05: ["OK", "Danificados", "Travados"],
  item_06: ["OK", "Danificado", "Cabos soltos"],
  item_07: ["OK", "Danificadas", "Não possui"],
  item_08: ["OK", "Danificadas", "Oxidadas"],
  item_09: ["OK", "Danificado", "Ausente"],
  item_10: ["OK", "Danificada", "Lacre violado"],
  item_11: ["OK", "Riscado", "Quebrado", "Manchado"],
  item_12: ["OK", "Danificados", "Ausentes"],
  item_13: ["OK", "Teclas faltando", "Danificado"],
  item_14: ["OK", "Danificado", "Ausente"],
  item_15: ["OK", "Danificado", "Não possui"],
  item_16: ["Legível", "Ilegível", "Não possui"],
};

const camposInspecao = Object.keys(opcoesInspecao);

// Valida os 16 itens e as quantidades
function validarInspecao(dados) {
  if (!dados || typeof dados !== "object" || Array.isArray(dados)) {
    return {
      erro: "Envie os dados da inspeção em formato válido.",
    };
  }

  // Todos os 16 itens devem estar preenchidos
  for (const campo of camposInspecao) {
    const valor = dados[campo];

    if (valor === undefined || valor === null || valor === "") {
      return {
        erro: `O campo ${campo} é obrigatório.`,
      };
    }

    if (typeof valor !== "string" || !opcoesInspecao[campo].includes(valor)) {
      return {
        erro: `Opção inválida para o campo ${campo}.`,
      };
    }
  }

  const quantidadeParafusos = converterQuantidade(dados.quantidade_parafusos);

  if (dados.item_03 === "Faltam") {
    if (quantidadeParafusos === null || quantidadeParafusos === undefined) {
      return {
        erro: "Informe uma quantidade inteira e positiva de parafusos faltantes.",
      };
    }
  } else if (quantidadeParafusos === undefined) {
    return {
      erro: "A quantidade de parafusos deve ser um número inteiro positivo.",
    };
  }

  const quantidadePes = converterQuantidade(dados.quantidade_pes);

  if (dados.item_04 === "Faltam") {
    if (quantidadePes === null || quantidadePes === undefined) {
      return {
        erro: "Informe uma quantidade inteira e positiva de pés ou apoios faltantes.",
      };
    }
  } else if (quantidadePes === undefined) {
    return {
      erro: "A quantidade de pés ou apoios deve ser um número inteiro positivo.",
    };
  }

  if (
    dados.observacoes !== undefined &&
    dados.observacoes !== null &&
    typeof dados.observacoes !== "string"
  ) {
    return {
      erro: "O campo observações deve ser um texto.",
    };
  }

  if (
    dados.data_inspecao !== undefined &&
    dados.data_inspecao !== null &&
    dados.data_inspecao !== ""
  ) {
    if (
      typeof dados.data_inspecao !== "string" ||
      !/^\d{4}-\d{2}-\d{2}$/.test(dados.data_inspecao)
    ) {
      return {
        erro: "Informe uma data de inspeção válida no formato AAAA-MM-DD.",
      };
    }

    const data = new Date(`${dados.data_inspecao}T00:00:00`);

    if (
      Number.isNaN(data.getTime()) ||
      data.toISOString().slice(0, 10) !== dados.data_inspecao
    ) {
      return {
        erro: "A data de inspeção informada não existe.",
      };
    }
  }

  return {
    erro: null,
    quantidadeParafusos:
      dados.item_03 === "Faltam" ? quantidadeParafusos : null,
    quantidadePes: dados.item_04 === "Faltam" ? quantidadePes : null,
  };
}

// Valida os identificadores da OS e do técnico
function validarVinculosInspecao(dados) {
  if (!dados || typeof dados !== "object" || Array.isArray(dados)) {
    return {
      erro: "Envie os dados da inspeção em formato válido.",
    };
  }

  const ordemServicoId = Number(dados.ordem_servico_id);
  const tecnicoId = Number(dados.tecnico_id);

  if (!Number.isInteger(ordemServicoId) || ordemServicoId <= 0) {
    return {
      erro: "Selecione uma Ordem de Serviço válida.",
    };
  }

  if (!Number.isInteger(tecnicoId) || tecnicoId <= 0) {
    return {
      erro: "Selecione um técnico responsável válido.",
    };
  }

  return {
    erro: null,
    ordemServicoId,
    tecnicoId,
  };
}

// Lista todas as inspeções físicas
app.get("/api/inspecoes", (req, res) => {
  try {
    const inspecoes = db
      .prepare(
        `
        SELECT
          i.*,
          os.numero_os,
          os.equipamento,
          t.nome AS nome_tecnico
        FROM inspecoes i
        INNER JOIN ordens_servico os
          ON os.id = i.ordem_servico_id
        INNER JOIN tecnicos t
          ON t.id = i.tecnico_id
        ORDER BY i.id DESC
        `,
      )
      .all();

    res.json(inspecoes);
  } catch (erro) {
    console.error("Erro ao listar inspeções:", erro.message);

    res.status(500).json({
      erro: "Erro ao listar as inspeções físicas.",
    });
  }
});

// Busca uma inspeção pelo ID
app.get("/api/inspecoes/:id", (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({
      erro: "ID da inspeção inválido.",
    });
  }

  try {
    const inspecao = db
      .prepare(
        `
        SELECT
          i.*,
          os.numero_os,
          os.equipamento,
          t.nome AS nome_tecnico
        FROM inspecoes i
        INNER JOIN ordens_servico os
          ON os.id = i.ordem_servico_id
        INNER JOIN tecnicos t
          ON t.id = i.tecnico_id
        WHERE i.id = ?
        `,
      )
      .get(id);

    if (!inspecao) {
      return res.status(404).json({
        erro: "Inspeção não encontrada.",
      });
    }

    res.json(inspecao);
  } catch (erro) {
    console.error("Erro ao buscar inspeção:", erro.message);

    res.status(500).json({
      erro: "Erro ao buscar a inspeção física.",
    });
  }
});

// Cadastra uma inspeção física
app.post("/api/inspecoes", (req, res) => {
  const dados = req.body || {};

  const vinculos = validarVinculosInspecao(dados);

  if (vinculos.erro) {
    return res.status(400).json({
      erro: vinculos.erro,
    });
  }

  const validacao = validarInspecao(dados);

  if (validacao.erro) {
    return res.status(400).json({
      erro: validacao.erro,
    });
  }

  const { ordemServicoId, tecnicoId } = vinculos;

  try {
    const ordem = db
      .prepare("SELECT id FROM ordens_servico WHERE id = ?")
      .get(ordemServicoId);

    if (!ordem) {
      return res.status(404).json({
        erro: "A Ordem de Serviço informada não existe.",
      });
    }

    const tecnico = db
      .prepare("SELECT id FROM tecnicos WHERE id = ?")
      .get(tecnicoId);

    if (!tecnico) {
      return res.status(404).json({
        erro: "O técnico informado não existe.",
      });
    }

    const colunas = [
      "ordem_servico_id",
      "tecnico_id",
      "data_inspecao",
      ...camposInspecao,
      "quantidade_parafusos",
      "quantidade_pes",
      "observacoes",
    ];

    const valores = [
      ordemServicoId,
      tecnicoId,
      dados.data_inspecao || new Date().toISOString().slice(0, 10),
      ...camposInspecao.map((campo) => dados[campo]),
      validacao.quantidadeParafusos,
      validacao.quantidadePes,
      dados.observacoes?.trim() || null,
    ];

    const sql = `
      INSERT INTO inspecoes (${colunas.join(", ")})
      VALUES (${colunas.map(() => "?").join(", ")})
    `;

    // A inserção será confirmada somente se a operação terminar sem erro
    const resultado = executarTransacao(() => {
      return db.prepare(sql).run(...valores);
    });

    res.status(201).json({
      mensagem: "Inspeção física cadastrada com sucesso!",
      id: resultado.lastInsertRowid,
    });
  } catch (erro) {
    console.error("Erro ao cadastrar inspeção:", erro.message);

    if (erro.code === "SQLITE_CONSTRAINT_UNIQUE") {
      return res.status(409).json({
        erro: "Esta Ordem de Serviço já possui uma inspeção física cadastrada.",
      });
    }

    if (erro.code === "SQLITE_CONSTRAINT_FOREIGNKEY") {
      return res.status(409).json({
        erro: "Não foi possível vincular a inspeção à OS ou ao técnico informado.",
      });
    }

    res.status(500).json({
      erro: "Erro ao cadastrar a inspeção física. A operação foi desfeita se ocorreu uma falha durante a gravação.",
    });
  }
});

// Atualiza uma inspeção física
app.put("/api/inspecoes/:id", (req, res) => {
  const id = Number(req.params.id);
  const dados = req.body || {};

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({
      erro: "ID da inspeção inválido.",
    });
  }

  const vinculos = validarVinculosInspecao(dados);

  if (vinculos.erro) {
    return res.status(400).json({
      erro: vinculos.erro,
    });
  }

  const validacao = validarInspecao(dados);

  if (validacao.erro) {
    return res.status(400).json({
      erro: validacao.erro,
    });
  }

  const { ordemServicoId, tecnicoId } = vinculos;

  try {
    const inspecao = db
      .prepare("SELECT id FROM inspecoes WHERE id = ?")
      .get(id);

    if (!inspecao) {
      return res.status(404).json({
        erro: "Inspeção não encontrada.",
      });
    }

    const ordem = db
      .prepare("SELECT id FROM ordens_servico WHERE id = ?")
      .get(ordemServicoId);

    if (!ordem) {
      return res.status(404).json({
        erro: "A Ordem de Serviço informada não existe.",
      });
    }

    const tecnico = db
      .prepare("SELECT id FROM tecnicos WHERE id = ?")
      .get(tecnicoId);

    if (!tecnico) {
      return res.status(404).json({
        erro: "O técnico informado não existe.",
      });
    }

    const camposAtualizacao = [
      "ordem_servico_id",
      "tecnico_id",
      "data_inspecao",
      ...camposInspecao,
      "quantidade_parafusos",
      "quantidade_pes",
      "observacoes",
    ];

    const valores = [
      ordemServicoId,
      tecnicoId,
      dados.data_inspecao || new Date().toISOString().slice(0, 10),
      ...camposInspecao.map((campo) => dados[campo]),
      validacao.quantidadeParafusos,
      validacao.quantidadePes,
      dados.observacoes?.trim() || null,
      id,
    ];

    const atribuicoes = camposAtualizacao
      .map((campo) => `${campo} = ?`)
      .join(", ");

    executarTransacao(() => {
      return db
        .prepare(
          `
          UPDATE inspecoes
          SET ${atribuicoes}
          WHERE id = ?
          `,
        )
        .run(...valores);
    });

    res.json({
      mensagem: "Inspeção física atualizada com sucesso!",
    });
  } catch (erro) {
    console.error("Erro ao atualizar inspeção:", erro.message);

    if (erro.code === "SQLITE_CONSTRAINT_UNIQUE") {
      return res.status(409).json({
        erro: "Esta Ordem de Serviço já possui outra inspeção física cadastrada.",
      });
    }

    if (erro.code === "SQLITE_CONSTRAINT_FOREIGNKEY") {
      return res.status(409).json({
        erro: "Não foi possível vincular a inspeção à OS ou ao técnico informado.",
      });
    }

    res.status(500).json({
      erro: "Erro ao atualizar a inspeção física. As alterações foram desfeitas se ocorreu uma falha durante a gravação.",
    });
  }
});

// Exclui uma inspeção física
app.delete("/api/inspecoes/:id", (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({
      erro: "ID da inspeção inválido.",
    });
  }

  try {
    const resultado = db.prepare("DELETE FROM inspecoes WHERE id = ?").run(id);

    if (resultado.changes === 0) {
      return res.status(404).json({
        erro: "Inspeção não encontrada.",
      });
    }

    res.json({
      mensagem: "Inspeção física excluída com sucesso!",
    });
  } catch (erro) {
    console.error("Erro ao excluir inspeção:", erro.message);

    if (erro.code === "SQLITE_CONSTRAINT_FOREIGNKEY") {
      return res.status(409).json({
        erro: "Não é possível excluir esta inspeção porque existem registros vinculados.",
      });
    }

    res.status(500).json({
      erro: "Erro ao excluir a inspeção física.",
    });
  }
});

// ==================================================
// DASHBOARD
// ==================================================

app.get("/api/dashboard", (req, res) => {
  try {
    const totalClientes = db
      .prepare("SELECT COUNT(*) AS total FROM clientes")
      .get().total;

    const totalTecnicos = db
      .prepare("SELECT COUNT(*) AS total FROM tecnicos")
      .get().total;

    const totalOrdens = db
      .prepare("SELECT COUNT(*) AS total FROM ordens_servico")
      .get().total;

    const ordensPorStatus = db
      .prepare(
        `
        SELECT status, COUNT(*) AS total
        FROM ordens_servico
        GROUP BY status
        `,
      )
      .all();

    res.json({
      totalClientes,
      totalTecnicos,
      totalOrdens,
      ordensPorStatus,
    });
  } catch (erro) {
    console.error("Erro ao carregar dashboard:", erro.message);

    res.status(500).json({
      erro: "Erro ao carregar o dashboard.",
    });
  }
});

// ==================================================
// INICIA O SERVIDOR
// ==================================================

app.listen(PORTA, () => {
  console.log(`Servidor rodando em http://localhost:${PORTA}`);
});
