const express = require('express');
const { atualizarFotoPerfil } = require('../atualiza_foto-services/atualiza-foto-service');
const chalk = require('chalk');

const router = express.Router();

router.put('/:id', express.json(), async (req, res) => {
    console.info(chalk.blue('📥 [Atualização de Foto de Perfil - Rota] Recebendo requisição para atualizar a foto de perfil do usuário...'));
    console.log(chalk.cyan(`🔑 ID do Usuário: ${req.params.id}, Corpo da Requisição: ${JSON.stringify(req.body)}`));

    try {
        const { id } = req.params;
        const { fotoPerfilUrl } = req.body;

        if (!fotoPerfilUrl) {
            console.warn(chalk.yellow('⚠️ [Atualização de Foto de Perfil - Rota] Campo "fotoPerfilUrl" ausente no corpo da requisição.'));
            return res.status(400).json({ erro: 'O campo "fotoPerfilUrl" é obrigatório.' });
        }

        console.info(chalk.blue('🛠️ [Atualização de Foto de Perfil - Rota] Chamando serviço de atualização de foto de perfil...'));
        await atualizarFotoPerfil(req, res);

        console.info(chalk.green('✅ [Atualização de Foto de Perfil - Rota] Foto de perfil atualizada com sucesso.'));
    } catch (erro) {
        console.error(chalk.red('❌ [Atualização de Foto de Perfil - Rota] Erro ao atualizar a foto de perfil.'));
        console.error(chalk.red(`🛑 Detalhes do erro: ${erro.message}`));

        res.status(500).json({ error: 'Erro ao atualizar foto de perfil do usuário.' });
    } finally {
        console.info(chalk.blue('🔄 [Atualização de Foto de Perfil - Rota] Finalizando processamento da requisição.'));
    }
});

module.exports = router;