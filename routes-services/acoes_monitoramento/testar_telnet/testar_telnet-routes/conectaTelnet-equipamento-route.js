const express = require('express');
const { testarTelnet } = require('../testar_telnet-services/conectaTelnet-equipamento-service');
const chalk = require('chalk');

const router = express.Router();

router.get('/:id', async (req, res) => {
    const { id } = req.params;

    console.info(chalk.blue(`🔄 Requisição recebida para testar Telnet no equipamento com ID: ${id}...`));

    try {
        console.info(chalk.green(`✅ Iniciando teste Telnet para o equipamento com ID: ${id}...`));

        const resultado = await testarTelnet(id);

        console.log(chalk.green(`✅ Teste Telnet concluído para o equipamento com ID: ${id}.`));

        res.status(200).json(resultado);
    } catch (erro) {
        console.error(chalk.red(`❌ Erro ao testar Telnet no equipamento ${id}: ${erro.message}`));
        
        res.status(500).json({
            equipamentoId: id,
            status: 'falha',
            mensagem: erro.message || 'Erro desconhecido ao realizar teste Telnet.',
        });
    }
});

module.exports = router;