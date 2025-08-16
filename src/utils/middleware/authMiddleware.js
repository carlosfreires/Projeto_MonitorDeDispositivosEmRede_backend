// utils/middlewares/authMiddleware.js
/**
 * Middleware de autenticação JWT + Sessão.
 *
 * - Extrai token do header Authorization (Bearer token) ou de query param (?token=...).
 * - Valida token JWT usando AuthService.
 * - Verifica existência de sessão no banco via SessaoService.
 * - Injeta no req o usuário autenticado e dados da sessão.
 *
 * Lança erro 401 caso o token seja inválido ou sessão não encontrada.
 */
const logger = require('../utils/logger');
const AuthService = require('../services/AuthService');
const { SessaoService } = require('../services/SessaoService');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'seu_segredo_super_secreto';

async function authMiddleware(req, res, next) {
  try {
    // Extrair token do header ou query
    let token = null;
    const authHeader = req.headers['authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.query.token) {
      token = req.query.token;
    }

    if (!token) {
      logger.warn('🔒 [AuthMiddleware] Nenhum token fornecido.');
      return res.status(401).json({ error: 'Token de autenticação não fornecido.' });
    }

    // Validar token JWT
    let payload;
    try {
      payload = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      logger.warn('🔒 [AuthMiddleware] Token inválido ou expirado.');
      return res.status(401).json({ error: 'Token inválido ou expirado.' });
    }

    // Verificar sessão no banco
    const sessao = await SessaoService.buscarPorToken(token);
    if (!sessao) {
      logger.warn(`🔒 [AuthMiddleware] Sessão não encontrada para token: ${token}`);
      return res.status(401).json({ error: 'Sessão inválida ou expirada.' });
    }

    // Buscar usuário
    const usuario = await AuthService.buscarUsuarioPorId
      ? await AuthService.buscarUsuarioPorId(payload.id)
      : { id: payload.id }; // fallback caso AuthService não tenha esse método

    if (!usuario) {
      logger.warn(`🔒 [AuthMiddleware] Usuário não encontrado. ID: ${payload.id}`);
      return res.status(401).json({ error: 'Usuário não encontrado ou inativo.' });
    }

    // Injetar dados no request para rotas seguintes
    req.usuario = usuario;
    req.sessao = sessao;

    logger.debug(`✅ [AuthMiddleware] Autenticado com sucesso: usuário ID ${usuario.id}`);
    next();
  } catch (err) {
    logger.error('❌ [AuthMiddleware] Erro inesperado na autenticação:', { message: err.message });
    return res.status(500).json({ error: 'Erro interno no processo de autenticação.' });
  }
}

module.exports = authMiddleware;
