// monitoring-manager/agendadorConsolidado.js
const logger = require('../utils/logger/Logger');
const LogMonitoramentoService = require('../services/LogMonitoramentoService');
const { executarETPersistirParaTodos: testarTodosEquipamentosPing } = require('../services/PingTestService');
const { executarETPersistirParaTodos: testarTodosEquipamentosTelnet } = require('../services/TelnetService');

let intervalId = null;

/**
 * Executa um ciclo completo:
 * 1) executar testes de ping para todos os equipamentos
 * 2) executar testes de telnet para todos os equipamentos
 * 3) consolidar logs via LogMonitoramentoService
 */
async function executarConsolidacaoAutomatica() {
  logger.info('Iniciando ciclo de verificação e consolidação (automático).');

  try {
    logger.info('Iniciando testes de Ping em todos os equipamentos...');
    await testarTodosEquipamentosPing();
    logger.info('Testes de Ping concluídos.');

    logger.info('Iniciando testes de Telnet em todos os equipamentos...');
    await testarTodosEquipamentosTelnet();
    logger.info('Testes de Telnet concluídos.');

    logger.info('Iniciando consolidação dos logs...');
    await LogMonitoramentoService.consolidarLogs();
    logger.success('Consolidação de logs concluída.');
  } catch (err) {
    logger.error('Erro no processo de consolidação automática:', err.message || err);
    // não relança — queremos que o agendador continue executando em ciclos futuros
  }
}

/**
 * Inicia agendamento (intervalo em minutos). Se já houver um agendamento ativo,
 * cancela o anterior e inicia o novo.
 */
function iniciarAgendamento(intervaloEmMinutos = 3) {
  if (intervalId !== null) {
    logger.warn('Agendamento anterior encontrado — cancelando antes de iniciar novo.');
    clearInterval(intervalId);
    intervalId = null;
  }

  const intervaloEmMs = Math.max(1, Number(intervaloEmMinutos)) * 60 * 1000;
  logger.info(`Agendamento iniciado — executando a cada ${intervaloEmMinutos} minuto(s).`);

  // inicia intervalo assíncrono seguro (não acumulativo)
  intervalId = setInterval(() => {
    (async () => {
      logger.info('Ciclo de consolidação agendado iniciado.');
      try {
        await executarConsolidacaoAutomatica();
      } catch (err) {
        logger.error('Erro não tratado no ciclo agendado:', err.message || err);
      }
      logger.info('Ciclo de consolidação agendado finalizado.');
    })();
  }, intervaloEmMs);
}

/**
 * Para o agendamento caso exista.
 */
function pararAgendamento() {
  if (intervalId !== null) {
    clearInterval(intervalId);
    intervalId = null;
    logger.warn('Agendamento interrompido pelo usuário.');
  } else {
    logger.info('Nenhum agendamento ativo para parar.');
  }
}

module.exports = { iniciarAgendamento, pararAgendamento, executarConsolidacaoAutomatica };
