const express = require('express');
const { realizarTestePing } = require('../teste_ping-services/pingar-equipamento-service');
const chalk = require('chalk');

const router = express.Router();

router.get('/:id', async (req, res) => {
    const id = Number(req.params.id);

    // Verifica se o ID é válido
    if (isNaN(id)) {
        console.error(chalk.red(`❌ ID do equipamento inválido: ${req.params.id}. Deve ser um número.`));
        return res.status(400).json({ error: 'ID do equipamento inválido. Deve ser um número.' });
    }

    try {
        console.info(chalk.blue(`🔍 Iniciando o teste de ping para o equipamento ID: ${id}...`));

        const resultado = await realizarTestePing(id);

        console.log(chalk.green(`✅ Teste de ping concluído com sucesso para o equipamento ID: ${id}.`));

        res.status(200).json({ ...resultado });
    } catch (erro) {
        console.error(chalk.red(`❌ Erro ao realizar teste de ping no equipamento ${id}:`, erro.message));
        res.status(500).json({ error: `Erro ao realizar teste de ping no equipamento ${id}.` });
    }
});

module.exports = router;