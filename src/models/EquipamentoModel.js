// models/EquipamentoModel.js
/**
 * Model simples que representa um equipamento.
 * Mantém as propriedades conforme seu schema (schema.sql).
 */
class EquipamentoModel {
  constructor({
    id, nome, descricao, mac, ip, porta, ativo,
    criado_por, atualizado_por, created_at, updated_at
  } = {}) {
    this.id = id ?? null;
    this.nome = nome ?? null;
    this.descricao = descricao ?? null;
    this.mac = mac ?? null;
    this.ip = ip ?? null;
    this.porta = porta ?? null;
    this.ativo = typeof ativo === 'boolean' ? ativo : true;
    this.criado_por = criado_por ?? null;
    this.atualizado_por = atualizado_por ?? null;
    this.created_at = created_at ?? null;
    this.updated_at = updated_at ?? null;
  }

  // Exemplo de método utilitário (pouco invasivo)
  isActive() {
    return !!this.ativo;
  }
}

module.exports = EquipamentoModel;