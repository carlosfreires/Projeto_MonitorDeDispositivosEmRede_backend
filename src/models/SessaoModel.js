// models/SessaoModel.js
/**
 * Model: representa a entidade Sessão.
 * Camada de domínio — sem SQL nem lógica de negócio.
 */
class SessaoModel {
  constructor({
    id = null,
    usuario_id = null,
    token = null,
    expiracao = null, // ISO string ou Date
    ip = null,
    criado_em = null
  } = {}) {
    this.id = id;
    this.usuario_id = usuario_id;
    this.token = token;
    this.expiracao = expiracao;
    this.ip = ip;
    this.criado_em = criado_em;
  }

  /**
   * Indica se a sessão está expirada.
   * Aceita expiracao como Date ou string ISO.
   */
  isExpired(now = new Date()) {
    if (!this.expiracao) return true;
    const e = (this.expiracao instanceof Date) ? this.expiracao : new Date(this.expiracao);
    return isNaN(e.getTime()) ? true : e.getTime() <= now.getTime();
  }
}

module.exports = { SessaoModel };
