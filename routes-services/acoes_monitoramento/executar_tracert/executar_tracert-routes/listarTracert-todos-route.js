const express = require('express');
const { listarTracerts } = require('../executar_tracert-services/listarTracert-todos-service');
const chalk = require('chalk');

const router = express.Router();

router.get('/', async (req, res) => {
    console.info(chalk.blue('🔄 Iniciando a requisição para listar todos os Tracerts...'));

    try {
        const tracerts = await listarTracerts();
        console.info(chalk.green(`✅ ${tracerts.length} Tracerts encontrados.`));
        res.status(200).json(tracerts);
    } catch (erro) {
        console.error(chalk.red('❌ Erro ao listar Tracerts:'), erro.message);
        res.status(500).json({ erro: 'Erro ao listar Tracerts.' });
    }
});

module.exports = router;