const express = require('express');
const chalk = require('chalk');
const { listarTodos } = require('../log-monitoramento-service/listaLog-todos-service');

const router = express.Router();

router.post('/logs', async (req, res) => {
    console.info(chalk.blue('🚀 Endpoint POST /logs acessado.'));

    try {
        const { dataInicial, dataFinal } = req.body;

        console.log(chalk.cyan(`📥 Parâmetros recebidos: dataInicial=${dataInicial}, dataFinal=${dataFinal}`));

        // Chama o serviço para listar logs, passando os parâmetros de data
        console.info(chalk.cyan('🔍 Chamando o serviço listarTodos para recuperar os logs.'));
        const logs = await listarTodos(dataInicial, dataFinal);

        console.log(chalk.green(`✅ Logs recuperados com sucesso. Total: ${logs.length}`));
        res.status(200).json(logs);

    } catch (error) {
        console.error(chalk.red(`❌ Erro ao processar a requisição: ${error.message}`));
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;