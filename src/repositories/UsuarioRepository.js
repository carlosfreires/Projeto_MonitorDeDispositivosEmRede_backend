// repositories/UsuarioRepository.js
const { obterConexao } = require('../database/bancoDeDados');
const logger = require('../utils/logger/Logger');

/**
 * Repositório para operações na tabela `usuarios`.
 * - Usa método privado #executeQuery para centralizar execução e release.
 * - Retorna diretamente o resultado do driver (insertId, affectedRows, rows, etc).
 */
class UsuarioRepository {
  async #executeQuery(query, params = []) {
    let conexao;
    try {
      conexao = await obterConexao();
      logger.debug('SQL (usuarios):', query.trim(), 'params=', params);
      const [result] = await conexao.execute(query, params);
      return result;
    } finally {
      if (conexao) {
        try {
          conexao.release();
          logger.debug('Conexão liberada (pool) - usuarios.');
        } catch (releaseErr) {
          logger.warn('Falha ao liberar conexão (usuarios):', releaseErr.message || releaseErr);
        }
      }
    }
  }

  async create(usuario) {
    const query = `
      INSERT INTO usuarios (nome, sobrenome, email, senha, foto_perfil, perfil, aprovado_por, ativo)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    return await this.#executeQuery(query, [
      usuario.nome,
      usuario.sobrenome,
      usuario.email,
      usuario.senha, // já hash
      usuario.foto_perfil,
      usuario.perfil,
      usuario.aprovado_por,
      usuario.ativo ? 1 : 0
    ]);
  }

  async updateBasic(id, { nome, sobrenome }) {
    const query = `UPDATE usuarios SET nome = ?, sobrenome = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
    return await this.#executeQuery(query, [nome, sobrenome, id]);
  }

  async updateEmail(id, novoEmail) {
    const query = `UPDATE usuarios SET email = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
    return await this.#executeQuery(query, [novoEmail, id]);
  }

  async updatePasswordHash(id, senhaHash) {
    const query = `UPDATE usuarios SET senha = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
    return await this.#executeQuery(query, [senhaHash, id]);
  }

  async updateFotoPerfil(id, novaFoto) {
    const query = `UPDATE usuarios SET foto_perfil = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
    return await this.#executeQuery(query, [novaFoto, id]);
  }

  async findById(id) {
    const rows = await this.#executeQuery(`SELECT * FROM usuarios WHERE id = ? LIMIT 1`, [id]);
    return (rows && rows.length) ? rows[0] : null;
  }

  async findByEmail(email, apenasAtivos = false) {
    let query = `SELECT * FROM usuarios WHERE email = ?`;
    const params = [email];
    if (apenasAtivos) query += ` AND ativo = TRUE`;
    query += ` LIMIT 1`;
    const rows = await this.#executeQuery(query, params);
    return (rows && rows.length) ? rows[0] : null;
  }

  async activate(id) {
    const query = `UPDATE usuarios SET ativo = TRUE, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
    return await this.#executeQuery(query, [id]);
  }

  async deactivate(id) {
    const query = `UPDATE usuarios SET ativo = FALSE, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
    return await this.#executeQuery(query, [id]);
  }
}

module.exports = new UsuarioRepository();
