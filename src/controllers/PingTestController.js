// controllers/PingTestController.js
const loggerPing = require('../utils/logger');
const PingTestService = require('../services/PingTestService');

/**
 * Controller para testes de ping.
 * Rotas sugeridas:
 *  - POST /ping/test           -> realizarTeste (body: { alvo })
 *  - POST /ping/batch          -> realizarTesteAll (body: { equipamentos: [...] })
 *  - POST /ping/persist        -> executarETPersistirParaTodos (body: { equipamentos: [...] })
 *  - GET  /ping                -> listarTodos
 *  - POST /ping/by-ids         -> listarPorEquipamentos (body: { equipamentos: [...] } ou ids)
 */
class PingTestController {
  async realizarTeste(req, res) {
    try {
      const alvo = req.body.alvo || req.params.id || req.body.id;
      if (!alvo) {
        loggerPing.warn('[PingTestController] realizarTeste sem alvo.');
        return res.status(400).json({ error: 'alvo (id ou objeto) é obrigatório.' });
      }

      const resultado = await PingTestService.realizarTeste(alvo);
      return res.status(200).json(resultado);
    } catch (err) {
      loggerPing.error('[PingTestController] Erro ao realizar teste:', err.message || err);
      const status = err.status || 500;
      return res.status(status).json({ error: status === 500 ? 'Erro interno no servidor.' : err.message });
    }
  }

  async realizarTesteAll(req, res) {
    try {
      const equipamentos = req.body.equipamentos || req.body;
      if (!equipamentos) {
        loggerPing.warn('[PingTestController] realizarTesteAll sem equipamentos.');
        return res.status(400).json({ error: 'equipamentos é obrigatório.' });
      }

      const resultados = await PingTestService.realizarTesteAll(equipamentos);
      return res.status(200).json(resultados);
    } catch (err) {
      loggerPing.error('[PingTestController] Erro em testes em lote:', err.message || err);
      const status = err.status || 500;
      return res.status(status).json({ error: status === 500 ? 'Erro interno no servidor.' : err.message });
    }
  }

  async executarETPersistirParaTodos(req, res) {
    try {
      const equipamentos = req.body.equipamentos || req.body;
      if (!equipamentos) {
        loggerPing.warn('[PingTestController] executarETPersistirParaTodos sem equipamentos.');
        return res.status(400).json({ error: 'equipamentos é obrigatório.' });
      }

      const resumo = await PingTestService.executarETPersistirParaTodos(equipamentos);
      return res.status(200).json(resumo);
    } catch (err) {
      loggerPing.error('[PingTestController] Erro ao executar e persistir testes:', err.message || err);
      const status = err.status || 500;
      return res.status(status).json({ error: status === 500 ? 'Erro interno no servidor.' : err.message });
    }
  }

  async listarTodos(req, res) {
    try {
      const rows = await PingTestService.listarTodos();
      return res.status(200).json(rows);
    } catch (err) {
      loggerPing.error('[PingTestController] Erro ao listar testes de ping:', err.message || err);
      const status = err.status || 500;
      return res.status(status).json({ error: status === 500 ? 'Erro interno no servidor.' : err.message });
    }
  }

  async listarPorEquipamentos(req, res) {
    try {
      const equipamentos = req.body.equipamentos || req.query.ids || req.params.ids;
      if (!equipamentos) {
        loggerPing.warn('[PingTestController] listarPorEquipamentos sem equipamentos/ids.');
        return res.status(400).json({ error: 'equipamentos/ids são obrigatórios.' });
      }

      const rows = await PingTestService.listarPorEquipamentos(equipamentos);
      return res.status(200).json(rows);
    } catch (err) {
      loggerPing.error('[PingTestController] Erro ao listar por equipamentos:', err.message || err);
      const status = err.status || 500;
      return res.status(status).json({ error: status === 500 ? 'Erro interno no servidor.' : err.message });
    }
  }
}

module.exports = new PingTestController();