// repositories/LogMonitoramentoRepository.js
const { obterConexao } = require('../database/bancoDeDados');
const LogMonitoramentoModel = require('../models/LogMonitoramentoModel');
const logger = require('../utils/logger/Logger');

/**
 * Repositório responsável por todas as operações em logs_monitoramento,
 * bem como consultas auxiliares para ping / telnet e equipamentos.
 */
class LogMonitoramentoRepository {
  async #executeQuery(query, params = []) {
    let conexao;
    try {
      conexao = await obterConexao();
      logger.debug('SQL:', query.trim(), 'params=', params);
      const [result] = await conexao.execute(query, params);
      return result;
    } finally {
      if (conexao) {
        try {
          conexao.release();
          logger.debug('Conexão liberada (pool).');
        } catch (releaseErr) {
          logger.warn('Falha ao liberar conexão:', releaseErr.message || releaseErr);
        }
      }
    }
  }

  /**
   * Busca resultados de ping (tabela pingtest).
   * Retorna array de objetos com: equipamento_id, status_ping, tempo_resposta_ping
   */
  async fetchPingResults() {
    const query = `
      SELECT equipamento_id, status AS status_ping, tempo_resposta AS tempo_resposta_ping
      FROM pingtest
    `;
    return await this.#executeQuery(query);
  }

  /**
   * Busca resultados de telnet (tabela telnet).
   * Retorna array de objetos com: equipamento_id, status_telnet, mensagem_telnet
   */
  async fetchTelnetResults() {
    const query = `
      SELECT equipamento_id, status AS status_telnet, mensagem AS mensagem_telnet
      FROM telnet
    `;
    return await this.#executeQuery(query);
  }

  /**
   * Retorna { ip, porta } do equipamento ou null
   */
  async fetchEquipamentoById(equipamentoId) {
    const query = `SELECT ip, porta FROM equipamentos WHERE id = ? LIMIT 1`;
    const rows = await this.#executeQuery(query, [equipamentoId]);
    return (rows && rows.length) ? rows[0] : null;
  }

  /**
   * Insere um log na tabela logs_monitoramento.
   * 'detalhes' é serializado como JSON quando presente.
   */
  async insertLog({ equipamento_id, ip, porta, status_ping, tempo_resposta_ping, status_telnet, mensagem_telnet, detalhes }) {
    const query = `
      INSERT INTO logs_monitoramento
      (equipamento_id, ip, porta, status_ping, tempo_resposta_ping, status_telnet, mensagem_telnet, detalhes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const detalhesSerialized = detalhes ? JSON.stringify(detalhes) : null;
    return await this.#executeQuery(query, [
      equipamento_id,
      ip,
      porta,
      status_ping,
      tempo_resposta_ping,
      status_telnet,
      mensagem_telnet,
      detalhesSerialized,
    ]);
  }

  async findAllLogs() {
    const query = `SELECT * FROM logs_monitoramento ORDER BY created_at DESC`;
    const rows = await this.#executeQuery(query);
    return (rows || []).map(row => new LogMonitoramentoModel(row));
  }

  /**
   * Busca logs por lista de ids, com filtros opcionais de data (strings ISO ou objetos Date).
   * Implementa construção segura do IN (...) para evitar problemas com arrays.
   */
  async findByEquipamentoIds(ids, dataInicial = null, dataFinal = null) {
    if (!ids || (Array.isArray(ids) && ids.length === 0)) return [];

    const idArray = Array.isArray(ids) ? ids : [ids];
    const placeholders = idArray.map(() => '?').join(',');
    let query = `SELECT * FROM logs_monitoramento WHERE equipamento_id IN (${placeholders})`;
    const params = [...idArray];

    if (dataInicial && dataFinal) {
      query += ` AND created_at BETWEEN ? AND ?`;
      params.push(dataInicial, dataFinal);
    } else if (dataInicial) {
      query += ` AND created_at >= ?`;
      params.push(dataInicial);
    } else if (dataFinal) {
      query += ` AND created_at <= ?`;
      params.push(dataFinal);
    }

    query += ' ORDER BY created_at DESC';

    const rows = await this.#executeQuery(query, params);
    return (rows || []).map(row => new LogMonitoramentoModel(row));
  }

  async deleteAllLogs() {
    return await this.#executeQuery(`DELETE FROM logs_monitoramento`);
  }

  async truncateLogs() {
    // TRUNCATE pode exigir permissões; mantemos interface idempotente
    return await this.#executeQuery(`TRUNCATE TABLE logs_monitoramento`);
  }
}

module.exports = new LogMonitoramentoRepository();
