// controllers/SolicitacaoAcessoController.js
const loggerSolic = require('../utils/logger/Logger');
const SolicitacaoAcessoService = require('../services/SolicitacaoAcessoService');

/**
 * Controller para solicitações de acesso.
 * Rotas sugeridas:
 *  - POST /solicitacoes          -> criarSolicitacao
 *  - GET  /solicitacoes/:id      -> buscarPendente
 *  - POST /solicitacoes/:id/approve -> aprovarSolicitacao
 *  - POST /solicitacoes/:id/reject  -> rejeitarSolicitacao
 */
class SolicitacaoAcessoController {
  async criarSolicitacao(req, res) {
    try {
      const payload = req.body || {};
      const resultado = await SolicitacaoAcessoService.criarSolicitacao(payload);
      return res.status(201).json(resultado);
    } catch (err) {
      loggerSolic.error('[SolicitacaoAcessoController] Erro ao criar solicitação:', err.message || err);
      const status = err.status || 500;
      return res.status(status).json({ error: status === 500 ? 'Erro interno no servidor.' : err.message });
    }
  }

  async buscarPendente(req, res) {
    try {
      const id = req.params.id;
      if (!id) {
        loggerSolic.warn('[SolicitacaoAcessoController] buscarPendente sem id.');
        return res.status(400).json({ error: 'id é obrigatório.' });
      }

      const solicitacao = await SolicitacaoAcessoService.buscarPendente(id);
      if (!solicitacao) return res.status(404).json({ error: 'Solicitação pendente não encontrada.' });
      return res.status(200).json(solicitacao);
    } catch (err) {
      loggerSolic.error('[SolicitacaoAcessoController] Erro ao buscar pendente:', err.message || err);
      const status = err.status || 500;
      return res.status(status).json({ error: status === 500 ? 'Erro interno no servidor.' : err.message });
    }
  }

  async aprovarSolicitacao(req, res) {
    try {
      const id = req.params.id;
      const usuarioAprovadorId = req.body.usuarioAprovadorId || (req.user && req.user.id);
      if (!id || !usuarioAprovadorId) {
        loggerSolic.warn('[SolicitacaoAcessoController] aprovarSolicitacao faltando parametros.');
        return res.status(400).json({ error: 'id e usuarioAprovadorId são obrigatórios.' });
      }

      const resultado = await SolicitacaoAcessoService.aprovarSolicitacao(id, usuarioAprovadorId);
      return res.status(200).json(resultado);
    } catch (err) {
      loggerSolic.error('[SolicitacaoAcessoController] Erro ao aprovar solicitação:', err.message || err);
      const status = err.status || 500;
      return res.status(status).json({ error: status === 500 ? 'Erro interno no servidor.' : err.message });
    }
  }

  async rejeitarSolicitacao(req, res) {
    try {
      const id = req.params.id;
      const usuarioRejeitadorId = req.body.usuarioRejeitadorId || (req.user && req.user.id);
      if (!id || !usuarioRejeitadorId) {
        loggerSolic.warn('[SolicitacaoAcessoController] rejeitarSolicitacao faltando parametros.');
        return res.status(400).json({ error: 'id e usuarioRejeitadorId são obrigatórios.' });
      }

      const resultado = await SolicitacaoAcessoService.rejeitarSolicitacao(id, usuarioRejeitadorId);
      return res.status(200).json(resultado);
    } catch (err) {
      loggerSolic.error('[SolicitacaoAcessoController] Erro ao rejeitar solicitação:', err.message || err);
      const status = err.status || 500;
      return res.status(status).json({ error: status === 500 ? 'Erro interno no servidor.' : err.message });
    }
  }
}

module.exports = new SolicitacaoAcessoController();