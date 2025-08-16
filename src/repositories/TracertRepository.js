// repositories/TracertRepository.js
const { obterConexao } = require('../database/bancoDeDados');
const { Tracert } = require('../models/TracertModel');
const logger = require('../utils/logger/Logger');

/**
 * Repositório responsável por operações na tabela `tracert`.
 * Implementa #executeQuery para centralizar execução e release de conexões.
 */
class TracertRepository {
  async #executeQuery(query, params = []) {
    let conexao;
    try {
      conexao = await obterConexao();
      logger.debug('SQL (tracert):', query.trim(), 'params=', params);
      const [result] = await conexao.execute(query, params);
      return result;
    } finally {
      if (conexao) {
        try {
          conexao.release();
          logger.debug('Conexão liberada (pool) - tracert.');
        } catch (releaseErr) {
          logger.warn('Falha ao liberar conexão (tracert):', releaseErr.message || releaseErr);
        }
      }
    }
  }

  /**
   * Insere ou atualiza (upsert) um registro de tracert.
   */
  async upsert({ equipamento_id, protocolo, porta_tipo, porta, rota }) {
    const query = `
      INSERT INTO tracert (equipamento_id, protocolo, porta_tipo, porta, rota)
      VALUES (?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        protocolo = VALUES(protocolo),
        porta_tipo = VALUES(porta_tipo),
        porta = VALUES(porta),
        rota = VALUES(rota),
        updated_at = CURRENT_TIMESTAMP
    `;
    const rotaSerialized = rota ? JSON.stringify(rota) : JSON.stringify([]);
    return await this.#executeQuery(query, [equipamento_id, protocolo, porta_tipo, porta, rotaSerialized]);
  }

  async findAll() {
    const query = `SELECT * FROM tracert ORDER BY updated_at DESC`;
    const rows = await this.#executeQuery(query);
    return (rows || []).map(row => new Tracert({
      id: row.id,
      equipamento_id: row.equipamento_id,
      protocolo: row.protocolo,
      porta_tipo: row.porta_tipo,
      porta: row.porta,
      rota: row.rota ? JSON.parse(row.rota) : [],
      updated_at: row.updated_at
    }));
  }

  async findByEquipamentoIds(equipamentosIds) {
    const ids = Array.isArray(equipamentosIds) ? equipamentosIds : [equipamentosIds];
    if (ids.length === 0) return [];
    const placeholders = ids.map(() => '?').join(',');
    const query = `SELECT * FROM tracert WHERE equipamento_id IN (${placeholders}) ORDER BY updated_at DESC`;
    const rows = await this.#executeQuery(query, ids);
    return (rows || []).map(row => new Tracert({
      id: row.id,
      equipamento_id: row.equipamento_id,
      protocolo: row.protocolo,
      porta_tipo: row.porta_tipo,
      porta: row.porta,
      rota: row.rota ? JSON.parse(row.rota) : [],
      updated_at: row.updated_at
    }));
  }
}

module.exports = new TracertRepository();
