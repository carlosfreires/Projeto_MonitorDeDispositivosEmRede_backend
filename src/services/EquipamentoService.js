// services/EquipamentoService.js
const EquipamentoRepository = require('../repositories/EquipamentoRepository');
const logger = require('../utils/logger/Logger');

class EquipamentoService {
  #validarPayloadCadastro({ nome, mac }) {
    const erros = [];
    if (!nome || !String(nome).trim()) erros.push('nome é obrigatório');
    if (!mac || !String(mac).trim()) erros.push('mac é obrigatório');
    if (erros.length) {
      const erro = new Error(`Payload inválido: ${erros.join(', ')}`);
      erro.status = 400;
      throw erro;
    }
  }

  async cadastrar(payload) {
    logger.info('Iniciando cadastro de equipamento.');
    this.#validarPayloadCadastro(payload);
    logger.debug('Payload de cadastro recebido:', payload);
    try {
      const resultado = await EquipamentoRepository.create(payload);
      const insertedId = resultado.insertId ?? null;
      logger.success(`Equipamento cadastrado. ID: ${insertedId}`);
      return { message: 'Equipamento cadastrado com sucesso!', equipamentoID: insertedId };
    } catch (err) {
      logger.error('Erro no serviço de cadastro de equipamento:', err.message || err);
      // relança o erro original (mantendo status quando houver)
      throw err;
    }
  }

  async atualizar(id, dados) {
    logger.info(`Iniciando atualização do equipamento com ID: ${id}`);
    logger.debug('Dados recebidos para atualização:', dados);
    try {
      const existente = await EquipamentoRepository.findById(id);
      if (!existente) {
        logger.warn(`Nenhum equipamento encontrado com ID ${id}.`);
        const erro = new Error('Equipamento não encontrado');
        erro.status = 404;
        throw erro;
      }
      const resultado = await EquipamentoRepository.update(id, dados);
      logger.success(`Equipamento com ID ${id} atualizado com sucesso.`);
      return { message: 'Equipamento atualizado com sucesso!', affectedRows: resultado.affectedRows ?? 0 };
    } catch (err) {
      logger.error(`Erro no serviço de atualização de equipamento com ID ${id}:`, err.message || err);
      throw err;
    }
  }

  async deletarPorId(id) {
    logger.info(`Iniciando remoção do equipamento com ID: ${id}`);
    try {
      const resultado = await EquipamentoRepository.deleteById(id);
      if (resultado && resultado.affectedRows) {
        logger.success(`Equipamento com ID ${id} deletado com sucesso.`);
        return { message: 'Equipamento deletado com sucesso!', affectedRows: resultado.affectedRows };
      } else {
        logger.warn(`Nenhum equipamento encontrado para deletar com ID ${id}.`);
        const erro = new Error('Equipamento não encontrado');
        erro.status = 404;
        throw erro;
      }
    } catch (err) {
      logger.error('Erro ao deletar equipamento:', err.message || err);
      throw err;
    }
  }

  async listarTodos() {
    logger.info('Listando todos os equipamentos.');
    try {
      const equipamentos = await EquipamentoRepository.findAll();
      logger.success(`Equipamentos listados com sucesso. Total: ${equipamentos.length}`);
      return equipamentos;
    } catch (err) {
      logger.error('Erro ao listar equipamentos:', err.message || err);
      throw err;
    }
  }

  async buscarPorId(id) {
    logger.info(`Buscando equipamento por ID: ${id}`);
    try {
      const equipamento = await EquipamentoRepository.findById(id);
      return equipamento && equipamento.isActive() ? equipamento : null;
    } catch (err) {
      logger.error('Erro ao buscar equipamento por ID:', err.message || err);
      throw err;
    }
  }

  async listarAtivos() {
    logger.info('Listando equipamentos ativos.');
    try {
      return await EquipamentoRepository.findActive();
    } catch (err) {
      logger.error('Erro ao listar equipamentos ativos:', err.message || err);
      throw err;
    }
  }
}

module.exports = new EquipamentoService();
