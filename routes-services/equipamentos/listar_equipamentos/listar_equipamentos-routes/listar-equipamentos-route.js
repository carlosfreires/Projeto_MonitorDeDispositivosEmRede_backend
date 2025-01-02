const express = require('express');
const chalk = require('chalk');
const { listarEquipamentos } = require('../listar_equipamentos-services/listar-eqipamentos-service');

const router = express.Router();

router.get('/', async (req, res) => {
  console.info(chalk.blue('🌐 Rota GET / chamada para listar equipamentos.'));

  try {
    console.info(chalk.cyan('🔍 Chamando o serviço listarEquipamentos.'));
    const equipamentos = await listarEquipamentos();
    console.log(chalk.green(`✅ Equipamentos listados com sucesso. Total: ${equipamentos.length}`));
    res.status(200).json(equipamentos);
  } catch (erro) {
    console.error(chalk.red(`❌ Erro ao listar equipamentos: ${erro.message}`));
    res.status(500).json({ error: 'Erro ao listar equipamentos.' });
  }
});

module.exports = router;