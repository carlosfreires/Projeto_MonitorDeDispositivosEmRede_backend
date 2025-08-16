// repositories/TelnetRepository.js
const { obterConexao } = require('../database/bancoDeDados');
const { TelnetModel } = require('../models/TelnetModel');
const logger = require('../utils/logger');

/**
 * Repositório responsável por operações na tabela `telnet`.
 * Usa um método central #executeQuery para reduzir repetição e garantir release.
 */
class TelnetRepository {
  async #executeQuery(query, params = []) {
    let conexao;
    try {
      conexao = await obterConexao();
      logger.debug('SQL (telnet):', query.trim(), 'params=', params);
      const [result] = await conexao.execute(query, params);
      return result;
    } finally {
      if (conexao) {
        try {
          conexao.release();
          logger.debug('Conexão liberada (pool) - telnet.');
        } catch (releaseErr) {
          logger.warn('Falha ao liberar conexão (telnet):', releaseErr.message || releaseErr);
        }
      }
    }
  }

  async upsertTelnetResult({ equipamento_id, status, mensagem }) {
    const query = `
      INSERT INTO telnet (equipamento_id, status, mensagem)
      VALUES (?, ?, ?)
      ON DUPLICATE KEY UPDATE
        status = VALUES(status),
        mensagem = VALUES(mensagem),
        updated_at = CURRENT_TIMESTAMP
    `;
    return await this.#executeQuery(query, [equipamento_id, status, mensagem]);
  }

  async findAllWithEquipamento() {
    const query = `
      SELECT t.*, e.nome AS equipamento_nome, e.ip AS equipamento_ip, e.porta AS equipamento_porta
      FROM telnet t
      INNER JOIN equipamentos e ON t.equipamento_id = e.id
      ORDER BY t.updated_at DESC
    `;
    const rows = await this.#executeQuery(query);
    return (rows || []).map(row => new TelnetModel(row));
  }

  async findByEquipamentoIds(equipamentos) {
    const ids = Array.isArray(equipamentos) ? equipamentos : [equipamentos];
    if (ids.length === 0) return [];
    const placeholders = ids.map(() => '?').join(',');
    const query = `
      SELECT t.*, e.nome AS equipamento_nome, e.ip AS equipamento_ip, e.porta AS equipamento_porta
      FROM telnet t
      INNER JOIN equipamentos e ON t.equipamento_id = e.id
      WHERE e.id IN (${placeholders})
      ORDER BY t.updated_at DESC
    `;
    const rows = await this.#executeQuery(query, ids);
    return (rows || []).map(row => new TelnetModel(row));
  }
}

module.exports = new TelnetRepository();
