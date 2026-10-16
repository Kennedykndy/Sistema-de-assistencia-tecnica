// ==================================================
// FUNÇÃO GERAL PARA ACESSAR A API
// ==================================================

async function requisicao(url, opcoes = {}) {
  const resposta = await fetch(url, {
    ...opcoes,
    headers: {
      "Content-Type": "application/json",
      ...opcoes.headers,
    },
  });

  // Trata respostas que não sejam JSON
  let dados;

  try {
    dados = await resposta.json();
  } catch {
    dados = {};
  }

  if (!resposta.ok) {
    throw new Error(dados.erro || "Não foi possível concluir a operação.");
  }

  return dados;
}

// Cria uma célula de tabela com segurança
function criarCelula(linha, valor) {
  const celula = document.createElement("td");
  celula.textContent = valor ?? "-";
  linha.appendChild(celula);
  return celula;
}

// Retorna a data local no formato AAAA-MM-DD
function dataLocalISO() {
  const hoje = new Date();
  const ano = hoje.getFullYear();
  const mes = String(hoje.getMonth() + 1).padStart(2, "0");
  const dia = String(hoje.getDate()).padStart(2, "0");

  return `${ano}-${mes}-${dia}`;
}

// Formata uma data para exibição
function dataParaTela(data) {
  if (!data) return "-";

  const partes = data.slice(0, 10).split("-");

  if (partes.length !== 3) return data;

  return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

// ==================================================
// CLIENTES
// ==================================================

const formCliente = document.getElementById("formCliente");

async function carregarClientes() {
  try {
    const clientes = await requisicao("/api/clientes");
    const tabela = document.getElementById("listaClientes");

    tabela.replaceChildren();

    clientes.forEach((cliente) => {
      const linha = document.createElement("tr");

      [
        cliente.id,
        cliente.nome,
        cliente.documento,
        cliente.telefone,
        cliente.email,
      ].forEach((valor) => criarCelula(linha, valor));

      const acoes = criarCelula(linha, "");

      const editar = document.createElement("button");
      editar.textContent = "Editar";
      editar.type = "button";
      editar.className = "botao-editar";
      editar.addEventListener("click", () => editarCliente(cliente.id));

      const excluir = document.createElement("button");
      excluir.textContent = "Excluir";
      excluir.type = "button";
      excluir.className = "botao-excluir";
      excluir.addEventListener("click", () => excluirCliente(cliente.id));

      acoes.append(editar, excluir);
      tabela.appendChild(linha);
    });

    document.getElementById("totalClientes").textContent = clientes.length;
  } catch (erro) {
    alert(erro.message);
  }
}

formCliente.addEventListener("submit", async (evento) => {
  evento.preventDefault();

  const id = document.getElementById("clienteId").value;

  const cliente = {
    nome: document.getElementById("nomeCliente").value.trim(),
    documento: document.getElementById("documentoCliente").value.trim(),
    telefone: document.getElementById("telefoneCliente").value.trim(),
    email: document.getElementById("emailCliente").value.trim(),
    endereco: document.getElementById("enderecoCliente").value.trim(),
  };

  try {
    await requisicao(id ? `/api/clientes/${id}` : "/api/clientes", {
      method: id ? "PUT" : "POST",
      body: JSON.stringify(cliente),
    });

    alert(
      id
        ? "Cliente atualizado com sucesso!"
        : "Cliente cadastrado com sucesso!",
    );

    formCliente.reset();
    document.getElementById("clienteId").value = "";
    document.getElementById("botaoSalvarCliente").textContent =
      "Cadastrar cliente";
    document.getElementById("botaoCancelarCliente").hidden = true;

    await carregarClientes();
    await carregarDashboard();
    await carregarOpcoesOS();
  } catch (erro) {
    alert(erro.message);
  }
});

async function editarCliente(id) {
  try {
    const cliente = await requisicao(`/api/clientes/${id}`);

    document.getElementById("clienteId").value = cliente.id;
    document.getElementById("nomeCliente").value = cliente.nome ?? "";
    document.getElementById("documentoCliente").value = cliente.documento ?? "";
    document.getElementById("telefoneCliente").value = cliente.telefone ?? "";
    document.getElementById("emailCliente").value = cliente.email ?? "";
    document.getElementById("enderecoCliente").value = cliente.endereco ?? "";

    document.getElementById("botaoSalvarCliente").textContent =
      "Salvar alterações";
    document.getElementById("botaoCancelarCliente").hidden = false;

    formCliente.scrollIntoView({ behavior: "smooth" });
  } catch (erro) {
    alert(erro.message);
  }
}

async function excluirCliente(id) {
  if (!confirm("Deseja realmente excluir este cliente?")) return;

  try {
    await requisicao(`/api/clientes/${id}`, { method: "DELETE" });

    alert("Cliente excluído com sucesso!");

    await carregarClientes();
    await carregarDashboard();
    await carregarOpcoesOS();
  } catch (erro) {
    alert(erro.message);
  }
}

document
  .getElementById("botaoCancelarCliente")
  .addEventListener("click", () => {
    formCliente.reset();
    document.getElementById("clienteId").value = "";
    document.getElementById("botaoSalvarCliente").textContent =
      "Cadastrar cliente";
    document.getElementById("botaoCancelarCliente").hidden = true;
  });

// ==================================================
// TÉCNICOS
// ==================================================

const formTecnico = document.getElementById("formTecnico");

async function carregarTecnicos() {
  try {
    const tecnicos = await requisicao("/api/tecnicos");
    const tabela = document.getElementById("listaTecnicos");

    tabela.replaceChildren();

    tecnicos.forEach((tecnico) => {
      const linha = document.createElement("tr");

      [
        tecnico.id,
        tecnico.nome,
        tecnico.telefone,
        tecnico.email,
        tecnico.identificacao_profissional,
      ].forEach((valor) => criarCelula(linha, valor));

      const acoes = criarCelula(linha, "");

      const editar = document.createElement("button");
      editar.textContent = "Editar";
      editar.type = "button";
      editar.className = "botao-editar";
      editar.addEventListener("click", () => editarTecnico(tecnico.id));

      const excluir = document.createElement("button");
      excluir.textContent = "Excluir";
      excluir.type = "button";
      excluir.className = "botao-excluir";
      excluir.addEventListener("click", () => excluirTecnico(tecnico.id));

      acoes.append(editar, excluir);
      tabela.appendChild(linha);
    });

    document.getElementById("totalTecnicos").textContent = tecnicos.length;
  } catch (erro) {
    alert(erro.message);
  }
}

formTecnico.addEventListener("submit", async (evento) => {
  evento.preventDefault();

  const id = document.getElementById("tecnicoId").value;

  const tecnico = {
    nome: document.getElementById("nomeTecnico").value.trim(),
    telefone: document.getElementById("telefoneTecnico").value.trim(),
    email: document.getElementById("emailTecnico").value.trim(),
    identificacao_profissional: document
      .getElementById("identificacaoTecnico")
      .value.trim(),
  };

  try {
    await requisicao(id ? `/api/tecnicos/${id}` : "/api/tecnicos", {
      method: id ? "PUT" : "POST",
      body: JSON.stringify(tecnico),
    });

    alert(
      id
        ? "Técnico atualizado com sucesso!"
        : "Técnico cadastrado com sucesso!",
    );

    formTecnico.reset();
    document.getElementById("tecnicoId").value = "";
    document.getElementById("botaoSalvarTecnico").textContent =
      "Cadastrar técnico";
    document.getElementById("botaoCancelarTecnico").hidden = true;

    await carregarTecnicos();
    await carregarDashboard();
    await carregarOpcoesOS();
  } catch (erro) {
    alert(erro.message);
  }
});

async function editarTecnico(id) {
  try {
    const tecnico = await requisicao(`/api/tecnicos/${id}`);

    document.getElementById("tecnicoId").value = tecnico.id;
    document.getElementById("nomeTecnico").value = tecnico.nome ?? "";
    document.getElementById("telefoneTecnico").value = tecnico.telefone ?? "";
    document.getElementById("emailTecnico").value = tecnico.email ?? "";
    document.getElementById("identificacaoTecnico").value =
      tecnico.identificacao_profissional ?? "";

    document.getElementById("botaoSalvarTecnico").textContent =
      "Salvar alterações";
    document.getElementById("botaoCancelarTecnico").hidden = false;

    formTecnico.scrollIntoView({ behavior: "smooth" });
  } catch (erro) {
    alert(erro.message);
  }
}

async function excluirTecnico(id) {
  if (!confirm("Deseja realmente excluir este técnico?")) return;

  try {
    await requisicao(`/api/tecnicos/${id}`, { method: "DELETE" });

    alert("Técnico excluído com sucesso!");

    await carregarTecnicos();
    await carregarDashboard();
    await carregarOpcoesOS();
  } catch (erro) {
    alert(erro.message);
  }
}

document
  .getElementById("botaoCancelarTecnico")
  .addEventListener("click", () => {
    formTecnico.reset();
    document.getElementById("tecnicoId").value = "";
    document.getElementById("botaoSalvarTecnico").textContent =
      "Cadastrar técnico";
    document.getElementById("botaoCancelarTecnico").hidden = true;
  });

// ==================================================
// OPÇÕES DE CLIENTES E TÉCNICOS PARA A OS
// ==================================================

async function carregarOpcoesOS() {
  try {
    const [clientes, tecnicos] = await Promise.all([
      requisicao("/api/clientes"),
      requisicao("/api/tecnicos"),
    ]);

    const campoCliente = document.getElementById("clienteOS");
    const campoTecnico = document.getElementById("tecnicoOS");

    const clienteSelecionado = campoCliente.value;
    const tecnicoSelecionado = campoTecnico.value;

    campoCliente.replaceChildren();
    campoTecnico.replaceChildren();

    campoCliente.add(new Option("Selecione um cliente", ""));
    campoTecnico.add(new Option("Sem técnico definido", ""));

    clientes.forEach((cliente) => {
      campoCliente.add(new Option(cliente.nome, String(cliente.id)));
    });

    tecnicos.forEach((tecnico) => {
      campoTecnico.add(new Option(tecnico.nome, String(tecnico.id)));
    });

    if (clientes.some((cliente) => String(cliente.id) === clienteSelecionado)) {
      campoCliente.value = clienteSelecionado;
    }

    if (tecnicos.some((tecnico) => String(tecnico.id) === tecnicoSelecionado)) {
      campoTecnico.value = tecnicoSelecionado;
    }
  } catch (erro) {
    alert("Erro ao carregar clientes e técnicos para a OS: " + erro.message);
  }
}

// ==================================================
// ORDENS DE SERVIÇO
// ==================================================

const formOS = document.getElementById("formOS");

function limparFormularioOS() {
  formOS.reset();

  document.getElementById("osId").value = "";
  document.getElementById("dataAberturaOS").value = dataLocalISO();
  document.getElementById("statusOS").value = "Aberta";
  document.getElementById("botaoSalvarOS").textContent = "Cadastrar OS";
  document.getElementById("botaoCancelarOS").hidden = true;
}

async function carregarOS() {
  try {
    const ordens = await requisicao("/api/ordens-servico");
    const tabela = document.getElementById("listaOS");

    tabela.replaceChildren();

    ordens.forEach((ordem) => {
      const linha = document.createElement("tr");

      [
        ordem.id,
        ordem.numero_os,
        ordem.nome_cliente,
        ordem.nome_tecnico || "Não definido",
        ordem.equipamento,
        dataParaTela(ordem.data_abertura),
        ordem.status,
      ].forEach((valor) => criarCelula(linha, valor));

      const acoes = criarCelula(linha, "");

      const editar = document.createElement("button");
      editar.textContent = "Editar";
      editar.type = "button";
      editar.className = "botao-editar";
      editar.addEventListener("click", () => editarOS(ordem.id));

      const excluir = document.createElement("button");
      excluir.textContent = "Excluir";
      excluir.type = "button";
      excluir.className = "botao-excluir";
      excluir.addEventListener("click", () => excluirOS(ordem.id));

      acoes.append(editar, excluir);
      tabela.appendChild(linha);
    });

    await carregarDashboard();
  } catch (erro) {
    alert("Erro ao carregar ordens de serviço: " + erro.message);
  }
}

formOS.addEventListener("submit", async (evento) => {
  evento.preventDefault();

  const id = document.getElementById("osId").value;

  const ordem = {
    cliente_id: document.getElementById("clienteOS").value,
    tecnico_id: document.getElementById("tecnicoOS").value || null,
    data_abertura: document.getElementById("dataAberturaOS").value,
    equipamento: document.getElementById("equipamentoOS").value.trim(),
    marca: document.getElementById("marcaOS").value.trim(),
    modelo: document.getElementById("modeloOS").value.trim(),
    numero_serie: document.getElementById("serieOS").value.trim(),
    acessorios_recebidos: document.getElementById("acessoriosOS").value.trim(),
    defeito_informado: document.getElementById("defeitoOS").value.trim(),
    status: document.getElementById("statusOS").value,
    recebido_por: document.getElementById("recebidoPorOS").value.trim(),
  };

  try {
    const resultado = await requisicao(
      id ? `/api/ordens-servico/${id}` : "/api/ordens-servico",
      {
        method: id ? "PUT" : "POST",
        body: JSON.stringify(ordem),
      },
    );

    alert(
      id
        ? "Ordem de serviço atualizada com sucesso!"
        : `Ordem de serviço cadastrada com sucesso!\nNúmero: ${resultado.numero_os}`,
    );

    limparFormularioOS();

    await carregarOS();
    await carregarOpcoesInspecao();
  } catch (erro) {
    alert(erro.message);
  }
});

async function editarOS(id) {
  try {
    const ordem = await requisicao(`/api/ordens-servico/${id}`);

    document.getElementById("osId").value = ordem.id;
    document.getElementById("clienteOS").value = String(ordem.cliente_id);
    document.getElementById("tecnicoOS").value = ordem.tecnico_id
      ? String(ordem.tecnico_id)
      : "";

    document.getElementById("dataAberturaOS").value = ordem.data_abertura ?? "";
    document.getElementById("equipamentoOS").value = ordem.equipamento ?? "";
    document.getElementById("marcaOS").value = ordem.marca ?? "";
    document.getElementById("modeloOS").value = ordem.modelo ?? "";
    document.getElementById("serieOS").value = ordem.numero_serie ?? "";
    document.getElementById("acessoriosOS").value =
      ordem.acessorios_recebidos ?? "";
    document.getElementById("defeitoOS").value = ordem.defeito_informado ?? "";
    document.getElementById("statusOS").value = ordem.status;
    document.getElementById("recebidoPorOS").value = ordem.recebido_por ?? "";

    document.getElementById("botaoSalvarOS").textContent = "Salvar alterações";
    document.getElementById("botaoCancelarOS").hidden = false;

    formOS.scrollIntoView({ behavior: "smooth" });
  } catch (erro) {
    alert(erro.message);
  }
}

async function excluirOS(id) {
  if (!confirm("Deseja realmente excluir esta ordem de serviço?")) return;

  try {
    await requisicao(`/api/ordens-servico/${id}`, { method: "DELETE" });

    alert("Ordem de serviço excluída com sucesso!");

    await carregarOS();
    await carregarOpcoesInspecao();
  } catch (erro) {
    alert(erro.message);
  }
}

document.getElementById("botaoCancelarOS").addEventListener("click", () => {
  limparFormularioOS();
});

// ==================================================
// INSPEÇÃO FÍSICA
// ==================================================

// Lista os nomes dos campos dos 16 itens
const camposInspecao = Array.from({ length: 16 }, (_, indice) => {
  return `item_${String(indice + 1).padStart(2, "0")}`;
});

const formInspecao = document.getElementById("formInspecao");

// Carrega as OS e os técnicos nos campos da inspeção
async function carregarOpcoesInspecao() {
  try {
    const [ordens, tecnicos] = await Promise.all([
      requisicao("/api/ordens-servico"),
      requisicao("/api/tecnicos"),
    ]);

    const campoOS = document.getElementById("ordemInspecao");
    const campoTecnico = document.getElementById("tecnicoInspecao");

    const osSelecionada = campoOS.value;
    const tecnicoSelecionado = campoTecnico.value;

    campoOS.replaceChildren();
    campoTecnico.replaceChildren();

    campoOS.add(new Option("Selecione uma OS", ""));
    campoTecnico.add(new Option("Sem técnico definido", ""));

    ordens.forEach((ordem) => {
      const descricao = `${ordem.numero_os} - ${ordem.equipamento} - ${ordem.nome_cliente}`;

      campoOS.add(new Option(descricao, String(ordem.id)));
    });

    tecnicos.forEach((tecnico) => {
      campoTecnico.add(new Option(tecnico.nome, String(tecnico.id)));
    });

    if (ordens.some((ordem) => String(ordem.id) === osSelecionada)) {
      campoOS.value = osSelecionada;
    }

    if (tecnicos.some((tecnico) => String(tecnico.id) === tecnicoSelecionado)) {
      campoTecnico.value = tecnicoSelecionado;
    }
  } catch (erro) {
    alert("Erro ao carregar as opções da inspeção: " + erro.message);
  }
}

// Prepara o formulário para um novo cadastro
function limparFormularioInspecao() {
  formInspecao.reset();

  document.getElementById("inspecaoId").value = "";
  document.getElementById("dataInspecao").value = dataLocalISO();

  document.getElementById("botaoSalvarInspecao").textContent =
    "Cadastrar inspeção";

  document.getElementById("botaoCancelarInspecao").hidden = true;
}

// Lista as inspeções cadastradas
async function carregarInspecoes() {
  try {
    const inspecoes = await requisicao("/api/inspecoes");
    const tabela = document.getElementById("listaInspecoes");

    tabela.replaceChildren();

    inspecoes.forEach((inspecao) => {
      const linha = document.createElement("tr");

      [
        inspecao.id,
        inspecao.numero_os || inspecao.ordem_servico_id,
        inspecao.equipamento || "-",
        dataParaTela(inspecao.data_inspecao),
        inspecao.nome_tecnico || "Não definido",
      ].forEach((valor) => criarCelula(linha, valor));

      const acoes = criarCelula(linha, "");

      const editar = document.createElement("button");
      editar.textContent = "Editar";
      editar.type = "button";
      editar.className = "botao-editar";
      editar.addEventListener("click", () => editarInspecao(inspecao.id));

      const excluir = document.createElement("button");
      excluir.textContent = "Excluir";
      excluir.type = "button";
      excluir.className = "botao-excluir";
      excluir.addEventListener("click", () => excluirInspecao(inspecao.id));

      acoes.append(editar, excluir);
      tabela.appendChild(linha);
    });
  } catch (erro) {
    alert("Erro ao carregar inspeções: " + erro.message);
  }
}

// Cadastra ou atualiza uma inspeção
formInspecao.addEventListener("submit", async (evento) => {
  evento.preventDefault();

  const id = document.getElementById("inspecaoId").value;

  const inspecao = {
    ordem_servico_id: document.getElementById("ordemInspecao").value,
    tecnico_id: document.getElementById("tecnicoInspecao").value || null,
    data_inspecao: document.getElementById("dataInspecao").value,
    observacoes: document.getElementById("observacoesInspecao").value.trim(),
  };

  // Adiciona ao objeto os 16 itens da inspeção
  camposInspecao.forEach((campo) => {
    inspecao[campo] = document.getElementById(campo).value || null;
  });

  try {
    await requisicao(id ? `/api/inspecoes/${id}` : "/api/inspecoes", {
      method: id ? "PUT" : "POST",
      body: JSON.stringify(inspecao),
    });

    alert(
      id
        ? "Inspeção física atualizada com sucesso!"
        : "Inspeção física cadastrada com sucesso!",
    );

    limparFormularioInspecao();

    await carregarInspecoes();
    await carregarOpcoesInspecao();
  } catch (erro) {
    alert(erro.message);
  }
});

// Carrega uma inspeção no formulário para edição
async function editarInspecao(id) {
  try {
    const inspecao = await requisicao(`/api/inspecoes/${id}`);

    // Atualiza as opções antes de selecionar a OS e o técnico
    await carregarOpcoesInspecao();

    document.getElementById("inspecaoId").value = inspecao.id;
    document.getElementById("ordemInspecao").value = String(
      inspecao.ordem_servico_id,
    );

    document.getElementById("tecnicoInspecao").value = inspecao.tecnico_id
      ? String(inspecao.tecnico_id)
      : "";

    document.getElementById("dataInspecao").value =
      inspecao.data_inspecao ?? "";

    document.getElementById("observacoesInspecao").value =
      inspecao.observacoes ?? "";

    // Preenche os 16 itens com os valores salvos
    camposInspecao.forEach((campo) => {
      document.getElementById(campo).value = inspecao[campo] ?? "";
    });

    document.getElementById("botaoSalvarInspecao").textContent =
      "Salvar alterações";

    document.getElementById("botaoCancelarInspecao").hidden = false;

    formInspecao.scrollIntoView({ behavior: "smooth" });
  } catch (erro) {
    alert("Erro ao carregar a inspeção para edição: " + erro.message);
  }
}

// Exclui uma inspeção
async function excluirInspecao(id) {
  if (!confirm("Deseja realmente excluir esta inspeção física?")) return;

  try {
    await requisicao(`/api/inspecoes/${id}`, {
      method: "DELETE",
    });

    alert("Inspeção física excluída com sucesso!");

    await carregarInspecoes();
  } catch (erro) {
    alert(erro.message);
  }
}

// Cancela a edição ou limpa o formulário
document
  .getElementById("botaoCancelarInspecao")
  .addEventListener("click", () => {
    limparFormularioInspecao();
  });

// ==================================================
// PAINEL DE INDICADORES
// ==================================================

async function carregarDashboard() {
  try {
    const dados = await requisicao("/api/dashboard");

    document.getElementById("totalClientes").textContent = dados.totalClientes;

    document.getElementById("totalTecnicos").textContent = dados.totalTecnicos;

    document.getElementById("totalOrdens").textContent = dados.totalOrdens;
  } catch (erro) {
    console.error("Erro ao carregar painel:", erro);
  }
}

// ==================================================
// INICIALIZAÇÃO DO SISTEMA
// ==================================================

async function iniciarSistema() {
  document.getElementById("dataAberturaOS").value = dataLocalISO();
  document.getElementById("dataInspecao").value = dataLocalISO();

  await Promise.all([
    carregarClientes(),
    carregarTecnicos(),
    carregarDashboard(),
  ]);

  await carregarOpcoesOS();
  await carregarOS();
  await carregarOpcoesInspecao();
  await carregarInspecoes();
}

iniciarSistema();
