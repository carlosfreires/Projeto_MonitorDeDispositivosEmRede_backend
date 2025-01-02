const express = require('express');
const { solicitarAtualizacaoPerfil } = require('../atualiza_perfil-services/atualiza-perfil-service');
const chalk = require('chalk');

const router = express.Router();

router.post('/:id', async (req, res) => {
    const { id } = req.params;
    const { novoPerfil, motivo } = req.body;

    try {
        console.info(chalk.yellow(`📥 Recebendo solicitação de atualização de perfil para ID: ${id}`));
        await solicitarAtualizacaoPerfil({ idUsuario: id, novoPerfil, motivo });
        res.status(200).json({ mensagem: 'Solicitação de atualização de perfil enviada com sucesso.' });
    } catch (error) {
        console.error(chalk.red(`❌ Erro na rota de atualização de perfil: ${error.message}`));
        res.status(500).json({ erro: error.message });
    }
});

module.exports = router;