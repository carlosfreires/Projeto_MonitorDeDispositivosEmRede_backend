// services/PingTestService.js
/**
 * Serviço responsável por executar testes de ping e persistir resultados.
 * Padrões:
 * - usa utils/logger
 * - não assume formato do "equipamento" (pode receber objeto {id,ip} ou apenas id)
 * - separa execução do teste (realizarTeste) da persistência (salvar)
 */
const ping = require('ping');
const logger = require('../utils/logger/Logger');
const PingTestRepository = require('../repositories/PingTestRepository');
const { PingTestResult } = require('../models/PingTestModel');
const EquipamentoService = require('./EquipamentoService');

class PingTestService {
  /**
   * Realiza teste de ping para um equipamento.
   * - equipamento pode ser objeto { id, ip, nome } ou um id (number/string).
   * - não persiste por padrão (retorna um PingTestResult). Chamadas superiores controlam persistência.
   */
  async realizarTeste(equipamentoOrId) {
    // Normaliza entrada: obtém objeto equipamento
    let equipamento = null;
    try {
      if (typeof equipamentoOrId === 'object' && equipamentoOrId !== null) {
        equipamento = equipamentoOrId;
      } else {
        // busca pelo serviço de Equipamento
        equipamento = await EquipamentoService.buscarPorId(equipamentoOrId);
      }

      if (!equipamento) {
        const msg = `Equipamento não encontrado ou inativo (identificador: ${JSON.stringify(equipamentoOrId)})`;
        logger.error(msg);
        const err = new Error(msg);
        err.status = 404;
        throw err;
      }

      logger.info(`Iniciando teste de ping: equipamento ID=${equipamento.id} IP=${equipamento.ip}`);
      logger.debug('Equipamento completo:', equipamento);

      // executa o ping (timeout curto)
      const probeOptions = { timeout: 5 }; // segundos
      const resultado = await ping.promise.probe(String(equipamento.ip), probeOptions);

      const tempo = resultado && resultado.time ? parseFloat(resultado.time) : null;
      const status = resultado && resultado.alive ? 'ativo' : 'inativo';

      const pingResult = new PingTestResult({
        equipamento_id: equipamento.id,
        status,
        tempo_resposta: (tempo !== null && !Number.isNaN(tempo) && tempo < 9999) ? tempo : null,
        updated_at: new Date()
      });

      pingResult.normalizarTempoResposta();

      logger.success(`Teste de ping concluído: equipamento ID=${equipamento.id} status=${pingResult.status} tempo=${pingResult.tempo_resposta}`);

      return pingResult;
    } catch (err) {
      // Em falhas, cria um resultado de falha e tenta persistir (comportamento resiliente)
      logger.error('Erro ao executar teste de ping:', err.message || err);

      try {
        const equipamentoId = (typeof equipamentoOrId === 'object' && equipamentoOrId !== null) ? equipamentoOrId.id : equipamentoOrId;
        if (equipamentoId) {
          const falha = new PingTestResult({
            equipamento_id: equipamentoId,
            status: 'falha',
            tempo_resposta: null,
            updated_at: new Date()
          });
          // tenta persistir a falha (não quebramos o fluxo se o persist falhar)
          try {
            await this.salvar(falha);
            logger.warn(`Registro de falha persistido para equipamento ID=${equipamentoId}`);
          } catch (saveErr) {
            logger.warn(`Não foi possível persistir falha para equipamento ID=${equipamentoId}:`, saveErr.message || saveErr);
          }
          return falha;
        }
      } catch (inner) {
        logger.warn('Erro ao tentar registrar falha de ping:', inner.message || inner);
      }

      throw err;
    }
  }

  /**
   * Realiza testes de ping para múltiplos equipamentos (array) ou single.
   * - Retorna array de PingTestResult.
   */
  async realizarTesteAll(equipamentos) {
    if (!Array.isArray(equipamentos)) {
      const single = await this.realizarTeste(equipamentos);
      return [single];
    }

    logger.info(`Iniciando testes de ping em lote para ${equipamentos.length} equipamentos.`);
    // Executa em paralelo com Promise.all (poderia controlar concurrency se necessário)
    const execs = equipamentos.map(eq => this.realizarTeste(eq));
    const resultados = await Promise.all(execs);
    logger.success(`Testes de ping concluídos para ${resultados.length} equipamentos.`);
    return resultados;
  }

  /**
   * Persiste um PingTestResult usando o repositório (upsert).
   */
  async salvar(pingResult) {
    logger.info(`Persistindo resultado de ping para equipamento ${pingResult.equipamento_id}...`);
    try {
      // garante normalização antes de salvar
      if (typeof pingResult.normalizarTempoResposta === 'function') {
        pingResult.normalizarTempoResposta();
      }

      const persistObj = pingResult.toPersistenceObject ? pingResult.toPersistenceObject() : {
        equipamento_id: pingResult.equipamento_id,
        status: pingResult.status,
        tempo_resposta: pingResult.tempo_resposta
      };

      const resultado = await PingTestRepository.upsertPingResult(persistObj);
      logger.success(`Resultado persistido para equipamento ${pingResult.equipamento_id}.`);
      return resultado;
    } catch (err) {
      logger.error('Falha ao persistir teste de ping:', err.message || err);
      // mantemos o erro original para camadas superiores tratarem (status quando aplicável)
      throw err;
    }
  }

  /**
   * Executa testes para todos e persiste os resultados.
   * Retorna { totalTestados, totalSalvos }
   */
  async executarETPersistirParaTodos(equipamentos) {
    logger.info('Executar testes de ping e persistir resultados para todos os equipamentos.');
    const resultados = await this.realizarTesteAll(equipamentos);
    let salvos = 0;

    for (const r of resultados) {
      try {
        await this.salvar(r);
        salvos++;
      } catch (err) {
        logger.warn(`Falha ao salvar resultado para equipamento ${r.equipamento_id}:`, err.message || err);
      }
    }

    logger.success(`Processo finalizado. Testados: ${resultados.length}, Salvos: ${salvos}`);
    return { totalTestados: resultados.length, totalSalvos: salvos };
  }

  /**
   * Lista todos os testes de ping (com dados de equipamento).
   */
  async listarTodos() {
    logger.info('Listando todos os testes de ping registrados.');
    try {
      const rows = await PingTestRepository.findAllWithEquipamento();
      if (!rows || rows.length === 0) {
        logger.warn('Nenhum teste de ping registrado encontrado.');
        return [];
      }
      logger.success(`${rows.length} registros de ping encontrados.`);
      return rows;
    } catch (err) {
      logger.error('Erro ao listar testes de ping:', err.message || err);
      throw err;
    }
  }

  /**
   * Lista testes de ping para os equipamentos informados (array ou single id).
   */
  async listarPorEquipamentos(equipamentos) {
    logger.info('Listando testes de ping por equipamentos.');
    if (!equipamentos || (Array.isArray(equipamentos) && equipamentos.length === 0)) {
      const err = new Error('Nenhum ID de equipamento informado');
      err.status = 400;
      logger.error(err.message);
      throw err;
    }

    try {
      const rows = await PingTestRepository.findByEquipamentoIds(equipamentos);
      if (!rows || rows.length === 0) {
        logger.warn('Nenhum teste de ping encontrado para os equipamentos informados.');
        return [];
      }
      logger.success(`${rows.length} registros encontrados para os equipamentos informados.`);
      return rows;
    } catch (err) {
      logger.error('Erro ao listar testes por equipamentos:', err.message || err);
      throw err;
    }
  }
}

module.exports = new PingTestService();
