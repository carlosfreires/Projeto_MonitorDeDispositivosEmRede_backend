// Configurações padrão para Tracert
const TRACERT_CONFIGURACOES_PADRAO = {
    protocolo: 'ICMP', // ICMP (padrão), UDP ou TCP
    ttlMax: 30, // Número máximo de saltos
    tentativasPorSalto: 3, // Número de tentativas por salto
    timeout: 15000, // Timeout em milissegundos
    porta: null, // Relevante apenas para UDP ou TCP
    porta_tipo: null, // 'TCP' ou 'UDP' (apenas se porta for especificada)
    destino: null, // Será sobrescrito pelo IP do equipamento
  };

  module.exports = { TRACERT_CONFIGURACOES_PADRAO }