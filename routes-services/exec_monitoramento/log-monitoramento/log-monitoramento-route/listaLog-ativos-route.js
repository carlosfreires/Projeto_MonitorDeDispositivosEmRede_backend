const express = require('express');
const chalk = require('chalk');
const { listarLogsAtivos } = require('../log-monitoramento-service/listaLog-ativos-service');

const router = express.Router();

router.get('/logs/ativos', async (req, res) => {
    console.info(chalk.blue('🚀 Endpoint GET /logs/ativos acessado.'));

    try {
        const { dataInicial, dataFinal } = req.query; // Usando query params para data
        console.log(chalk.cyan(`📥 Parâmetros recebidos: dataInicial=${dataInicial}, dataFinal=${dataFinal}`));

        // Chama o serviço que retorna os logs dos equipamentos ativos
        console.info(chalk.cyan('🔍 Chamando o serviço listarLogsAtivos para recuperar os logs dos equipamentos ativos.'));
        const logs = await listarLogsAtivos(dataInicial, dataFinal);

        console.log(chalk.green(`✅ Logs recuperados com sucesso. Total: ${logs.length}`));
        res.status(200).json(logs);
    } catch (error) {
        console.error(chalk.red(`❌ Erro ao processar a requisição: ${error.message}`));
        res.status(500).json({ error: error.message });
    }
});

/*
Como a requisição será feita
Consulta sem filtro de período: Para retornar todos os logs, a requisição pode ser feita sem dataInicial e dataFinal.

Exemplo de URL para consulta:
GET /logs/ativos

Consulta com filtro de período: Se você quiser filtrar por período, basta enviar os parâmetros dataInicial e dataFinal no formato DD/MM/AAAA HH:MM.

Exemplo de URL para consulta:
GET /logs/ativos?dataInicial=01/12/2024%2000:00&dataFinal=29/12/2024%2023:59
*/

module.exports = router;
