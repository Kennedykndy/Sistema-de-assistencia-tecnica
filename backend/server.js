// Importa o Express para criar o servidor
const express = require("express");
const path = require("path");

// Importa a conexão com o banco de dados SQLite
const db = require("./database");

// Cria a aplicação Express
const app = express();

// Define a porta do servidor
const PORTA = 3000;

// Permite receber dados no formato JSON
app.use(express.json());

// Disponibiliza os arquivos do frontend
app.use(express.static(path.join(__dirname, "../frontend")));

// Rota inicial da API
app.get("/api", (req, res) => {
  res.json({
    mensagem: "API do sistema de assistência técnica funcionando!",
  });
});

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
    res.status(500).json({
      erro: "Erro ao buscar cliente.",
    });
  }
});

// Cadastra um cliente
app.post("/api/clientes", (req, res) => {
  const { nome, documento, telefone, email, endereco } = req.body;

  if (!nome || !String(nome).trim()) {
    return res.status(400).json({
      erro: "O nome do cliente é obrigatório.",
    });
  }

  try {
    const resultado = db
      .prepare(
        `
        INSERT INTO clientes
          (nome, documento, telefone, email, endereco)
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
    res.status(500).json({
      erro: "Erro ao cadastrar cliente.",
    });
  }
});

// Atualiza um cliente
app.put("/api/clientes/:id", (req, res) => {
  const id = Number(req.params.id);
  const { nome, documento, telefone, email, endereco } = req.body;

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
    res.status(500).json({
      erro: "Erro ao buscar técnico.",
    });
  }
});

// Cadastra um técnico
app.post("/api/tecnicos", (req, res) => {
  const { nome, telefone, email, identificacao_profissional } = req.body;

  if (!nome || !String(nome).trim()) {
    return res.status(400).json({
      erro: "O nome do técnico é obrigatório.",
    });
  }

  try {
    const resultado = db
      .prepare(
        `
        INSERT INTO tecnicos
          (nome, telefone, email, identificacao_profissional)
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
    res.status(500).json({
      erro: "Erro ao cadastrar técnico.",
    });
  }
});

// Atualiza um técnico
app.put("/api/tecnicos/:id", (req, res) => {
  const id = Number(req.params.id);
  const { nome, telefone, email, identificacao_profissional } = req.body;

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
      INNER JOIN clientes c ON c.id = os.cliente_id
      LEFT JOIN tecnicos t ON t.id = os.tecnico_id
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
      .prepare(
        `
      SELECT *
      FROM ordens_servico
      WHERE id = ?
    `,
      )
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
  } = req.body;

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

  const statusFinal = status || "Aberta";

  if (!statusPermitidos.includes(statusFinal)) {
    return res.status(400).json({
      erro: "Status da ordem de serviço inválido.",
    });
  }

  try {
    // Confere se o cliente existe
    const cliente = db
      .prepare("SELECT id FROM clientes WHERE id = ?")
      .get(clienteId);

    if (!cliente) {
      return res.status(400).json({
        erro: "O cliente selecionado não existe.",
      });
    }

    // Confere se o técnico existe, quando informado
    if (tecnicoId !== null) {
      const tecnico = db
        .prepare("SELECT id FROM tecnicos WHERE id = ?")
        .get(tecnicoId);

      if (!tecnico) {
        return res.status(400).json({
          erro: "O técnico selecionado não existe.",
        });
      }
    }

    // Gera um número único para a ordem de serviço
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
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
  } = req.body;

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
      return res.status(400).json({
        erro: "O cliente selecionado não existe.",
      });
    }

    if (tecnicoId !== null) {
      const tecnico = db
        .prepare("SELECT id FROM tecnicos WHERE id = ?")
        .get(tecnicoId);

      if (!tecnico) {
        return res.status(400).json({
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
// DASHBOARD
// ==================================================

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

// Nomes das colunas dos 16 itens
const camposInspecao = Object.keys(opcoesInspecao);

// Valida os dados enviados para a inspeção
function validarInspecao(dados) {
  for (const campo of camposInspecao) {
    const valor = dados[campo];

    // Permite deixar um item sem preenchimento durante o cadastro
    if (valor === undefined || valor === null || valor === "") {
      continue;
    }

    if (!opcoesInspecao[campo].includes(valor)) {
      return `Opção inválida para o campo ${campo}.`;
    }
  }

  if (
    dados.observacoes !== undefined &&
    dados.observacoes !== null &&
    typeof dados.observacoes !== "string"
  ) {
    return "O campo observações deve ser um texto.";
  }

  return null;
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
        LEFT JOIN tecnicos t
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
        LEFT JOIN tecnicos t
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
  const dados = req.body;

  const ordemServicoId = Number(dados.ordem_servico_id);

  const tecnicoId =
    dados.tecnico_id === "" ||
    dados.tecnico_id === null ||
    dados.tecnico_id === undefined
      ? null
      : Number(dados.tecnico_id);

  if (!Number.isInteger(ordemServicoId) || ordemServicoId <= 0) {
    return res.status(400).json({
      erro: "Selecione uma Ordem de Serviço válida.",
    });
  }

  if (tecnicoId !== null && (!Number.isInteger(tecnicoId) || tecnicoId <= 0)) {
    return res.status(400).json({
      erro: "Selecione um técnico válido.",
    });
  }

  const erroValidacao = validarInspecao(dados);

  if (erroValidacao) {
    return res.status(400).json({
      erro: erroValidacao,
    });
  }

  try {
    // Confere se a Ordem de Serviço existe
    const ordem = db
      .prepare("SELECT id FROM ordens_servico WHERE id = ?")
      .get(ordemServicoId);

    if (!ordem) {
      return res.status(400).json({
        erro: "A Ordem de Serviço informada não existe.",
      });
    }

    // Confere se o técnico existe, caso tenha sido informado
    if (tecnicoId !== null) {
      const tecnico = db
        .prepare("SELECT id FROM tecnicos WHERE id = ?")
        .get(tecnicoId);

      if (!tecnico) {
        return res.status(400).json({
          erro: "O técnico informado não existe.",
        });
      }
    }

    // Monta os campos e valores do cadastro
    const colunas = [
      "ordem_servico_id",
      "tecnico_id",
      "data_inspecao",
      ...camposInspecao,
      "observacoes",
    ];

    const valores = [
      ordemServicoId,
      tecnicoId,
      dados.data_inspecao || new Date().toISOString().slice(0, 10),
      ...camposInspecao.map((campo) => dados[campo] || null),
      dados.observacoes || null,
    ];

    const sql = `
      INSERT INTO inspecoes (${colunas.join(", ")})
      VALUES (${colunas.map(() => "?").join(", ")})
    `;

    const resultado = db.prepare(sql).run(...valores);

    res.status(201).json({
      mensagem: "Inspeção física cadastrada com sucesso!",
      id: resultado.lastInsertRowid,
    });
  } catch (erro) {
    console.error("Erro ao cadastrar inspeção:", erro.message);

    // Uma OS só pode ter uma inspeção, conforme a estrutura atual do banco
    if (erro.code === "SQLITE_CONSTRAINT_UNIQUE") {
      return res.status(409).json({
        erro: "Esta Ordem de Serviço já possui uma inspeção física cadastrada.",
      });
    }

    if (erro.code === "SQLITE_CONSTRAINT_FOREIGNKEY") {
      return res.status(400).json({
        erro: "A Ordem de Serviço ou o técnico informado não existe.",
      });
    }

    res.status(500).json({
      erro: "Erro ao cadastrar a inspeção física.",
    });
  }
});

// Atualiza uma inspeção física
app.put("/api/inspecoes/:id", (req, res) => {
  const id = Number(req.params.id);
  const dados = req.body;

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({
      erro: "ID da inspeção inválido.",
    });
  }

  const ordemServicoId = Number(dados.ordem_servico_id);

  const tecnicoId =
    dados.tecnico_id === "" ||
    dados.tecnico_id === null ||
    dados.tecnico_id === undefined
      ? null
      : Number(dados.tecnico_id);

  if (!Number.isInteger(ordemServicoId) || ordemServicoId <= 0) {
    return res.status(400).json({
      erro: "Selecione uma Ordem de Serviço válida.",
    });
  }

  if (tecnicoId !== null && (!Number.isInteger(tecnicoId) || tecnicoId <= 0)) {
    return res.status(400).json({
      erro: "Selecione um técnico válido.",
    });
  }

  const erroValidacao = validarInspecao(dados);

  if (erroValidacao) {
    return res.status(400).json({
      erro: erroValidacao,
    });
  }

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
      return res.status(400).json({
        erro: "A Ordem de Serviço informada não existe.",
      });
    }

    if (tecnicoId !== null) {
      const tecnico = db
        .prepare("SELECT id FROM tecnicos WHERE id = ?")
        .get(tecnicoId);

      if (!tecnico) {
        return res.status(400).json({
          erro: "O técnico informado não existe.",
        });
      }
    }

    const camposAtualizacao = [
      "ordem_servico_id",
      "tecnico_id",
      "data_inspecao",
      ...camposInspecao,
      "observacoes",
    ];

    const valores = [
      ordemServicoId,
      tecnicoId,
      dados.data_inspecao || new Date().toISOString().slice(0, 10),
      ...camposInspecao.map((campo) => dados[campo] || null),
      dados.observacoes || null,
      id,
    ];

    const atribuicoes = camposAtualizacao
      .map((campo) => `${campo} = ?`)
      .join(", ");

    db.prepare(
      `
      UPDATE inspecoes
      SET ${atribuicoes}
      WHERE id = ?
    `,
    ).run(...valores);

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

    res.status(500).json({
      erro: "Erro ao atualizar a inspeção física.",
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

    res.status(500).json({
      erro: "Erro ao excluir a inspeção física.",
    });
  }
});

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
    res.status(500).json({
      erro: "Erro ao carregar o dashboard.",
    });
  }
});

// Inicia o servidor
app.listen(PORTA, () => {
  console.log(`Servidor rodando em http://localhost:${PORTA}`);
});
