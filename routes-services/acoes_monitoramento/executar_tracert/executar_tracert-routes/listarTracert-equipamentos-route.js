const express = require('express');
const { listarTracertsPorEquipamentos } = require('../executar_tracert-services/listarTracert-equipamentos-service');
const chalk = require('chalk');

const router = express.Router();

router.post('/', async (req, res) => {
    console.info(chalk.blue('🔄 Iniciando a requisição para listar Tracerts para equipamentos específicos...'));

    try {
        const { equipamentosIds } = req.body;

        if (!Array.isArray(equipamentosIds) || equipamentosIds.length === 0) {
            console.warn(chalk.yellow('⚠️ Nenhum ID de equipamento fornecido ou lista vazia.'));
            return res.status(400).json({ erro: 'A lista de IDs de equipamentos não pode ser vazia.' });
        }

        console.info(chalk.green(`✅ Recebidos ${equipamentosIds.length} IDs de equipamentos para o Tracert.`));

        const tracerts = await listarTracertsPorEquipamentos(equipamentosIds);
        console.info(chalk.green(`✅ Tracerts encontrados: ${tracerts.length}`));

        res.status(200).json(tracerts);
    } catch (erro) {
        console.error(chalk.red('❌ Erro ao listar Tracerts por equipamentos:'), erro.message);
        res.status(500).json({ erro: 'Erro ao listar Tracerts por equipamentos.' });
    }
});

module.exports = router;