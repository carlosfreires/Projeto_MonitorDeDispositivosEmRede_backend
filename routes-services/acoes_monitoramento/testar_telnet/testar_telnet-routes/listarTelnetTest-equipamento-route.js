const express = require('express');
const { listarTestesTelnetPorEquipamentos } = require('../testar_telnet-services/listarTelnetTest-equipamento-service');
const chalk = require('chalk');

const router = express.Router();

router.post('/', async (req, res) => {
    const { equipamentos } = req.body; // Ex: [1, 2, 3]

    console.info(chalk.blue('🔄 Requisição para listar testes Telnet para equipamentos recebida...'));

    try {
        if (!Array.isArray(equipamentos)) {
            console.error(chalk.yellow('⚠️ A lista de equipamentos não é um array. Retornando erro...'));
            return res.status(400).json({ error: 'A lista de equipamentos deve ser um array de IDs.' });
        }

        console.info(chalk.green('✅ Lista de equipamentos válida recebida. Iniciando consulta dos testes Telnet...'));

        const resultados = await listarTestesTelnetPorEquipamentos(equipamentos);
        
        console.log(chalk.green('✅ Testes Telnet para os equipamentos listados com sucesso!'));

        res.status(200).json(resultados);
    } catch (erro) {
        console.error(chalk.red(`❌ Erro ao listar informações de teste de Telnet para os equipamentos fornecidos: ${erro.message}`));
        res.status(500).json({ error: 'Erro ao listar informações de teste de Telnet para os equipamentos fornecidos.' });
    }
});

module.exports = router;