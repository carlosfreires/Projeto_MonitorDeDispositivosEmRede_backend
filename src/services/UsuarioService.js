// services/UsuarioService.js
const bcrypt = require('bcrypt');
const logger = require('../utils/logger/Logger');
const UsuarioModel = require('../models/UsuarioModel');
const UsuarioRepository = require('../repositories/UsuarioRepository');

/**
 * Serviço de negócio para Usuário.
 * Valida payloads, orquestra o repositório e padroniza logs.
 */
class UsuarioService {
  static #throwBadRequest(erros) {
    const e = new Error(`Payload inválido: ${erros.join(', ')}`);
    e.status = 400;
    throw e;
  }

  static #validarCriacao({ nome, sobrenome, email, senha }) {
    const erros = [];
    if (!nome || !String(nome).trim()) erros.push('nome é obrigatório');
    if (!sobrenome || !String(sobrenome).trim()) erros.push('sobrenome é obrigatório');
    if (!email || !String(email).trim()) erros.push('email é obrigatório');
    if (!senha || String(senha).length < 6) erros.push('senha deve ter ao menos 6 caracteres');
    if (erros.length) this.#throwBadRequest(erros);
  }

  static async criarUsuario(dados, ativo = false) {
    logger.info(`Criando usuário: ${dados.email}`);
    this.#validarCriacao(dados);

    const existente = await UsuarioRepository.findByEmail(dados.email);
    if (existente) {
      const e = new Error('Já existe um usuário com este e-mail.');
      e.status = 409;
      logger.error('[Cadastro de Usuário] E-mail já cadastrado:', dados.email);
      throw e;
    }

    const senhaHash = await bcrypt.hash(dados.senha, 10);
    const usuario = new UsuarioModel({
      ...dados,
      senha: senhaHash,
      ativo
    });

    try {
      const resultado = await UsuarioRepository.create(usuario);
      const insertId = resultado.insertId ?? null;
      logger.success('[Cadastro de Usuário] Usuário cadastrado com sucesso. ID=' + insertId);
      return { id: insertId, nome: usuario.nome, sobrenome: usuario.sobrenome, email: usuario.email };
    } catch (err) {
      logger.error('[Cadastro de Usuário] Erro ao persistir usuário:', err.message || err);
      throw err;
    }
  }

  static async buscarPorId(id) {
    try {
      const row = await UsuarioRepository.findById(id);
      if (!row) {
        const e = new Error('Usuário não encontrado');
        e.status = 404;
        throw e;
      }
      return new UsuarioModel(row);
    } catch (err) {
      logger.error('Erro ao buscar usuário por ID:', err.message || err);
      throw err;
    }
  }

  static async buscarPorEmailAtivo(email) {
    try {
      const row = await UsuarioRepository.findByEmail(email, true);
      return row ? new UsuarioModel(row) : null;
    } catch (err) {
      logger.error('Erro ao buscar usuário por email ativo:', err.message || err);
      throw err;
    }
  }

  static async atualizarDadosCadastrais(id, dados) {
    logger.info('Atualizando dados cadastrais para usuário ID=' + id);
    try {
      const resultado = await UsuarioRepository.updateBasic(id, dados);
      logger.success('Dados cadastrais atualizados com sucesso para ID=' + id);
      return { affectedRows: resultado.affectedRows ?? 0 };
    } catch (err) {
      logger.error('Erro ao atualizar dados cadastrais:', err.message || err);
      throw err;
    }
  }

  static async atualizarEmail(id, novoEmail) {
    logger.info(`Atualizando email do usuário ID=${id} para ${novoEmail}`);
    try {
      const existente = await UsuarioRepository.findByEmail(novoEmail);
      if (existente && existente.id !== id) {
        const e = new Error('E-mail já cadastrado por outro usuário');
        e.status = 409;
        logger.error('Conflito ao atualizar email:', novoEmail);
        throw e;
      }
      const resultado = await UsuarioRepository.updateEmail(id, novoEmail);
      logger.success(`Email atualizado com sucesso para ID=${id}`);
      return { affectedRows: resultado.affectedRows ?? 0 };
    } catch (err) {
      logger.error('Erro ao atualizar email:', err.message || err);
      throw err;
    }
  }

  static async atualizarSenha(id, novaSenha) {
    logger.info(`Atualizando senha do usuário ID=${id}`);
    try {
      const senhaHash = typeof novaSenha === 'string' && novaSenha.startsWith('$2b$') ? novaSenha : await bcrypt.hash(novaSenha, 10);
      const resultado = await UsuarioRepository.updatePasswordHash(id, senhaHash);
      logger.success(`Senha atualizada com sucesso para ID=${id}`);
      return { affectedRows: resultado.affectedRows ?? 0 };
    } catch (err) {
      logger.error('Erro ao atualizar senha:', err.message || err);
      throw err;
    }
  }

  static async atualizarFotoPerfil(id, novaFoto) {
    logger.info(`Atualizando foto de perfil do usuário ID=${id}`);
    try {
      const resultado = await UsuarioRepository.updateFotoPerfil(id, novaFoto);
      logger.success(`Foto de perfil atualizada para ID=${id}`);
      return { affectedRows: resultado.affectedRows ?? 0 };
    } catch (err) {
      logger.error('Erro ao atualizar foto de perfil:', err.message || err);
      throw err;
    }
  }

  static async ativar(id) {
    logger.info(`Ativando usuário ID=${id}`);
    try {
      const resultado = await UsuarioRepository.activate(id);
      logger.success(`Usuário ativado com sucesso ID=${id}`);
      return { affectedRows: resultado.affectedRows ?? 0 };
    } catch (err) {
      logger.error('Erro ao ativar usuário:', err.message || err);
      throw err;
    }
  }

  static async inativar(id) {
    logger.info(`Inativando usuário ID=${id}`);
    try {
      const resultado = await UsuarioRepository.deactivate(id);
      logger.success(`Usuário inativado com sucesso ID=${id}`);
      return { affectedRows: resultado.affectedRows ?? 0 };
    } catch (err) {
      logger.error('Erro ao inativar usuário:', err.message || err);
      throw err;
    }
  }
}

module.exports = UsuarioService;
