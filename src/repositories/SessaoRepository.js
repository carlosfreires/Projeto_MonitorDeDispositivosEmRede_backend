// repositories/SessaoRepository.js
const { obterConexao } = require('../database/bancoDeDados');
const { SessaoModel } = require('../models/SessaoModel');
const logger = require('../utils/logger/Logger');

/**
 * Repositório responsável por operações na tabela `sessoes`.
 * Usa método privado #executeQuery para centralizar execução e liberação de conexões.
 */
class SessaoRepository {
  async #executeQuery(query, params = []) {
    let conexao;
    try {
      conexao = await obterConexao();
      logger.debug('SQL (sessoes):', query.trim(), 'params=', params);
      const [result] = await conexao.execute(query, params);
      return result;
    } finally {
      if (conexao) {
        try {
          conexao.release();
          logger.debug('Conexão liberada (pool) - sessoes.');
        } catch (releaseErr) {
          logger.warn('Falha ao liberar conexão (sessoes):', releaseErr.message || releaseErr);
        }
      }
    }
  }

  /**
   * Insere uma sessão. expiracao pode ser Date ou string ISO.
   * Retorna o resultado do driver (insertId, affectedRows, etc).
   */
  async create({ usuario_id, token, expiracao, ip }) {
    const query = `
      INSERT INTO sessoes (usuario_id, token, expiracao, ip)
      VALUES (?, ?, ?, ?)
    `;
    const expiracaoVal = expiracao instanceof Date ? expiracao.toISOString() : expiracao;
    return await this.#executeQuery(query, [usuario_id, token, expiracaoVal, ip]);
  }

  async deleteByToken(token) {
    const query = `DELETE FROM sessoes WHERE token = ?`;
    return await this.#executeQuery(query, [token]);
  }

  async findByToken(token) {
    const query = `SELECT * FROM sessoes WHERE token = ? LIMIT 1`;
    const rows = await this.#executeQuery(query, [token]);
    return (rows && rows.length) ? new SessaoModel(rows[0]) : null;
  }

  async deleteByUsuarioId(usuarioId) {
    const query = `DELETE FROM sessoes WHERE usuario_id = ?`;
    return await this.#executeQuery(query, [usuarioId]);
  }
}

module.exports = new SessaoRepository();
