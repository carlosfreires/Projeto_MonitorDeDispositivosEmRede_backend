const express = require('express');
const { executarTracert } = require('../executar_tracert-services/executar-tracert-equipamento-service');
const chalk = require('chalk');

const router = express.Router();

router.post('/:equipamentoId', async (req, res) => {
    const { equipamentoId } = req.params;

    console.info(chalk.blue(`🔄 Iniciando o teste de Tracert para o equipamento ID: ${equipamentoId}...`));

    try {
        console.info(chalk.green(`✅ Executando Tracert para o equipamento ID: ${equipamentoId}...`));

        const resultado = await executarTracert(equipamentoId);

        console.info(chalk.green(`✅ Tracert concluído para o equipamento ID: ${equipamentoId}.`));

        res.status(200).json(resultado);
    } catch (erro) {
        console.error(chalk.red('❌ Erro ao executar Tracert:'), erro.message);

        res.status(500).json({ erro: 'Erro ao executar Tracert.' });
    }
});

module.exports = router;