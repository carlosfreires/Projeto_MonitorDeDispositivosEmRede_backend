// models/Tracert.js
/**
 * Representa o resultado de um tracert (traceroute) para um equipamento.
 * Camada de domínio — sem SQL e sem lógica de persistência.
 */
class TracertModel {
  constructor({
    id = null,
    equipamento_id = null,
    protocolo = 'ICMP',
    porta_tipo = null,
    porta = null,
    rota = null,
    updated_at = null
  } = {}) {
    this.id = id;
    this.equipamento_id = equipamento_id;
    this.protocolo = protocolo;
    this.porta_tipo = porta_tipo;
    this.porta = porta;
    // rota deve ser um array de hops; garantir consistência
    this.rota = Array.isArray(rota) ? rota : (rota ? rota : []);
    this.updated_at = updated_at;
  }

  /**
   * Retorna objeto pronto para persistência.
   */
  toPersistenceObject() {
    return {
      equipamento_id: this.equipamento_id,
      protocolo: this.protocolo,
      porta_tipo: this.porta_tipo,
      porta: this.porta,
      rota: JSON.stringify(this.rota || []),
    };
  }
}

module.exports = { TracertModel };
