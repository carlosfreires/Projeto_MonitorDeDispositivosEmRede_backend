// repositories/PingTestRepository.js
const { obterConexao } = require('../database/bancoDeDados');
const { PingTestModel } = require('../models/PingTestModel');
const logger = require('../utils/logger/Logger');

/**
 * Repositório para operações na tabela pingtest.
 * - Usa #executeQuery para reduzir duplicação.
 */
class PingTestRepository {
  async #executeQuery(query, params = []) {
    let conexao;
    try {
      conexao = await obterConexao();
      logger.debug('Executando SQL (pingtest):', query.trim(), 'params=', params);
      const [result] = await conexao.execute(query, params);
      return result;
    } finally {
      if (conexao) {
        try {
          conexao.release();
          logger.debug('Conexão liberada (pool) - pingtest.');
        } catch (releaseErr) {
          logger.warn('Falha ao liberar conexão (pingtest):', releaseErr.message || releaseErr);
        }
      }
    }
  }

  /**
   * Insere ou atualiza (upsert) um resultado de ping.
   * Espera um objeto com { equipamento_id, status, tempo_resposta }.
   */
  async upsertPingResult({ equipamento_id, status, tempo_resposta }) {
    const query = `
      INSERT INTO pingtest (equipamento_id, status, tempo_resposta)
      VALUES (?, ?, ?)
      ON DUPLICATE KEY UPDATE
        status = VALUES(status),
        tempo_resposta = VALUES(tempo_resposta),
        updated_at = CURRENT_TIMESTAMP
    `;
    return await this.#executeQuery(query, [equipamento_id, status, tempo_resposta]);
  }

  /**
   * Lista todos os registros de ping junto com dados do equipamento.
   */
  async findAllWithEquipamento() {
    const query = `
      SELECT p.*, e.nome AS equipamento_nome, e.ip AS equipamento_ip
      FROM pingtest p
      INNER JOIN equipamentos e ON p.equipamento_id = e.id
      ORDER BY p.updated_at DESC
    `;
    const rows = await this.#executeQuery(query);
    return (rows || []).map(row => new PingTestModel(row));
  }

  /**
   * Busca registros de ping para uma lista de equipamentos.
   * Recebe array ou single id.
   */
  async findByEquipamentoIds(equipamentos) {
    const ids = Array.isArray(equipamentos) ? equipamentos : [equipamentos];
    if (ids.length === 0) return [];

    // placeholders seguros: ?,?,?
    const placeholders = ids.map(() => '?').join(',');
    const query = `
      SELECT p.*, e.nome AS equipamento_nome, e.ip AS equipamento_ip
      FROM pingtest p
      INNER JOIN equipamentos e ON p.equipamento_id = e.id
      WHERE e.id IN (${placeholders})
      ORDER BY p.updated_at DESC
    `;
    const rows = await this.#executeQuery(query, ids);
    return (rows || []).map(row => new PingTestModel(row));
  }
}

module.exports = new PingTestRepository();
