const express = require('express');
const { listarTestesPingPorEquipamentos } = require('../teste_ping-services/listarPingTest-equipamentos-service');
const chalk = require('chalk');

const router = express.Router();

router.post('/', async (req, res) => {
    const { equipamentos } = req.body; // Ex: [1, 2, 3]

    try {
        if (!Array.isArray(equipamentos)) {
            console.warn(chalk.yellow('⚠️ A lista de equipamentos fornecida não é um array válido.'));

            return res.status(400).json({ error: 'A lista de equipamentos deve ser um array de IDs.' });
        }

        console.info(chalk.blue('🔍 Iniciando a busca pelos testes de ping para os equipamentos:', equipamentos));

        const resultados = await listarTestesPingPorEquipamentos(equipamentos);

        console.log(chalk.green(`✅ Testes de ping listados com sucesso. Total de ${resultados.length} testes encontrados.`));

        res.status(200).json(resultados);
    } catch (erro) {
        console.error(chalk.red(`❌ Erro ao listar informações de teste de ping para os equipamentos fornecidos: ${erro.message}`));
        res.status(500).json({ error: 'Erro ao listar informações de teste de ping para os equipamentos fornecidos.' });
    }
});

module.exports = router;