const express = require('express');
const chalk = require('chalk');
const { listarPorEquipamento } = require('../log-monitoramento-service/listaLog-equipamentos-service');

const router = express.Router();

router.post('/logs/equipamentos', async (req, res) => {
    console.info(chalk.blue('🚀 Endpoint POST /logs/equipamentos acessado.'));

    try {
        const { ids, dataInicial, dataFinal } = req.body;

        // Validação de dados de entrada
        console.log(chalk.cyan(`📥 Parâmetros recebidos: ids=${JSON.stringify(ids)}, dataInicial=${dataInicial}, dataFinal=${dataFinal}`));
        if (!ids || !Array.isArray(ids)) {
            console.warn(chalk.yellow('⚠️ IDs inválidos ou ausentes.'));
            return res.status(400).json({ error: 'IDs inválidos ou ausentes' });
        }

        // Chama o serviço para listar logs
        console.info(chalk.cyan('🔍 Chamando o serviço listarPorEquipamento para recuperar os logs.'));
        const logs = await listarPorEquipamento(ids, dataInicial, dataFinal);

        console.log(chalk.green(`✅ Logs recuperados com sucesso. Total: ${logs.length}`));
        res.status(200).json(logs);
    } catch (error) {
        console.error(chalk.red(`❌ Erro ao processar a requisição: ${error.message}`));
        res.status(500).json({ error: error.message });
    }
});

/*
Como a requisição será feita
Consulta sem filtro de período: Para retornar todos os logs, a requisição pode ser feita com apenas os ids dos equipamentos, sem dataInicial e dataFinal.

Exemplo de corpo da requisição:

{
  "ids": [1, 2, 3]
}
Consulta com filtro de período: Se você quiser filtrar por período, basta enviar os parâmetros dataInicial e dataFinal no formato DD/MM/AAAA HH:MM.

Exemplo de corpo da requisição:

{
  "ids": [1, 2, 3],
  "dataInicial": "01/12/2024 00:00",
  "dataFinal": "29/12/2024 23:59"
}
*/

module.exports = router;
