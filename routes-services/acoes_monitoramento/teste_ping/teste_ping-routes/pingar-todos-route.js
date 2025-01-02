const express = require('express');
const { testarTodosEquipamentos } = require('../teste_ping-services/pingar-todos-service');
const chalk = require('chalk');

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        console.info(chalk.blue('🔍 Iniciando o teste de ping em todos os equipamentos...'));

        const resultados = await testarTodosEquipamentos();
        
        console.log(chalk.green(`✅ Teste de ping concluído para ${resultados.length} equipamentos.`));

        res.status(200).json(resultados);
    } catch (erro) {
        console.error(chalk.red(`❌ Erro ao realizar teste de ping em todos os equipamentos: ${erro.message}`));
        res.status(500).json({ error: 'Erro ao realizar teste de ping em todos os equipamentos.' });
    }
});

module.exports = router;