// repositories/EquipamentoRepository.js
const { obterConexao } = require('../database/bancoDeDados');
const EquipamentoModel = require('../models/EquipamentoModel');
const logger = require('../utils/logger');

class EquipamentoRepository {
  // Execução centralizada de query para reduzir repetição
  async #executeQuery(query, params = []) {
    let conexao;
    try {
      conexao = await obterConexao();
      logger.debug('Executando SQL:', query.trim(), ' params=', params);
      const [result] = await conexao.execute(query, params);
      return result;
    } finally {
      if (conexao) {
        try {
          conexao.release();
          logger.debug('Conexão liberada para o pool.');
        } catch (releaseErr) {
          logger.warn('Falha ao liberar conexão:', releaseErr.message || releaseErr);
        }
      }
    }
  }

  async create({ nome, descricao, mac, ip, porta, criado_por }) {
    const query = `
      INSERT INTO equipamentos (nome, descricao, mac, ip, porta, criado_por)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    return await this.#executeQuery(query, [nome, descricao, mac, ip, porta, criado_por]);
  }

  async update(id, { nome, descricao, mac, ip, porta, ativo, atualizado_por }) {
    const query = `
      UPDATE equipamentos
      SET nome = ?, descricao = ?, mac = ?, ip = ?, porta = ?, ativo = ?, atualizado_por = ?
      WHERE id = ?
    `;
    return await this.#executeQuery(query, [nome, descricao, mac, ip, porta, ativo, atualizado_por, id]);
  }

  async deleteById(id) {
    const query = `DELETE FROM equipamentos WHERE id = ?`;
    return await this.#executeQuery(query, [id]);
  }

  async findAll() {
    const rows = await this.#executeQuery(`SELECT * FROM equipamentos`);
    // Em queries SELECT o mysql2 retorna array de rows; garantimos mapeamento
    return (rows || []).map(row => new EquipamentoModel(row));
  }

  async findById(id) {
    const rows = await this.#executeQuery(`SELECT * FROM equipamentos WHERE id = ? LIMIT 1`, [id]);
    return (rows && rows.length) ? new EquipamentoModel(rows[0]) : null;
  }

  async findActive() {
    const rows = await this.#executeQuery(`SELECT * FROM equipamentos WHERE ativo = TRUE`);
    return (rows || []).map(row => new EquipamentoModel(row));
  }
}

module.exports = new EquipamentoRepository();
