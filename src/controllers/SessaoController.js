// controllers/SessaoController.js
const SessaoService = require('../services/SessaoService');

/**
 * Controller para manipulação de sessões.
 * Métodos:
 *  - criarSessao
 *  - buscarPorToken
 *  - removerPorToken
 *  - invalidarSessaoDoUsuario
 */
class SessaoController {
  /**
   * POST /sessoes
   * body: { usuario_id, token?, expiracao, ip }
   */
  async criarSessao(req, res) {
    try {
      const { usuario_id, token, expiracao, ip } = req.body || {};
      const resultado = await SessaoService.criarSessao({ usuario_id, token, expiracao, ip });
      return res.status(201).json(resultado);
    } catch (err) {
      logger.error('[SessaoController] Erro ao criar sessão:', err.message || err);
      const status = err.status || 500;
      return res.status(status).json({ error: status === 500 ? 'Erro interno no servidor.' : err.message });
    }
  }

  /**
   * GET /sessoes/:token
   */
  async buscarPorToken(req, res) {
    try {
      const token = req.params.token || req.query.token || (req.body && req.body.token);
      if (!token) {
        logger.warn('[SessaoController] buscarPorToken sem token.');
        return res.status(400).json({ error: 'Token é obrigatório.' });
      }

      const sessao = await SessaoService.buscarPorToken(token);
      if (!sessao) return res.status(404).json({ error: 'Sessão não encontrada.' });
      return res.status(200).json(sessao);
    } catch (err) {
      logger.error('[SessaoController] Erro ao buscar sessão por token:', err.message || err);
      const status = err.status || 500;
      return res.status(status).json({ error: status === 500 ? 'Erro interno no servidor.' : err.message });
    }
  }

  /**
   * DELETE /sessoes/:token
   */
  async removerPorToken(req, res) {
    try {
      const token = req.params.token || (req.body && req.body.token) || req.query.token;
      if (!token) {
        logger.warn('[SessaoController] removerPorToken sem token.');
        return res.status(400).json({ error: 'Token é obrigatório.' });
      }

      const resultado = await SessaoService.removerSessaoPorToken(token);
      return res.status(200).json(resultado);
    } catch (err) {
      logger.error('[SessaoController] Erro ao remover sessão por token:', err.message || err);
      const status = err.status || 500;
      return res.status(status).json({ error: status === 500 ? 'Erro interno no servidor.' : err.message });
    }
  }

  /**
   * POST /sessoes/invalidate
   * body: { usuarioId }
   */
  async invalidarSessaoDoUsuario(req, res) {
    try {
      const usuarioId = req.params.usuarioId || (req.body && req.body.usuarioId) || (req.query && req.query.usuarioId);
      if (!usuarioId) {
        logger.warn('[SessaoController] invalidarSessaoDoUsuario sem usuarioId.');
        return res.status(400).json({ error: 'usuarioId é obrigatório.' });
      }

      const resultado = await SessaoService.invalidarSessaoDoUsuario(usuarioId);
      return res.status(200).json(resultado);
    } catch (err) {
      logger.error('[SessaoController] Erro ao invalidar sessões do usuário:', err.message || err);
      const status = err.status || 500;
      return res.status(status).json({ error: status === 500 ? 'Erro interno no servidor.' : err.message });
    }
  }
}

module.exports = new SessaoController();