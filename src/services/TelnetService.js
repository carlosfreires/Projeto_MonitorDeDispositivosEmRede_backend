// services/TelnetService.js
/**
 * Serviço responsável por executar testes Telnet e persistir resultados.
 * - Usa utils/logger para logs padronizados.
 * - Recebe equipamento (objeto com id/ip/porta) ou id (delegando para EquipamentoService).
 * - Retorna TelnetModel ou objeto de resumo em operações em lote.
 */
const net = require('net');
const logger = require('../utils/logger');
const { TelnetModel } = require('../models/TelnetModel');
const TelnetRepository = require('../repositories/TelnetRepository');
const EquipamentoService = require('./EquipamentoService');

class TelnetService {
  /**
   * Realiza um teste Telnet (não persiste automaticamente).
   * @param {Object|number|string} equipamentoOrId - objeto {id,ip,porta,...} ou id do equipamento
   * @param {number} timeoutMs - timeout em milissegundos (padrão 5000)
   * @returns {TelnetModel}
   */
  async realizarTeste(equipamentoOrId, timeoutMs = 5000) {
    // Obtém objeto equipamento
    let equipamento = null;
    try {
      if (typeof equipamentoOrId === 'object' && equipamentoOrId !== null) {
        equipamento = equipamentoOrId;
      } else {
        equipamento = await EquipamentoService.buscarPorId(equipamentoOrId);
      }

      if (!equipamento || !equipamento.id || !equipamento.ip) {
        const msg = `Equipamento inválido para teste Telnet: ${JSON.stringify(equipamentoOrId)}`;
        logger.error(msg);
        const err = new Error(msg);
        err.status = 400;
        throw err;
      }

      logger.info(`Iniciando teste Telnet: equipamento ID=${equipamento.id} IP=${equipamento.ip} PORT=${equipamento.porta || 23}`);
      // Promise que resolve o resultado do teste
      const resultado = await new Promise((resolve) => {
        const cliente = net.createConnection({ host: String(equipamento.ip), port: equipamento.porta || 23 });

        const onSuccess = () => {
          cleanup();
          resolve({ status: 'ativo', mensagem: 'Conexão bem-sucedida.' });
        };

        const onError = (err) => {
          cleanup();
          resolve({ status: 'inativo', mensagem: `Erro: ${err && err.message ? err.message : String(err)}` });
        };

        const onTimeout = () => {
          cleanup();
          resolve({ status: 'inativo', mensagem: 'Timeout na conexão.' });
        };

        const cleanup = () => {
          cliente.removeAllListeners();
          try { cliente.end(); } catch (e) { /* ignore */ }
          try { cliente.destroy(); } catch (e) { /* ignore */ }
        };

        cliente.setTimeout(timeoutMs);
        cliente.once('connect', onSuccess);
        cliente.once('error', onError);
        cliente.once('timeout', onTimeout);
      });

      logger.info(`Resultado Telnet equipamento ID=${equipamento.id}: ${resultado.status} - ${resultado.mensagem}`);

      return new TelnetModel({
        equipamento_id: equipamento.id,
        status: resultado.status,
        mensagem: resultado.mensagem,
        updated_at: new Date()
      });
    } catch (err) {
      logger.error('Erro ao realizar teste Telnet:', err.message || err);
      // Em caso de erro, tenta retornar um modelo de falha (sem lançar imediatamente)
      try {
        const equipamentoId = (typeof equipamentoOrId === 'object' && equipamentoOrId !== null) ? equipamentoOrId.id : equipamentoOrId;
        if (equipamentoId) {
          return new TelnetModel({
            equipamento_id: equipamentoId,
            status: 'falha',
            mensagem: err.message || 'Erro desconhecido',
            updated_at: new Date()
          });
        }
      } catch (inner) {
        logger.warn('Erro ao gerar modelo de falha Telnet:', inner.message || inner);
      }
      throw err;
    }
  }

  /**
   * Persiste um TelnetModel usando o repositório (upsert).
   * @param {TelnetModel} telnetResult
   */
  async salvar(telnetResult) {
    logger.info(`Persistindo resultado Telnet para equipamento ${telnetResult.equipamento_id}...`);
    try {
      const resultado = await TelnetRepository.upsertTelnetResult({
        equipamento_id: telnetResult.equipamento_id,
        status: telnetResult.status,
        mensagem: telnetResult.mensagem
      });
      logger.success(`Resultado Telnet persistido para equipamento ${telnetResult.equipamento_id}.`);
      return resultado;
    } catch (err) {
      logger.error('Falha ao persistir resultado Telnet:', err.message || err);
      throw err;
    }
  }

  /**
   * Executa testes Telnet em múltiplos equipamentos e tenta persistir cada resultado.
   * Retorna resumo { total, success, failed, details }.
   */
  async executarETPersistirParaTodos(equipamentos) {
    // garante array
    if (!Array.isArray(equipamentos)) equipamentos = [equipamentos];

    logger.info(`Executando testes Telnet para ${equipamentos.length} equipamentos.`);
    const promises = equipamentos.map(async (eq) => {
      try {
        const resultado = await this.realizarTeste(eq);
        await this.salvar(resultado);
        return { ok: true, equipamento: eq, resultado };
      } catch (err) {
        logger.warn(`Falha no Telnet para equipamento ${eq && eq.id ? eq.id : JSON.stringify(eq)}:`, err.message || err);
        return { ok: false, equipamento: eq, error: err.message || err };
      }
    });

    const results = await Promise.all(promises);
    const total = results.length;
    const success = results.filter(r => r.ok).length;
    const failed = total - success;

    logger.success(`Telnet: total ${total}, sucesso ${success}, falha ${failed}`);
    return { total, success, failed, details: results };
  }

  /**
   * Lista todos os registros Telnet (com dados do equipamento).
   */
  async listarTodos() {
    logger.info('Listando todos os testes Telnet registrados.');
    try {
      const rows = await TelnetRepository.findAllWithEquipamento();
      if (!rows || rows.length === 0) {
        logger.warn('Nenhum teste Telnet registrado encontrado.');
        return [];
      }
      logger.success(`${rows.length} registros Telnet encontrados.`);
      return rows;
    } catch (err) {
      logger.error('Erro ao listar testes Telnet:', err.message || err);
      throw err;
    }
  }

  /**
   * Lista registros Telnet filtrados por equipamentos (array ou single id).
   */
  async listarPorEquipamentos(equipamentos) {
    logger.info('Listando testes Telnet por equipamentos.');
    if (!equipamentos || (Array.isArray(equipamentos) && equipamentos.length === 0)) {
      const err = new Error('Nenhum ID de equipamento informado');
      err.status = 400;
      logger.error(err.message);
      throw err;
    }

    try {
      const rows = await TelnetRepository.findByEquipamentoIds(equipamentos);
      logger.success(`${rows.length} registros Telnet encontrados para os equipamentos informados.`);
      return rows;
    } catch (err) {
      logger.error('Erro ao listar testes Telnet por equipamentos:', err.message || err);
      throw err;
    }
  }
}

module.exports = new TelnetService();
