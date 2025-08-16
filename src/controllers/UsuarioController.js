// controllers/UsuarioController.js
const UsuarioService = require('../services/UsuarioService');

/**
 * Controller para operações de usuário:
 * - criarUsuario
 * - buscarPorId
 * - atualizarDadosCadastrais
 * - atualizarEmail
 * - atualizarSenha
 * - atualizarFotoPerfil
 * - ativar
 * - inativar
 */
class UsuarioController {
  /**
   * POST /usuarios
   * body: { nome, sobrenome, email, senha, ... }
   */
  async criarUsuario(req, res) {
    try {
      const dados = req.body || {};
      const ativo = req.body.ativo === true || req.query.ativo === 'true';
      const resultado = await UsuarioService.criarUsuario(dados, ativo);
      return res.status(201).json(resultado);
    } catch (err) {
      logger.error('[UsuarioController] Erro ao criar usuário:', err.message || err);
      const status = err.status || 500;
      return res.status(status).json({ error: status === 500 ? 'Erro interno no servidor.' : err.message });
    }
  }

  /**
   * GET /usuarios/:id
   */
  async buscarPorId(req, res) {
    try {
      const id = req.params.id;
      if (!id) {
        logger.warn('[UsuarioController] buscarPorId sem id.');
        return res.status(400).json({ error: 'ID é obrigatório.' });
      }

      const usuario = await UsuarioService.buscarPorId(id);
      return res.status(200).json(usuario);
    } catch (err) {
      logger.error('[UsuarioController] Erro ao buscar usuário por ID:', err.message || err);
      const status = err.status || 500;
      return res.status(status).json({ error: status === 500 ? 'Erro interno no servidor.' : err.message });
    }
  }

  /**
   * PUT /usuarios/:id
   * body: dados básicos (nome, sobrenome, telefone, etc.)
   */
  async atualizarDadosCadastrais(req, res) {
    try {
      const id = req.params.id;
      const dados = req.body || {};
      if (!id) {
        logger.warn('[UsuarioController] atualizarDadosCadastrais sem id.');
        return res.status(400).json({ error: 'ID é obrigatório.' });
      }

      const resultado = await UsuarioService.atualizarDadosCadastrais(id, dados);
      return res.status(200).json(resultado);
    } catch (err) {
      logger.error('[UsuarioController] Erro ao atualizar dados cadastrais:', err.message || err);
      const status = err.status || 500;
      return res.status(status).json({ error: status === 500 ? 'Erro interno no servidor.' : err.message });
    }
  }

  /**
   * PATCH /usuarios/:id/email
   * body: { novoEmail }
   */
  async atualizarEmail(req, res) {
    try {
      const id = req.params.id;
      const { novoEmail } = req.body || {};
      if (!id || !novoEmail) {
        logger.warn('[UsuarioController] atualizarEmail faltando parametros.');
        return res.status(400).json({ error: 'ID e novoEmail são obrigatórios.' });
      }

      const resultado = await UsuarioService.atualizarEmail(id, novoEmail);
      return res.status(200).json(resultado);
    } catch (err) {
      logger.error('[UsuarioController] Erro ao atualizar email:', err.message || err);
      const status = err.status || 500;
      return res.status(status).json({ error: status === 500 ? 'Erro interno no servidor.' : err.message });
    }
  }

  /**
   * PATCH /usuarios/:id/senha
   * body: { novaSenha }
   */
  async atualizarSenha(req, res) {
    try {
      const id = req.params.id;
      const { novaSenha } = req.body || {};
      if (!id || !novaSenha) {
        logger.warn('[UsuarioController] atualizarSenha faltando parametros.');
        return res.status(400).json({ error: 'ID e novaSenha são obrigatórios.' });
      }

      const resultado = await UsuarioService.atualizarSenha(id, novaSenha);
      return res.status(200).json(resultado);
    } catch (err) {
      logger.error('[UsuarioController] Erro ao atualizar senha:', err.message || err);
      const status = err.status || 500;
      return res.status(status).json({ error: status === 500 ? 'Erro interno no servidor.' : err.message });
    }
  }

  /**
   * PATCH /usuarios/:id/foto
   * body: { novaFoto }
   */
  async atualizarFotoPerfil(req, res) {
    try {
      const id = req.params.id;
      const { novaFoto } = req.body || {};
      if (!id || !novaFoto) {
        logger.warn('[UsuarioController] atualizarFotoPerfil faltando parametros.');
        return res.status(400).json({ error: 'ID e novaFoto são obrigatórios.' });
      }

      const resultado = await UsuarioService.atualizarFotoPerfil(id, novaFoto);
      return res.status(200).json(resultado);
    } catch (err) {
      logger.error('[UsuarioController] Erro ao atualizar foto de perfil:', err.message || err);
      const status = err.status || 500;
      return res.status(status).json({ error: status === 500 ? 'Erro interno no servidor.' : err.message });
    }
  }

  /**
   * POST /usuarios/:id/ativar
   */
  async ativar(req, res) {
    try {
      const id = req.params.id;
      if (!id) {
        logger.warn('[UsuarioController] ativar sem id.');
        return res.status(400).json({ error: 'ID é obrigatório.' });
      }

      const resultado = await UsuarioService.ativar(id);
      return res.status(200).json(resultado);
    } catch (err) {
      logger.error('[UsuarioController] Erro ao ativar usuário:', err.message || err);
      const status = err.status || 500;
      return res.status(status).json({ error: status === 500 ? 'Erro interno no servidor.' : err.message });
    }
  }

  /**
   * POST /usuarios/:id/inativar
   */
  async inativar(req, res) {
    try {
      const id = req.params.id;
      if (!id) {
        logger.warn('[UsuarioController] inativar sem id.');
        return res.status(400).json({ error: 'ID é obrigatório.' });
      }

      const resultado = await UsuarioService.inativar(id);
      return res.status(200).json(resultado);
    } catch (err) {
      logger.error('[UsuarioController] Erro ao inativar usuário:', err.message || err);
      const status = err.status || 500;
      return res.status(status).json({ error: status === 500 ? 'Erro interno no servidor.' : err.message });
    }
  }
}

module.exports = new UsuarioController();
