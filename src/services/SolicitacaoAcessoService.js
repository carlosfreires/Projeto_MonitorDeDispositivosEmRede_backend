// services/SolicitacaoAcessoService.js
const bcrypt = require('bcrypt');
const logger = require('../utils/logger');
const SolicitacaoAcessoModel = require('../models/SolicitacaoAcessoModel');
const SolicitacaoAcessoRepository = require('../repositories/SolicitacaoAcessoRepository');

class SolicitacaoAcessoService {
  #throwInvalidPayload(erros) {
    const erro = new Error(`Payload inválido: ${erros.join(', ')}`);
    erro.status = 400;
    throw erro;
  }

  #validarCriacao({ nome, sobrenome, email, senha, perfil_solicitado }) {
    const erros = [];
    if (!nome || !String(nome).trim()) erros.push('nome é obrigatório');
    if (!sobrenome || !String(sobrenome).trim()) erros.push('sobrenome é obrigatório');
    if (!email || !String(email).trim()) erros.push('email é obrigatório');
    if (!senha || String(senha).length < 6) erros.push('senha é obrigatória e deve ter ao menos 6 caracteres');
    if (!perfil_solicitado) erros.push('perfil_solicitado é obrigatório');

    if (erros.length) this.#throwInvalidPayload(erros);
  }

  /**
   * Cria uma solicitação de acesso (status inicial = 'pendente').
   * Retorna { message, solicitacaoId }.
   */
  async criarSolicitacao({ nome, sobrenome, email, senha, motivo = null, perfil_solicitado }) {
    logger.info(`Criando solicitação de acesso para: ${email}`);
    this.#validarCriacao({ nome, sobrenome, email, senha, perfil_solicitado });

    // Verifica se já existe alguma solicitação ou conta com o email
    const existente = await SolicitacaoAcessoRepository.findByEmail(email);
    if (existente) {
      const e = new Error('Já existe uma solicitação ou conta com este e-mail.');
      e.status = 409;
      logger.error('[Solicitação de Acesso] E-mail já utilizado:', email);
      throw e;
    }

    const senhaHash = await bcrypt.hash(senha, 10);

    try {
      const resultado = await SolicitacaoAcessoRepository.create({
        nome, sobrenome, email, senhaHash, motivo, perfil_solicitado
      });

      const insertId = resultado.insertId ?? null;
      const solicitacaoAcesso = new SolicitacaoAcessoModel({
        id: insertId,
        nome,
        sobrenome,
        email,
        motivo,
        perfil_solicitado,
        status: 'pendente',
        data_solicitacao: new Date().toISOString()
      });

      logger.success('[Solicitação de Acesso] Solicitação criada com sucesso. ID=' + insertId);
      return {
        message: 'Solicitação enviada com sucesso! Aguardando aprovação.',
        solicitacaoId: solicitacaoAcesso.id
      };
    } catch (err) {
      logger.error('[Solicitação de Acesso] Erro ao criar solicitação:', err.message || err);
      throw err;
    }
  }

  /**
   * Busca solicitação pendente por ID. Retorna SolicitacaoAcessoModel ou null.
   */
  async buscarPendente(idSolicitacao) {
    logger.info(`Buscando solicitação pendente ID=${idSolicitacao}`);
    try {
      const row = await SolicitacaoAcessoRepository.findById(idSolicitacao, 'pendente');
      if (!row) return null;
      return new SolicitacaoAcessoModel(row);
    } catch (err) {
      logger.error('Erro ao buscar solicitação pendente:', err.message || err);
      throw err;
    }
  }

  /**
   * Aprova uma solicitação pendente. Não cria usuário automaticamente (pode ser extensão futura).
   */
  async aprovarSolicitacao(idSolicitacao, usuarioAprovadorId) {
    logger.info(`Aprovando solicitação ID=${idSolicitacao} por usuario ID=${usuarioAprovadorId}`);
    try {
      const row = await SolicitacaoAcessoRepository.findById(idSolicitacao, 'pendente');
      if (!row) {
        const e = new Error('Solicitação não encontrada ou já processada.');
        e.status = 404;
        logger.warn('[Aprovação] Solicitação não encontrada ou já processada.');
        throw e;
      }

      await SolicitacaoAcessoRepository.approve(idSolicitacao, usuarioAprovadorId);
      logger.success('[Aprovação] Solicitação aprovada com sucesso. ID=' + idSolicitacao);
      return { message: 'Solicitação aprovada com sucesso' };
    } catch (err) {
      logger.error('[Aprovação] Erro ao aprovar solicitação:', err.message || err);
      throw err;
    }
  }

  /**
   * Rejeita uma solicitação pendente.
   */
  async rejeitarSolicitacao(idSolicitacao, usuarioRejeitadorId) {
    logger.info(`Rejeitando solicitação ID=${idSolicitacao} por usuario ID=${usuarioRejeitadorId}`);
    try {
      const row = await SolicitacaoAcessoRepository.findById(idSolicitacao, 'pendente');
      if (!row) {
        const e = new Error('Solicitação não encontrada ou já processada.');
        e.status = 404;
        logger.warn('[Rejeição] Solicitação não encontrada ou já processada.');
        throw e;
      }

      await SolicitacaoAcessoRepository.reject(idSolicitacao, usuarioRejeitadorId);
      logger.success('[Rejeição] Solicitação rejeitada com sucesso. ID=' + idSolicitacao);
      return { message: 'Solicitação rejeitada com sucesso' };
    } catch (err) {
      logger.error('[Rejeição] Erro ao rejeitar solicitação:', err.message || err);
      throw err;
    }
  }
}

module.exports = new SolicitacaoAcessoService();
