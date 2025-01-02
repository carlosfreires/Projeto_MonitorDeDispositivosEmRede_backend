const express = require('express');
const { testarTodosEquipamentosTelnet } = require('../testar_telnet-services/conectaTelnet-todos-service');
const chalk = require('chalk');

const router = express.Router();

router.get('/', async (req, res) => {
    console.info(chalk.blue('🔄 Requisição recebida para testar Telnet em todos os equipamentos...'));

    try {
        console.info(chalk.green('✅ Iniciando teste Telnet em todos os equipamentos ativos...'));
        
        const resultados = await testarTodosEquipamentosTelnet();
        
        console.log(chalk.green('✅ Testes Telnet concluídos com sucesso!'));

        res.status(200).json({ 
            message: 'Testes Telnet concluídos.', 
            resultados 
        });
    } catch (erro) {
        console.error(chalk.red(`❌ Erro ao testar Telnet em todos os equipamentos: ${erro.message}`));
        res.status(500).json({ error: 'Erro ao realizar teste Telnet em todos os equipamentos.' });
    }
});

module.exports = router;