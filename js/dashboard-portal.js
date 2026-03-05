const supabaseLogin = window.supabaseClientPortal;

async function verificarLogin() {

  const { data } = await supabaseLogin.auth.getSession();

  if (!data.session) {
    window.location.href = "index.html";
    return;
  }

  const { data: userData } =
    await supabaseLogin.auth.getUser();

  const role = userData.user?.app_metadata?.role;

  if (role !== "cliente") {

    await supabaseLogin.auth.signOut();

    alert("Acesso restrito aos clientes.");

    window.location.href = "index.html";
    return;
  }

}

verificarLogin();

async function carregarUsuario() {

  const { data } = await supabaseLogin.auth.getUser();

  if (data.user) {
    const email = data.user.email;
    const nome = email.split("@")[0];

    document.getElementById("adminNome").innerText =
      nome.charAt(0).toUpperCase() + nome.slice(1);
  }
}

carregarUsuario();

async function logout() {
  await supabaseLogin.auth.signOut();
  window.location.href = "index.html";
}

let clienteAtual = null;

async function carregarCliente() {

  const { data: { user } } = await  supabaseLogin.auth.getUser();

  const { data, error } = await supabaseLogin
    .from("clientes")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (error) {
    console.error(error);
    return;
  }

  clienteAtual = data;

  renderizarDados();
  renderizarProposta();
  renderizarTimeline();
  renderizarPagamentos();
}

document.addEventListener("DOMContentLoaded", carregarCliente);

// =============================
// MAPA STATUS INTERNO -> CLIENTE
// =============================

const statusMap = {
  "Proposta": {
    label: "Proposta enviada",
    descricao: "Estamos aguardando sua análise da proposta enviada."
  },
  "Contrato": {
    label: "Formalização do projeto",
    descricao: "Estamos formalizando os detalhes para iniciar o desenvolvimento."
  },
  "Aguardando Pagamento": {
  label: "Aguardando pagamento",
  descricao: "Estamos aguardando a confirmação do pagamento para iniciar o desenvolvimento."
},
  "Em Desenvolvimento": {
    label: "Projeto em desenvolvimento",
    descricao: "Nossa equipe já está trabalhando na sua solução."
  },
  "Homologação": {
    label: "Fase final de validação",
    descricao: "Estamos realizando ajustes finais e validações."
  },
  "Aguardando Produção": {
  label: "Preparando a versão final",
  descricao: "Estamos realizando os últimos ajustes para disponibilizar o sistema concluído."
},
  "Fechado": {
    label: "Projeto concluído",
    descricao: "O projeto foi finalizado com sucesso."
  }
};

const etapasInternas = [
  "Proposta",
  "Contrato",
  "Aguardando Pagamento",
  "Em Desenvolvimento",
  "Homologação",
  "Aguardando Produção",
  "Fechado"
];

// =============================
// DADOS
// =============================

function renderizarDados() {
  document.getElementById("dadosCliente").innerHTML = `
    <h5>🧾 Dados</h5>
    <p><strong>Nome:</strong> ${clienteAtual.nome}</p>
    <p><strong>Email:</strong> ${clienteAtual.email}</p>
    <p><strong>WhatsApp:</strong> ${clienteAtual.whatsapp}</p>
  `;
}

// =============================
// PROPOSTA
// =============================

function renderizarProposta() {

  let botoes = `
    <button class="btn btn-primary"
          onclick="visualizarProposta('${clienteAtual.lead_id}')">
          📄 Visualizar Proposta
        </button>
  `;

  // ==========================================
  // ETAPA 1 - PROPOSTA
  // ==========================================
  if (!clienteAtual.proposta_aceita &&
      clienteAtual.status === "Proposta") {

    botoes += `
      <button class="btn btn-success me-2" onclick="aceitarProposta()">
        ✅ Aceitar Proposta
      </button>
      <button class="btn btn-danger me-2" onclick="recusarProposta()">
        ❌ Recusar Proposta
      </button>
    `;
  }

  // ==========================================
// ETAPA 2 - CONTRATO (VISUALIZAÇÃO PERMANENTE)
// ==========================================

if (
  ["Contrato", "Aguardando Pagamento", "Em Desenvolvimento", "Homologação", "Aguardando Produção", "Fechado"]
    .includes(clienteAtual.status)
) {

  botoes += `
    <hr class="my-3">

    <button class="btn btn-primary"
          onclick="visualizarContrato('${clienteAtual.lead_id}')">
          📄 Visualizar Contrato
        </button>
  `;
}

// ==========================================
// BOTÃO ACEITAR CONTRATO (SÓ NA ETAPA CONTRATO)
// ==========================================

if (clienteAtual.status === "Contrato" && !clienteAtual.contrato_aceito) {

  botoes += `
    <button class="btn btn-success me-2"
            onclick="aceitarContrato()">
      ✍️ Aceitar Contrato
    </button>

    <button class="btn btn-danger"
            onclick="recusarContrato()">
      ❌ Recusar Contrato
    </button>
  `;
}

// ==========================================
// ETAPA HOMOLOGAÇÃO
// ==========================================

if (clienteAtual.status === "Homologação") {

  botoes += `
    <hr class="my-3">

    <h5>🔎 Ambiente de testes</h5>

    <a href="${clienteAtual.homolog_url}"
       target="_blank"
       class="btn btn-warning me-2">
       🌐 Acessar ambiente de testes
    </a>

    <button class="btn btn-success"
            onclick="aprovarHomologacao()">
      ✅ Aprovar Entrega
    </button>
  `;
}

if (clienteAtual.status === "Aguardando Produção") {

  botoes += `
    <hr class="my-3">

    <div class="alert alert-info mt-3">
      🚀 Estamos preparando a publicação do sistema em ambiente de produção.
    </div>
  `;
}

if (clienteAtual.status === "Fechado") {

  botoes += `
    <hr class="my-3">

    <h5>🌍 Projeto concluído</h5>

    <a href="${clienteAtual.producao_url}"
       target="_blank"
       class="btn btn-success">
       🔗 Acessar sistema em produção
    </a>
  `;
}

  document.getElementById("propostaCliente").innerHTML = `
    <h5>📑 Proposta</h5>
    <p><strong>Número:</strong> ${clienteAtual.numero_proposta}</p>
    <p><strong>Escopo:</strong> ${clienteAtual.escopo_resumido}</p>
    <p><strong>Valor:</strong> R$ ${clienteAtual.valor_proposta.toLocaleString()}</p>
    <p><strong>Prazo:</strong> ${clienteAtual.prazo_estimado}</p>
    <div class="mt-3">${botoes}</div>
  `;
}

// =============================
// ACEITE
// =============================

async function aceitarProposta() {

  const { error } = await supabaseLogin
    .from("clientes")
    .update({
      proposta_aceita: true,
      proposta_aceita_em: new Date(),
      status: "Contrato"
    })
    .eq("id", clienteAtual.id);

  if (!error) {
    clienteAtual.proposta_aceita = true;
    clienteAtual.status = "Contrato";

    // Atualiza lead
    await supabaseLogin
      .from("leads")
      .update({ status: clienteAtual.status })
      .eq("id", clienteAtual.lead_id);

  const { data: leadAtual } = await supabaseLogin
  .from("leads")
  .select("*")
  .eq("id", clienteAtual.lead_id);
    //Atualiza lead para "Contrato" e gera o contrato para liberar acesso ao contrato
    await gerarContratoPDF(leadAtual[0]);

    atualizarTela();
  }
}

function recusarProposta() {

  const motivo = prompt("Por favor, informe o motivo da recusa da proposta:");

  if (!motivo || motivo.trim() === "") {
    alert("É necessário informar o motivo do cancelamento.");
    return;
  }

  clienteAtual.proposta_recusada = true;
  clienteAtual.status = "Cancelado";
  clienteAtual.motivo_cancelamento = motivo;
  clienteAtual.tipo_cancelamento = "proposta";

  atualizarTela();
}

async function aceitarContrato() {

  const { error } = await supabaseLogin
    .from("clientes")
    .update({
      contrato_aceito: true,
      contrato_aceito_em: new Date(),
      status: "Aguardando Pagamento",
      pagamento_status: "Pendente"
    })
    .eq("id", clienteAtual.id);

  if (!error) {
    clienteAtual.contrato_aceito = true;
    clienteAtual.status = "Aguardando Pagamento";
    clienteAtual.pagamento_status = "Pendente";

    // Atualiza lead
    await supabaseLogin
      .from("leads")
      .update({ status: clienteAtual.status })
      .eq("id", clienteAtual.lead_id);
    atualizarTela();
  }
}

function recusarContrato() {

  const motivo = prompt("Por favor, informe o motivo da recusa do contrato:");

  if (!motivo || motivo.trim() === "") {
    alert("É necessário informar o motivo do cancelamento.");
    return;
  }

  clienteAtual.contrato_recusado = true;
  clienteAtual.status = "Cancelado";
  clienteAtual.motivo_cancelamento = motivo;
  clienteAtual.tipo_cancelamento = "contrato";

  atualizarTela();
}

function mostrarSucessoContrato() {

  const alerta = document.createElement("div");
  alerta.className = "alert alert-success mt-3 shadow-sm";
  alerta.innerHTML = `
    ✅ Contrato aceito com sucesso!
    Estamos aguardando a confirmação do pagamento para iniciar o desenvolvimento.
  `;

  document.querySelector(".container").prepend(alerta);

  setTimeout(() => {
    alerta.remove();
  }, 4000);
}

function atualizarTela() {
  renderizarProposta();
  renderizarTimeline();
  renderizarPagamentos();
}

async function aprovarHomologacao() {

  const { error } = await supabaseLogin
    .from("clientes")
    .update({
      status: "Aguardando Produção"
    })
    .eq("id", clienteAtual.id);

  if (!error) {
    clienteAtual.status = "Aguardando Produção";

     // Atualiza lead
    await supabaseLogin
      .from("leads")
      .update({ status: clienteAtual.status })
      .eq("id", clienteAtual.lead_id);

    atualizarTela();
  }
}

// =============================
// TIMELINE
// =============================
function reabrirFluxo() {

  if (clienteAtual.tipo_cancelamento === "contrato") {
    clienteAtual.status = "Contrato";
    clienteAtual.contrato_recusado = false;
  } else {
    clienteAtual.status = "Proposta";
    clienteAtual.proposta_recusada = false;
  }

  clienteAtual.motivo_cancelamento = null;
  clienteAtual.tipo_cancelamento = null;

  atualizarTela();
}

function renderizarTimeline() {

  if (clienteAtual.status === "Cancelado") {

  const tipo = clienteAtual.tipo_cancelamento === "contrato"
    ? "Contrato recusado"
    : "Proposta recusada";

  const textoReabertura = clienteAtual.tipo_cancelamento === "contrato"
    ? "Reabrir contrato"
    : "Reconsiderar proposta";

  document.getElementById("timelineProjeto").innerHTML = `
    <div class="text-center py-4">

      <div class="timeline-circle timeline-cancelado mx-auto mb-3"></div>

      <h5 class="text-danger mb-3">
        ${tipo}
      </h5>

      <p class="text-light opacity-75 mb-4">
        ${clienteAtual.tipo_cancelamento === "contrato"
          ? "O contrato não foi aprovado neste momento."
          : "A proposta não foi aprovada neste momento."}
      </p>

      <div class="card bg-dark border-0 p-3 mb-4">
        <small class="text-secondary d-block mb-1">
          Motivo informado:
        </small>
        <div class="text-light">
          ${clienteAtual.motivo_cancelamento}
        </div>
      </div>

      <button class="btn btn-outline-primary"
              onclick="reabrirFluxo()">
        🔄 ${textoReabertura}
      </button>

    </div>
  `;

  return;
}


  const indexAtual = etapasInternas.indexOf(clienteAtual.status);

  let html = `<div class="timeline-wrapper">`;

  etapasInternas.forEach((etapa, index) => {

    let classe = "timeline-futura";

  if (index < indexAtual) {
  classe = "timeline-concluida";
}

if (index === indexAtual) {

  if (clienteAtual.status === "Fechado") {
    classe = "timeline-concluida";
  } else {
    classe = "timeline-ativa";
  }

}

    const etapaExterna = statusMap[etapa];

    html += `
      <div class="timeline-step">
        <div class="timeline-circle ${classe}"></div>
        <div 
          class="timeline-label"
          data-bs-toggle="tooltip"
          data-bs-placement="top"
          title="${etapaExterna.descricao}">
          ${etapaExterna.label}
        </div>
      </div>
    `;
  });

  html += `</div>`;

  document.getElementById("timelineProjeto").innerHTML = html;

  inicializarTooltips();
}

function solicitarNovaProposta() {

  clienteAtual.status = "Proposta";
  clienteAtual.proposta_recusada = false;
  clienteAtual.motivo_cancelamento = null;

  atualizarTela();
}

// =============================
// TOOLTIP BOOTSTRAP
// =============================

function inicializarTooltips() {
  const tooltipTriggerList = [].slice.call(
    document.querySelectorAll('[data-bs-toggle="tooltip"]')
  );

  tooltipTriggerList.map(function (tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl);
  });
}

// =============================
// PAGAMENTOS
// =============================

function renderizarPagamentos() {

  const indexAtual = etapasInternas.indexOf(clienteAtual.status);
  const indexPagamento = etapasInternas.indexOf("Aguardando Pagamento");

  // Só exibe se estiver a partir de "Aguardando Pagamento"
  if (indexAtual < indexPagamento) {
    document.getElementById("pagamentosCard")
      .classList.add("d-none");
    return;
  }

  document.getElementById("pagamentosCard")
    .classList.remove("d-none");

  const statusPagamento = clienteAtual.pagamento_status;

  let botaoConfirmar = "";

  if (
    clienteAtual.status === "Aguardando Pagamento" &&
    statusPagamento === "Pendente"
  ) {
    botaoConfirmar = `
      <button class="btn btn-success mt-3"
              onclick="confirmarPagamento()">
        💳 Simular Pagamento Confirmado
      </button>
    `;
  }

  document.getElementById("pagamentosCliente").innerHTML = `
    <table class="table table-dark">
      <tr>
        <td>Entrada</td>
        <td>R$ 9.250</td>
        <td>${statusPagamento}</td>
        <td>05/03/2026</td>
      </tr>
    </table>
    ${botaoConfirmar}
  `;
}

async function confirmarPagamento() {

  const { error } = await supabaseLogin
    .from("clientes")
    .update({
      pagamento_status: "Confirmado",
      pagamento_confirmado_em: new Date(),
      status: "Em Desenvolvimento"
    })
    .eq("id", clienteAtual.id);

  if (!error) {
    clienteAtual.pagamento_status = "Confirmado";
    clienteAtual.status = "Em Desenvolvimento";

     // Atualiza lead
    await supabaseLogin
      .from("leads")
      .update({ status: clienteAtual.status })
      .eq("id", clienteAtual.lead_id);
      
    atualizarTela();
  }
}

function publicarEmProducao() {

  clienteAtual.status = "Fechado";

  atualizarTela();

  const alerta = document.createElement("div");
  alerta.className = "alert alert-success mt-3 shadow-sm";
  alerta.innerHTML = `
    🎉 Sistema publicado com sucesso!
    O projeto foi concluído.
  `;

  document.querySelector(".container").prepend(alerta);

  setTimeout(() => alerta.remove(), 4000);
}