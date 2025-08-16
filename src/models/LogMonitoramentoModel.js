/**
 * Representa uma entrada de log de monitoramento no sistema.
 * Mantém os campos conforme o schema: logs_monitoramento.
 */
class LogMonitoramentoModel {
  constructor({
    id = null,
    equipamento_id = null,
    ip = null,
    porta = null,
    status_ping = null,
    tempo_resposta_ping = null,
    status_telnet = null,
    mensagem_telnet = null,
    detalhes = null,
    created_at = null,
    updated_at = null
  } = {}) {
    this.id = id;
    this.equipamento_id = equipamento_id;
    this.ip = ip;
    this.porta = porta;
    this.status_ping = status_ping;
    this.tempo_resposta_ping = tempo_resposta_ping;
    this.status_telnet = status_telnet;
    this.mensagem_telnet = mensagem_telnet;
    // Se "detalhes" vier como JSON string, tenta desserializar; caso contrário, mantém objeto/valor.
    try {
      if (typeof detalhes === 'string' && detalhes) {
        this.detalhes = JSON.parse(detalhes);
      } else {
        this.detalhes = detalhes;
      }
    } catch (e) {
      // não falhar a construção do model por causa de um JSON inválido
      this.detalhes = detalhes;
    }
    this.created_at = created_at;
    this.updated_at = updated_at;
  }

  isPingOk() {
    return this.status_ping === 'OK' || this.status_ping === 1 || this.status_ping === true;
  }

  isTelnetOk() {
    return this.status_telnet === 'OK' || this.status_telnet === 1 || this.status_telnet === true;
  }
}

module.exports = LogMonitoramentoModel;