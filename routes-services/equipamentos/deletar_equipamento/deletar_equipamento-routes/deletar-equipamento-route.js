const express = require('express');
const chalk = require('chalk');
const { deletarEquipamento } = require('../deletar_equipamento-services/deletar-equipamento-service');

const router = express.Router();

router.delete('/:id', async (req, res) => {
  const idEquipamento = req.params.id;
  console.info(chalk.blue('🗑️ Requisição recebida para deletar equipamento.'));
  console.log(chalk.cyan(`🔧 ID do equipamento recebido: ${idEquipamento}`));

  try {
    const resultado = await deletarEquipamento(idEquipamento);
    console.log(chalk.green('✅ Equipamento deletado com sucesso.'));
    res.status(200).json(resultado);
  } catch (erro) {
    console.error(chalk.red(`❌ Erro ao deletar equipamento: ${erro.message}`));
    res.status(500).json({ error: 'Erro ao deletar equipamento.' });
  }
});

module.exports = router;