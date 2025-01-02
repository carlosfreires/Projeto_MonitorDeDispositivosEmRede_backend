const express = require('express');
const { listarTodosTestesPing } = require('../teste_ping-services/listarPingTest-todos-service');
const chalk = require('chalk');

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        console.info(chalk.blue('🔍 Iniciando a listagem de todos os testes de ping...'));

        const resultados = await listarTodosTestesPing();

        console.log(chalk.green(`✅ Listagem de testes de ping concluída com sucesso. Total de ${resultados.length} testes encontrados.`));

        res.status(200).json(resultados);
    } catch (erro) {
        console.error(chalk.red(`❌ Erro ao listar informações de teste de ping: ${erro.message}`));
        res.status(500).json({ error: 'Erro ao listar informações de teste de ping.' });
    }
});

module.exports = router;