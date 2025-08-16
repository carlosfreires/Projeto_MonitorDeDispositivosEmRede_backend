// services/AuthService.js
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const logger = require('../utils/logger/Logger');
const UsuarioService = require('./UsuarioService');
const SessaoService = require('./SessaoService');

const JWT_SECRET = process.env.JWT_SECRET || 'seu_segredo_super_secreto';
const TOKEN_EXPIRATION = process.env.TOKEN_EXPIRATION || '2h'; // string para jwt
const TOKEN_EXPIRATION_MS = 2 * 60 * 60 * 1000; // 2 horas em ms (fallback)

/**
 * Serviço de autenticação (login/logout).
 * - Usa UsuarioService para obter o usuário ativo.
 * - Usa SessaoService para persistir sessões.
 * - Retorna token JWT e string ISO da expiração.
 */
class AuthService {
  /**
   * Realiza o login do usuário.
   * @param {Object} params { email, senha, ip }
   * @returns {Object} { token, expiracao }
   */
  static async login({ email, senha, ip }) {
    logger.info('[Auth] Iniciando processo de login...');
    logger.debug('[Auth] Params:', { email, ip });

    try {
      // busca usuário ativo pelo e-mail
      const usuario = await UsuarioService.buscarPorEmailAtivo(email);
      if (!usuario) {
        const err = new Error('Usuário não encontrado ou inativo.');
        err.status = 401;
        logger.warn('[Auth] Usuário não encontrado ou inativo:', email);
        throw err;
      }

      // valida senha (compara hash)
      const hash = usuario.senha;
      const senhaValida = await bcrypt.compare(String(senha), String(hash || ''));
      if (!senhaValida) {
        const err = new Error('Credenciais inválidas.');
        err.status = 401;
        logger.warn('[Auth] Credenciais inválidas para email:', email);
        throw err;
      }

      // gera JWT
      logger.debug('[Auth] Gerando token JWT...');
      const token = jwt.sign({ id: usuario.id }, JWT_SECRET, { expiresIn: TOKEN_EXPIRATION });

      // calcula expiração (em ISO string)
      const expiracaoDate = new Date(Date.now() + TOKEN_EXPIRATION_MS);
      const expiracaoISO = expiracaoDate.toISOString();

      // persiste sessão
      await SessaoService.criarSessao({
        usuario_id: usuario.id,
        token,
        expiracao: expiracaoISO,
        ip: ip || null
      });

      logger.success('[Auth] Login realizado com sucesso. Usuário ID=' + usuario.id);
      logger.debug('[Auth] Token e expiração gerados.');

      return { token, expiracao: expiracaoISO };
    } catch (err) {
      // loga o erro detalhado e relança (mantendo err.status quando houver)
      logger.error('[Auth] Erro no processo de login:', err.message || err);
      throw err;
    }
  }

  /**
   * Realiza o logout do usuário removendo a sessão pelo token.
   * @param {string} token
   * @returns {Object} mensagem
   */
  static async logout(token) {
    logger.info('[Auth] Iniciando processo de logout...');
    logger.debug('[Auth] Token recebido (hash parcial):', token ? `${token.slice(0, 8)}...` : null);

    try {
      const resultado = await SessaoService.removerSessaoPorToken(token);
      logger.success('[Auth] Logout realizado com sucesso.');
      return { message: 'Logout realizado com sucesso.', affectedRows: resultado.affectedRows ?? 0 };
    } catch (err) {
      logger.error('[Auth] Erro ao realizar logout:', err.message || err);
      throw err;
    } finally {
      logger.debug('[Auth] Finalizando processo de logout.');
    }
  }
}

module.exports = AuthService;
