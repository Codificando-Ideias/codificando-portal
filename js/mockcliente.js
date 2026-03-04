// =============================
// MOCK CLIENTE
// =============================

let clienteAtual = {
  nome: "Thiago Melo",
  email: "thiago@email.com",
  whatsapp: "(11) 99999-9999",

  numero_proposta: "CI-2026-001",
  escopo_resumido: "Sistema de gestão interno com controle financeiro e dashboard gerencial.",
  valor_proposta: 18500,
  prazo_estimado: "3 meses",
  proposta_url: "#",
  homolog_url: "https://homolog.codificandoideias.com",
  producao_url: "https://app.codificandoideias.com",

  proposta_aceita: false,
  proposta_recusada: false,

  contrato_url: "#",
  contrato_aceito: false,
  contrato_recusado: false,
  contrato_aceito_em: null, 

  pagamento_status: "Pendente", // Pendente | Confirmado

  status: "Fechado", // Proposta, homologação, Aguardando Produção, Fechado
  motivo_cancelamento: null,
  tipo_cancelamento: null, // "proposta" | "contrato"
};

document.addEventListener("DOMContentLoaded", () => {
  renderizarDados();
  renderizarProposta();
  renderizarTimeline();
  renderizarPagamentos();
});