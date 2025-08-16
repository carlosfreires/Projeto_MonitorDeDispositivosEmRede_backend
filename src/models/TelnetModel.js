// models/TelnetModel.js
/**
 * Representa um registro de resultado de teste Telnet.
 * Camada de domínio — sem SQL e sem lógica de negócio.
 */
class TelnetModel {
  constructor({ id = null, equipamento_id = null, status = null, mensagem = null, updated_at = null } = {}) {
    this.id = id;
    this.equipamento_id = equipamento_id;
    this.status = status;
    this.mensagem = mensagem;
    this.updated_at = updated_at;
  }
}

module.exports = { TelnetModel };