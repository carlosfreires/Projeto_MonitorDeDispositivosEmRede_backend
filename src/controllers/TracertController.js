// controllers/TracertController.js
const logger = require('../utils/logger');
const TracertService = require('../services/TracertService');

/**
 * Controller para operações de traceroute (tracert).
 * Rotas sugeridas:
 *  - POST /tracert           -> executar (body: { destino, ...options })
 *  - POST /tracert/persist   -> executarETPersistirParaTodos (body: { equipamentos, options })
 *  - GET  /tracert           -> listarTodos
 *  - POST /tracert/by-ids    -> listarPorEquipamentos (body: { equipamentosIds })
 */
class TracertController {
  async executar(req, res) {
    try {
      const payload = req.body || req.query || {};
      const destino = payload.destino;
      if (!destino) {
        logger.warn('[TracertController] executar sem destino.');
        return res.status(400).json({ error: 'destino é obrigatório.' });
      }

      const options = {
        protocolo: payload.protocolo,
        porta_tipo: payload.porta_tipo,
        porta: payload.porta,
        ttlMax: payload.ttlMax,
        tentativasPorSalto: payload.tentativasPorSalto,
        timeout: payload.timeout
      };

      const resultado = await TracertService.executar({ destino, ...options });
      return res.status(200).json(resultado);
    } catch (err) {
      logger.error('[TracertController] Erro ao executar tracert:', err.message || err);
      const status = err.status || 500;
      return res.status(status).json({ error: status === 500 ? 'Erro interno no servidor.' : err.message });
    }
  }

  async executarETPersistirParaTodos(req, res) {
    try {
      const equipamentos = req.body.equipamentos || req.body;
      const options = req.body.options || {};
      if (!equipamentos) {
        logger.warn('[TracertController] executarETPersistirParaTodos sem equipamentos.');
        return res.status(400).json({ error: 'equipamentos é obrigatório.' });
      }

      const resumo = await TracertService.executarETPersistirParaTodos(equipamentos, options);
      return res.status(200).json(resumo);
    } catch (err) {
      logger.error('[TracertController] Erro em tracert em lote:', err.message || err);
      const status = err.status || 500;
      return res.status(status).json({ error: status === 500 ? 'Erro interno no servidor.' : err.message });
    }
  }

  async listarTodos(req, res) {
    try {
      const rows = await TracertService.listarTodos();
      return res.status(200).json(rows);
    } catch (err) {
      logger.error('[TracertController] Erro ao listar tracerts:', err.message || err);
      const status = err.status || 500;
      return res.status(status).json({ error: status === 500 ? 'Erro interno no servidor.' : err.message });
    }
  }

  async listarPorEquipamentos(req, res) {
    try {
      const equipamentosIds = req.body.equipamentos || req.body.ids || req.query.ids || req.params.ids;
      if (!equipamentosIds) {
        logger.warn('[TracertController] listarPorEquipamentos sem ids.');
        return res.status(400).json({ error: 'equipamentos/ids são obrigatórios.' });
      }

      const rows = await TracertService.listarPorEquipamentos(equipamentosIds);
      return res.status(200).json(rows);
    } catch (err) {
      logger.error('[TracertController] Erro ao listar tracerts por equipamentos:', err.message || err);
      const status = err.status || 500;
      return res.status(status).json({ error: status === 500 ? 'Erro interno no servidor.' : err.message });
    }
  }
}

module.exports = new TracertController();
