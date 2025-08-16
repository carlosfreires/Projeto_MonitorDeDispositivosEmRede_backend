// services/LogMonitoramentoService.js
const logger = require('../utils/logger');
const LogMonitoramentoRepository = require('../repositories/LogMonitoramentoRepository');
const EquipamentoService = require('./EquipamentoService');

/**
 * Serviço responsável pela consolidação e consulta de logs de monitoramento.
 * Encapsula lógica de negócio e orquestra repósitorios/serviços.
 */
class LogMonitoramentoService {
  /**
   * Consolida dados das tabelas pingtest e telnet em logs_monitoramento.
   * Retorna { message, logsInseridos }.
   */
  async consolidarLogs() {
    logger.info('Iniciando consolidação de logs de monitoramento.');
    try {
      const pingResults = await LogMonitoramentoRepository.fetchPingResults();
      const telnetResults = await LogMonitoramentoRepository.fetchTelnetResults();

      logger.info(`Encontrados ${pingResults.length} registros de ping e ${telnetResults.length} de telnet.`);

      const telnetMap = telnetResults.reduce((map, item) => {
        map[item.equipamento_id] = item;
        return map;
      }, {});

      let logsInseridos = 0;

      for (const ping of pingResults) {
        const telnet = telnetMap[ping.equipamento_id];
        if (!telnet) {
          logger.warn(`Sem dados de telnet para equipamento ID ${ping.equipamento_id}. Pulando.`);
          continue;
        }

        const equipamentoData = await LogMonitoramentoRepository.fetchEquipamentoById(ping.equipamento_id);
        if (!equipamentoData) {
          logger.warn(`Equipamento ID ${ping.equipamento_id} não encontrado. Pulando.`);
          continue;
        }

        const detalhes = {
          consolidado_em: new Date().toISOString(),
          fonte: 'Automático - Ping e Telnet'
        };

        await LogMonitoramentoRepository.insertLog({
          equipamento_id: ping.equipamento_id,
          ip: equipamentoData.ip,
          porta: equipamentoData.porta,
          status_ping: ping.status_ping,
          tempo_resposta_ping: ping.tempo_resposta_ping,
          status_telnet: telnet.status_telnet,
          mensagem_telnet: telnet.mensagem_telnet,
          detalhes,
        });

        logsInseridos++;
      }

      logger.success(`Consolidação finalizada. ${logsInseridos} logs inseridos.`);
      return { message: 'Consolidação concluída.', logsInseridos };
    } catch (err) {
      logger.error('Erro durante a consolidação de logs:', err.message || err);
      throw err;
    }
  }

  /**
   * Lista todos os logs. Se dataInicial/dataFinal forem fornecidos (ISO strings ou Date),
   * filtra no lado da query (melhor performance) — porém repository.findAllLogs não tem filtro,
   * portanto fazemos filtragem em memória aqui caso necessário (mantendo compatibilidade mínima).
   */
  async listarTodos(dataInicial = null, dataFinal = null) {
    logger.info('Listando todos os logs (Service).');
    try {
      const resultados = await LogMonitoramentoRepository.findAllLogs();

      if (!dataInicial && !dataFinal) {
        logger.success(`Total de logs: ${resultados.length}`);
        return resultados;
      }

      // converte filtros para timestamps
      const tInicial = dataInicial ? new Date(dataInicial).getTime() : null;
      const tFinal = dataFinal ? new Date(dataFinal).getTime() : null;

      const filtrados = resultados.filter(r => {
        const created = r.created_at ? new Date(r.created_at).getTime() : null;
        if (created === null) return false;
        if (tInicial !== null && created < tInicial) return false;
        if (tFinal !== null && created > tFinal) return false;
        return true;
      });

      logger.success(`Logs listados com filtro. Total: ${filtrados.length}`);
      return filtrados;
    } catch (err) {
      logger.error('Erro ao listar todos os logs:', err.message || err);
      throw err;
    }
  }

  /**
   * Lista logs por IDs de equipamentos (array ou single), com filtro opcional de datas.
   */
  async listarPorEquipamento(ids, dataInicial = null, dataFinal = null) {
    logger.info('Listando logs por equipamento (Service).');
    try {
      if (!ids || (Array.isArray(ids) && ids.length === 0)) {
        const erro = new Error('IDs de equipamentos inválidos ou ausentes');
        erro.status = 400;
        logger.error('IDs inválidos em listarPorEquipamento.');
        throw erro;
      }

      const logs = await LogMonitoramentoRepository.findByEquipamentoIds(ids, dataInicial, dataFinal);
      logger.success(`${logs.length} logs encontrados para os equipamentos fornecidos.`);
      return logs;
    } catch (err) {
      logger.error('Erro ao listar logs por equipamento:', err.message || err);
      throw err;
    }
  }

  /**
   * Lista logs para equipamentos atualmente ativos no sistema.
   * Reutiliza EquipamentoService.listarAtivos() para obter IDs.
   */
  async listarLogsAtivos(dataInicial = null, dataFinal = null) {
    logger.info('Listando logs de equipamentos ativos (Service).');
    try {
      const equipamentosAtivos = await EquipamentoService.listarAtivos();
      if (!equipamentosAtivos || equipamentosAtivos.length === 0) {
        logger.warn('Nenhum equipamento ativo encontrado.');
        return [];
      }

      const ids = equipamentosAtivos.map(e => e.id);
      logger.debug('IDs de equipamentos ativos:', ids);
      const logs = await this.listarPorEquipamento(ids, dataInicial, dataFinal);
      logger.success(`Logs de equipamentos ativos listados. Total: ${logs.length}`);
      return logs;
    } catch (err) {
      logger.error('Erro ao listar logs de equipamentos ativos:', err.message || err);
      throw err;
    }
  }

  async apagarLogs() {
    logger.info('Apagando todos os logs (DELETE).');
    try {
      const resultado = await LogMonitoramentoRepository.deleteAllLogs();
      logger.success(`${resultado.affectedRows ?? 0} logs deletados.`);
      return { message: 'Todos os logs deletados com sucesso!', affectedRows: resultado.affectedRows ?? 0 };
    } catch (err) {
      logger.error('Erro ao apagar logs (DELETE):', err.message || err);
      throw err;
    }
  }

  async apagarLogsComTruncate() {
    logger.info('Apagando todos os logs (TRUNCATE).');
    try {
      const resultado = await LogMonitoramentoRepository.truncateLogs();
      logger.success('Logs deletados com TRUNCATE.');
      return { message: 'Todos os logs deletados com sucesso usando TRUNCATE!', affectedRows: resultado.affectedRows ?? 0 };
    } catch (err) {
      logger.error('Erro ao apagar logs (TRUNCATE):', err.message || err);
      throw err;
    }
  }
}

module.exports = new LogMonitoramentoService();
