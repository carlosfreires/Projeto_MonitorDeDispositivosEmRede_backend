// controllers/LogMonitoramentoController.js
const LogMonitoramentoService = require('../services/LogMonitoramentoService');

/**
 * Controller para operações relacionadas à consolidação e consulta de logs de monitoramento.
 * Rotas sugeridas:
 *  - POST /monitoramento/consolidar      -> consolidarLogs
 *  - GET  /monitoramento                 -> listarTodos (query: dataInicial, dataFinal)
 *  - POST /monitoramento/by-equipment   -> listarPorEquipamento (body: { ids, dataInicial?, dataFinal? })
 *  - GET  /monitoramento/ativos         -> listarLogsAtivos (query: dataInicial, dataFinal)
 *  - DELETE /monitoramento              -> apagarLogs
 *  - POST   /monitoramento/truncate     -> apagarLogsComTruncate
 */
class LogMonitoramentoController {
  async consolidarLogs(req, res) {
    try {
      const resultado = await LogMonitoramentoService.consolidarLogs();
      return res.status(200).json(resultado);
    } catch (err) {
      logger.error('[LogMonitoramentoController] Erro ao consolidar logs:', err.message || err);
      const status = err.status || 500;
      return res.status(status).json({ error: status === 500 ? 'Erro interno no servidor.' : err.message });
    }
  }

  async listarTodos(req, res) {
    try {
      const { dataInicial, dataFinal } = req.query || {};
      const rows = await LogMonitoramentoService.listarTodos(dataInicial, dataFinal);
      return res.status(200).json(rows);
    } catch (err) {
      logger.error('[LogMonitoramentoController] Erro ao listar logs:', err.message || err);
      const status = err.status || 500;
      return res.status(status).json({ error: status === 500 ? 'Erro interno no servidor.' : err.message });
    }
  }

  async listarPorEquipamento(req, res) {
    try {
      const ids = req.body.ids || req.query.ids || req.params.ids;
      const { dataInicial, dataFinal } = req.body || req.query || {};
      if (!ids) {
        logger.warn('[LogMonitoramentoController] listarPorEquipamento sem ids.');
        return res.status(400).json({ error: 'ids é obrigatório.' });
      }

      const rows = await LogMonitoramentoService.listarPorEquipamento(ids, dataInicial, dataFinal);
      return res.status(200).json(rows);
    } catch (err) {
      logger.error('[LogMonitoramentoController] Erro ao listar por equipamento:', err.message || err);
      const status = err.status || 500;
      return res.status(status).json({ error: status === 500 ? 'Erro interno no servidor.' : err.message });
    }
  }

  async listarLogsAtivos(req, res) {
    try {
      const { dataInicial, dataFinal } = req.query || {};
      const rows = await LogMonitoramentoService.listarLogsAtivos(dataInicial, dataFinal);
      return res.status(200).json(rows);
    } catch (err) {
      logger.error('[LogMonitoramentoController] Erro ao listar logs ativos:', err.message || err);
      const status = err.status || 500;
      return res.status(status).json({ error: status === 500 ? 'Erro interno no servidor.' : err.message });
    }
  }

  async apagarLogs(req, res) {
    try {
      const resultado = await LogMonitoramentoService.apagarLogs();
      return res.status(200).json(resultado);
    } catch (err) {
      logger.error('[LogMonitoramentoController] Erro ao apagar logs:', err.message || err);
      const status = err.status || 500;
      return res.status(status).json({ error: status === 500 ? 'Erro interno no servidor.' : err.message });
    }
  }

  async apagarLogsComTruncate(req, res) {
    try {
      const resultado = await LogMonitoramentoService.apagarLogsComTruncate();
      return res.status(200).json(resultado);
    } catch (err) {
      logger.error('[LogMonitoramentoController] Erro ao apagar logs com truncate:', err.message || err);
      const status = err.status || 500;
      return res.status(status).json({ error: status === 500 ? 'Erro interno no servidor.' : err.message });
    }
  }
}

module.exports = new LogMonitoramentoController();