// controllers/TelnetController.js
const loggerTelnet = require('../utils/logger');
const TelnetService = require('../services/TelnetService');

/**
 * Controller para testes Telnet.
 * Rotas sugeridas:
 *  - POST /telnet/test        -> realizarTeste (body: { alvo, timeoutMs? })
 *  - POST /telnet/persist     -> executarETPersistirParaTodos (body: { equipamentos: [...] })
 *  - GET  /telnet             -> listarTodos
 *  - POST /telnet/by-ids      -> listarPorEquipamentos (body: { equipamentos: [...] })
 */
class TelnetController {
  async realizarTeste(req, res) {
    try {
      const alvo = req.body.alvo || req.params.id || req.body.id;
      const timeoutMs = req.body.timeoutMs || undefined;
      if (!alvo) {
        loggerTelnet.warn('[TelnetController] realizarTeste sem alvo.');
        return res.status(400).json({ error: 'alvo (id ou objeto) é obrigatório.' });
      }

      const resultado = await TelnetService.realizarTeste(alvo, timeoutMs);
      return res.status(200).json(resultado);
    } catch (err) {
      loggerTelnet.error('[TelnetController] Erro ao realizar teste Telnet:', err.message || err);
      const status = err.status || 500;
      return res.status(status).json({ error: status === 500 ? 'Erro interno no servidor.' : err.message });
    }
  }

  async executarETPersistirParaTodos(req, res) {
    try {
      const equipamentos = req.body.equipamentos || req.body;
      if (!equipamentos) {
        loggerTelnet.warn('[TelnetController] executarETPersistirParaTodos sem equipamentos.');
        return res.status(400).json({ error: 'equipamentos é obrigatório.' });
      }

      const resumo = await TelnetService.executarETPersistirParaTodos(equipamentos);
      return res.status(200).json(resumo);
    } catch (err) {
      loggerTelnet.error('[TelnetController] Erro em Telnet em lote:', err.message || err);
      const status = err.status || 500;
      return res.status(status).json({ error: status === 500 ? 'Erro interno no servidor.' : err.message });
    }
  }

  async listarTodos(req, res) {
    try {
      const rows = await TelnetService.listarTodos();
      return res.status(200).json(rows);
    } catch (err) {
      loggerTelnet.error('[TelnetController] Erro ao listar testes Telnet:', err.message || err);
      const status = err.status || 500;
      return res.status(status).json({ error: status === 500 ? 'Erro interno no servidor.' : err.message });
    }
  }

  async listarPorEquipamentos(req, res) {
    try {
      const equipamentos = req.body.equipamentos || req.query.ids || req.params.ids;
      if (!equipamentos) {
        loggerTelnet.warn('[TelnetController] listarPorEquipamentos sem equipamentos/ids.');
        return res.status(400).json({ error: 'equipamentos/ids são obrigatórios.' });
      }

      const rows = await TelnetService.listarPorEquipamentos(equipamentos);
      return res.status(200).json(rows);
    } catch (err) {
      loggerTelnet.error('[TelnetController] Erro ao listar por equipamentos Telnet:', err.message || err);
      const status = err.status || 500;
      return res.status(status).json({ error: status === 500 ? 'Erro interno no servidor.' : err.message });
    }
  }
}

module.exports = new TelnetController();
