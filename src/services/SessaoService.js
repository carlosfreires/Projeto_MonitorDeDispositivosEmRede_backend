// services/SessaoService.js
const crypto = require('crypto');
const logger = require('../utils/logger');
const SessaoRepository = require('../repositories/SessaoRepository');
const { SessaoModel } = require('../models/SessaoModel');

class SessaoService {
  /**
   * Gera token seguro (hex). bytes padrão = 32 => 64 chars hex.
   */
  static gerarTokenSeguro(bytes = 32) {
    return crypto.randomBytes(bytes).toString('hex');
  }

  static #validarDadosCriacao({ usuario_id, token, expiracao, ip }) {
    const erros = [];
    if (!usuario_id) erros.push('usuario_id é obrigatório');
    if (!token || typeof token !== 'string' || token.length < 16) erros.push('token inválido (mínimo 16 caracteres)');
    if (!expiracao) erros.push('expiracao é obrigatória');
    if (!ip || typeof ip !== 'string') erros.push('ip é obrigatório');

    if (erros.length) {
      const erro = new Error(`Payload inválido: ${erros.join(', ')}`);
      erro.status = 400;
      throw erro;
    }
  }

  /**
   * Cria uma sessão para o usuário.
   * expiracao pode ser Date ou ISO string.
   * Retorna { message, token }.
   */
  static async criarSessao({ usuario_id, token = null, expiracao, ip }) {
    logger.info(`Criando sessão para usuário ID=${usuario_id}`);

    if (!token) token = this.gerarTokenSeguro();
    this.#validarDadosCriacao({ usuario_id, token, expiracao, ip });

    try {
      const resultado = await SessaoRepository.create({ usuario_id, token, expiracao, ip });
      logger.success(`Sessão criada com sucesso para usuário ID=${usuario_id} (insertId=${resultado.insertId ?? 'N/A'})`);
      return { message: 'Sessão criada com sucesso', token };
    } catch (err) {
      logger.error('Erro ao criar sessão:', err.message || err);
      throw err;
    }
  }

  /**
   * Remove sessão por token.
   * Retorna { message, affectedRows }.
   */
  static async removerSessaoPorToken(token) {
    logger.info(`Removendo sessão pelo token.`);
    try {
      const resultado = await SessaoRepository.deleteByToken(token);
      logger.success(`Sessão removida (token). affectedRows=${resultado.affectedRows ?? 0}`);
      return { message: 'Sessão removida com sucesso', affectedRows: resultado.affectedRows ?? 0 };
    } catch (err) {
      logger.error('Erro ao remover sessão por token:', err.message || err);
      throw err;
    }
  }

  /**
   * Busca sessão pelo token; retorna SessaoModel ou null.
   */
  static async buscarPorToken(token) {
    logger.info('Consultando sessão por token.');
    try {
      return await SessaoRepository.findByToken(token);
    } catch (err) {
      logger.error('Erro ao buscar sessão por token:', err.message || err);
      throw err;
    }
  }

  /**
   * Invalida (remove) todas as sessões de um usuário.
   * Retorna { message, affectedRows }.
   */
  static async invalidarSessaoDoUsuario(usuarioId) {
    logger.info(`Invalidando sessões do usuário ID=${usuarioId}`);
    try {
      const resultado = await SessaoRepository.deleteByUsuarioId(usuarioId);
      logger.success(`Sessões invalidadas. affectedRows=${resultado.affectedRows ?? 0}`);
      return { message: 'Sessões invalidadas com sucesso', affectedRows: resultado.affectedRows ?? 0 };
    } catch (err) {
      logger.error('Erro ao invalidar sessões do usuário:', err.message || err);
      throw err;
    }
  }
}

module.exports = SessaoService;
