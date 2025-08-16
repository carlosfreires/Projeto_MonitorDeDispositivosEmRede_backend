// controllers/EquipamentoController.js
const logger = require('../utils/logger/Logger');
const EquipamentoService = require('../services/EquipamentoService');

/**
 * Controller para gerenciar equipamentos.
 * Rotas sugeridas:
 *  - POST   /equipamentos         -> cadastrar
 *  - PUT    /equipamentos/:id     -> atualizar
 *  - DELETE /equipamentos/:id     -> deletarPorId
 *  - GET    /equipamentos         -> listarTodos
 *  - GET    /equipamentos/:id     -> buscarPorId
 *  - GET    /equipamentos/ativos  -> listarAtivos
 */
class EquipamentoController {
  async cadastrar(req, res) {
    try {
      const payload = req.body || {};
      const resultado = await EquipamentoService.cadastrar(payload);
      return res.status(201).json(resultado);
    } catch (err) {
      logger.error('[EquipamentoController] Erro ao cadastrar equipamento:', err.message || err);
      const status = err.status || 500;
      return res.status(status).json({ error: status === 500 ? 'Erro interno no servidor.' : err.message });
    }
  }

  async atualizar(req, res) {
    try {
      const id = req.params.id;
      const dados = req.body || {};
      if (!id) {
        logger.warn('[EquipamentoController] atualizar sem id.');
        return res.status(400).json({ error: 'ID é obrigatório.' });
      }

      const resultado = await EquipamentoService.atualizar(id, dados);
      return res.status(200).json(resultado);
    } catch (err) {
      logger.error('[EquipamentoController] Erro ao atualizar equipamento:', err.message || err);
      const status = err.status || 500;
      return res.status(status).json({ error: status === 500 ? 'Erro interno no servidor.' : err.message });
    }
  }

  async deletarPorId(req, res) {
    try {
      const id = req.params.id;
      if (!id) {
        logger.warn('[EquipamentoController] deletarPorId sem id.');
        return res.status(400).json({ error: 'ID é obrigatório.' });
      }

      const resultado = await EquipamentoService.deletarPorId(id);
      return res.status(200).json(resultado);
    } catch (err) {
      logger.error('[EquipamentoController] Erro ao deletar equipamento:', err.message || err);
      const status = err.status || 500;
      return res.status(status).json({ error: status === 500 ? 'Erro interno no servidor.' : err.message });
    }
  }

  async listarTodos(req, res) {
    try {
      const equipamentos = await EquipamentoService.listarTodos();
      return res.status(200).json(equipamentos);
    } catch (err) {
      logger.error('[EquipamentoController] Erro ao listar equipamentos:', err.message || err);
      const status = err.status || 500;
      return res.status(status).json({ error: status === 500 ? 'Erro interno no servidor.' : err.message });
    }
  }

  async buscarPorId(req, res) {
    try {
      const id = req.params.id;
      if (!id) {
        logger.warn('[EquipamentoController] buscarPorId sem id.');
        return res.status(400).json({ error: 'ID é obrigatório.' });
      }

      const equipamento = await EquipamentoService.buscarPorId(id);
      if (!equipamento) return res.status(404).json({ error: 'Equipamento não encontrado.' });
      return res.status(200).json(equipamento);
    } catch (err) {
      logger.error('[EquipamentoController] Erro ao buscar equipamento por ID:', err.message || err);
      const status = err.status || 500;
      return res.status(status).json({ error: status === 500 ? 'Erro interno no servidor.' : err.message });
    }
  }

  async listarAtivos(req, res) {
    try {
      const ativos = await EquipamentoService.listarAtivos();
      return res.status(200).json(ativos);
    } catch (err) {
      logger.error('[EquipamentoController] Erro ao listar ativos:', err.message || err);
      const status = err.status || 500;
      return res.status(status).json({ error: status === 500 ? 'Erro interno no servidor.' : err.message });
    }
  }
}

module.exports = new EquipamentoController();