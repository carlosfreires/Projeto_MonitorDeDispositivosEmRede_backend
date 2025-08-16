// controllers/AuthController.js
const logger = require('../utils/logger/Logger');
const AuthService = require('../services/AuthService');

/**
 * Controller responsável por autenticação (login / logout).
 * Mantém respostas HTTP padronizadas e tratamento de erros.
 */
class AuthController {
  /**
   * POST /auth/login
   * body: { email, senha }
   */
  async login(req, res) {
    try {
      const { email, senha } = req.body || {};
      if (!email || !senha) {
        logger.warn('[AuthController] Falha no login: email ou senha ausentes');
        return res.status(400).json({ error: 'email e senha são obrigatórios.' });
      }

      const ip = req.ip || (req.connection && req.connection.remoteAddress) || null;
      const resultado = await AuthService.login({ email, senha, ip });

      return res.status(200).json(resultado);
    } catch (err) {
      logger.error('[AuthController] Erro no login:', err.message || err);
      const status = err.status || 500;
      return res.status(status).json({ error: status === 500 ? 'Erro interno no servidor.' : err.message });
    }
  }

  /**
   * POST /auth/logout
   * header Authorization: Bearer <token> OR body: { token }
   */
  async logout(req, res) {
    try {
      let token = null;
      const authHeader = req.headers && req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) token = authHeader.split(' ')[1];
      token = token || (req.body && req.body.token) || (req.query && req.query.token);

      if (!token) {
        logger.warn('[AuthController] Logout sem token.');
        return res.status(400).json({ error: 'Token é obrigatório para logout.' });
      }

      const resultado = await AuthService.logout(token);
      return res.status(200).json(resultado);
    } catch (err) {
      logger.error('[AuthController] Erro no logout:', err.message || err);
      const status = err.status || 500;
      return res.status(status).json({ error: status === 500 ? 'Erro interno no servidor.' : err.message });
    }
  }
}

module.exports = new AuthController();