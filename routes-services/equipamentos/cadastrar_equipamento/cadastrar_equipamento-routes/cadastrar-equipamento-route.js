const express = require('express');
const { cadastrarEquipamento } = require('../cadastrar_equipamento-services/cadastrar-equipamento-service');
const chalk = require('chalk');

const router = express.Router();

router.post('/', express.json(), async (req, res) => {
  console.info(chalk.blue('🔧 Iniciando a requisição para cadastrar novo equipamento...'));

  try {
    console.log(chalk.cyan('📬 Dados recebidos no corpo da requisição:', req.body));

    const resultado = await cadastrarEquipamento(req.body);

    console.log(chalk.green('✅ Equipamento cadastrado com sucesso!'));

    // Retorna a resposta com o resultado
    res.status(201).json(resultado);
  } catch (erro) {
    console.error(chalk.red(`❌ Erro ao cadastrar equipamento: ${erro.message}`));
    res.status(500).json({ error: 'Erro ao cadastrar equipamento.' });
  }
});

module.exports = router;