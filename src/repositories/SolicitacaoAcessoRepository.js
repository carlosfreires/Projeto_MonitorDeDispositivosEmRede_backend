// repositories/SolicitacaoAcessoRepository.js
const { obterConexao } = require('../database/bancoDeDados');
const logger = require('../utils/logger');

/**
 * Repositório para operações na tabela `solicitacoes_acesso`.
 * - centraliza execução de queries e liberação de conexões,
 * - retorna objetos/rows conforme necessário.
 */
class SolicitacaoAcessoRepository {
  async #executeQuery(query, params = []) {
    let conexao;
    try {
      conexao = await obterConexao();
      logger.debug('SQL (solicitacoes_acesso):', query.trim(), 'params=', params);
      const [result] = await conexao.execute(query, params);
      return result;
    } finally {
      if (conexao) {
        try {
          conexao.release();
          logger.debug('Conexão liberada (pool) - solicitacoes_acesso.');
        } catch (releaseErr) {
          logger.warn('Falha ao liberar conexão (solicitacoes_acesso):', releaseErr.message || releaseErr);
        }
      }
    }
  }

  /**
   * Cria uma nova solicitação.
   * Recebe { nome, sobrenome, email, senhaHash, motivo, perfil_solicitado }.
   * Retorna resultado do driver (insertId, affectedRows, etc).
   */
  async create({ nome, sobrenome, email, senhaHash, motivo, perfil_solicitado }) {
    const query = `
      INSERT INTO solicitacoes_acesso
        (nome, sobrenome, email, senha, motivo, perfil_solicitado, status, data_solicitacao)
      VALUES (?, ?, ?, ?, ?, ?, 'pendente', CURRENT_TIMESTAMP)
    `;
    return await this.#executeQuery(query, [nome, sobrenome, email, senhaHash, motivo, perfil_solicitado]);
  }

  /**
   * Retorna a solicitação (row) por id. Se status for fornecido, filtra por status.
   * Retorna a row (objeto) ou null.
   */
  async findById(id, status = null) {
    let query = `SELECT * FROM solicitacoes_acesso WHERE id = ?`;
    const params = [id];

    if (status) {
      query += ` AND status = ?`;
      params.push(status);
    }
    query += ` LIMIT 1`;

    const rows = await this.#executeQuery(query, params);
    return (rows && rows.length) ? rows[0] : null;
  }

  /**
   * Retorna a solicitação por e-mail (ou null).
   */
  async findByEmail(email) {
    const query = `SELECT * FROM solicitacoes_acesso WHERE email = ? LIMIT 1`;
    const rows = await this.#executeQuery(query, [email]);
    return (rows && rows.length) ? rows[0] : null;
  }

  /**
   * Aprova a solicitação (marca status, quem aprovou e timestamp).
   */
  async approve(id, aprovadoPorId) {
    const query = `
      UPDATE solicitacoes_acesso
      SET status = 'aprovado', aprovado_por = ?, data_aprovacao = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    return await this.#executeQuery(query, [aprovadoPorId, id]);
  }

  /**
   * Rejeita a solicitação (marca status, quem rejeitou e timestamp).
   */
  async reject(id, rejeitadoPorId) {
    const query = `
      UPDATE solicitacoes_acesso
      SET status = 'rejeitado', rejeitado_por = ?, data_rejeicao = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    return await this.#executeQuery(query, [rejeitadoPorId, id]);
  }
}

module.exports = new SolicitacaoAcessoRepository();
