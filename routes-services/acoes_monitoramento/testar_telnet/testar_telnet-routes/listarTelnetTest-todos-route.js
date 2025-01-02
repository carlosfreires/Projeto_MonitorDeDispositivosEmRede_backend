const express = require('express');
const { listarTodosTestesTelnet } = require('../testar_telnet-services/listarTelnetTest-todos-service');
const chalk = require('chalk');

const router = express.Router();

/**
 * Rota para listar todas as informações de teste de Telnet.
 */
router.get('/', async (req, res) => {
    console.info(chalk.blue('🔄 Requisição para listar todos os testes Telnet iniciada...'));

    try {
        const resultados = await listarTodosTestesTelnet();
        
        console.log(chalk.green('✅ Testes de Telnet listados com sucesso!'));

        res.status(200).json(resultados);
    } catch (erro) {
        console.error(chalk.red(`❌ Erro ao listar informações de teste de Telnet: ${erro.message}`));
        res.status(500).json({ error: 'Erro ao listar informações de teste de Telnet.' });
    }
});

module.exports = router;