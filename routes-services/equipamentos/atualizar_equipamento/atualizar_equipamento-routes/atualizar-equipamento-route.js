const express = require('express');
const { atualizarEquipamento } = require('../atualizar_equipamento-services/atualizar-equipamento-service');
const chalk = require('chalk');

const router = express.Router();

router.put('/:id', express.json(), async (req, res) => {
  console.info(chalk.blue(`🔄 Iniciando atualização do equipamento com ID: ${req.params.id}...`));
  
  try {
    console.log(chalk.cyan(`📝 Dados recebidos para atualização:`, req.body));

    const resultado = await atualizarEquipamento(req.params.id, req.body);
    
    console.log(chalk.green(`✅ Equipamento com ID ${req.params.id} atualizado com sucesso!`));
    
    res.status(200).json(resultado);
  } catch (erro) {
    console.error(chalk.red(`❌ Erro ao atualizar equipamento com ID ${req.params.id}: ${erro.message}`));
    res.status(500).json({ error: 'Erro ao atualizar equipamento.' });
  }
});

module.exports = router;